<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../../config/database.php';

class AdminController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    // ============================================================
    // NOVELS
    // ============================================================

    /** GET /api/admin/novels — list novels the requesting user can manage */
    public function listNovels(): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $pdo = Database::connection();

        $isAdmin = $payload['role'] === 'admin';
        $sql = "
            SELECT n.id, n.slug, n.is_featured, n.rating_avg, n.rating_count, n.views_count,
                   n.created_at, pn.name AS pen_name, pn.id AS pen_name_id
            FROM novels n
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
        ";
        $params = [];
        if (!$isAdmin) {
            $sql .= " WHERE pn.user_id = ?";
            $params[] = $payload['sub'];
        }
        $sql .= " ORDER BY n.updated_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $novels = $stmt->fetchAll();

        if (empty($novels)) {
            Response::success([]);
        }

        $novelIds = array_column($novels, 'id');
        $placeholders = implode(',', array_fill(0, count($novelIds), '?'));
        $transStmt = $pdo->prepare("
            SELECT novel_id, language, title, status, publish_status, chapters_count
            FROM novel_translations WHERE novel_id IN ($placeholders)
        ");
        $transStmt->execute($novelIds);
        $translationsByNovel = [];
        foreach ($transStmt->fetchAll() as $t) {
            $translationsByNovel[$t['novel_id']][] = [
                'language' => $t['language'],
                'title' => $t['title'],
                'status' => $t['status'],
                'publishStatus' => $t['publish_status'],
                'chaptersCount' => (int) $t['chapters_count'],
            ];
        }

        Response::success(array_map(fn($n) => [
            'id' => (int) $n['id'],
            'slug' => $n['slug'],
            'penName' => $n['pen_name'],
            'penNameId' => (int) $n['pen_name_id'],
            'isFeatured' => (bool) $n['is_featured'],
            'rating' => (float) $n['rating_avg'],
            'views' => (int) $n['views_count'],
            'translations' => $translationsByNovel[$n['id']] ?? [],
        ], $novels));
    }

    /** GET /api/admin/novels/{id} — full detail incl. all translations */
    public function showNovel(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $novel = $this->getOwnedNovelOr404((int) $id, $payload);

        $pdo = Database::connection();
        $transStmt = $pdo->prepare("SELECT * FROM novel_translations WHERE novel_id = ? ORDER BY language ASC");
        $transStmt->execute([$novel['id']]);

        $genreStmt = $pdo->prepare("SELECT g.id, g.name FROM novel_genres ng INNER JOIN genres g ON g.id = ng.genre_id WHERE ng.novel_id = ?");
        $genreStmt->execute([$novel['id']]);

        Response::success([
            'id' => (int) $novel['id'],
            'slug' => $novel['slug'],
            'penNameId' => (int) $novel['pen_name_id'],
            'isFeatured' => (bool) $novel['is_featured'],
            'genres' => $genreStmt->fetchAll(),
            'translations' => array_map(fn($t) => [
                'id' => (int) $t['id'],
                'language' => $t['language'],
                'title' => $t['title'],
                'slug' => $t['slug'],
                'cover' => $t['cover'],
                'synopsis' => $t['synopsis'],
                'status' => $t['status'],
                'publishStatus' => $t['publish_status'],
                'chaptersCount' => (int) $t['chapters_count'],
            ], $transStmt->fetchAll()),
        ]);
    }

    /** POST /api/admin/novels — creates the novel + its first language edition in one call */
    public function createNovel(): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $data = $this->body();

        (new Validator($data))
            ->required('penNameId', 'Pen name')
            ->required('language', 'Language')
            ->required('title', 'Title')
            ->maxLength('title', 200)
            ->required('synopsis', 'Synopsis')
            ->validate();

        $this->verifyPenNameOwnership((int) $data['penNameId'], $payload);

        $pdo = Database::connection();
        $slug = $this->uniqueSlug('novels', $this->slugify($data['title']));

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO novels (pen_name_id, slug) VALUES (?, ?)");
            $stmt->execute([$data['penNameId'], $slug]);
            $novelId = (int) $pdo->lastInsertId();

            $translationId = $this->insertTranslation($novelId, $data);

            if (!empty($data['genreIds']) && is_array($data['genreIds'])) {
                $this->syncGenres($novelId, $data['genreIds']);
            }
            if (!empty($data['tagIds']) && is_array($data['tagIds'])) {
                $this->syncTags($novelId, $data['tagIds']);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Response::success(['novelId' => $novelId, 'translationId' => $translationId, 'slug' => $slug], 'Novel created.', 201);
    }

    /** POST /api/admin/novels/{id}/translations — add another language edition to an existing novel */
    public function addTranslation(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $novel = $this->getOwnedNovelOr404((int) $id, $payload);
        $data = $this->body();

        (new Validator($data))
            ->required('language', 'Language')
            ->required('title', 'Title')
            ->required('synopsis', 'Synopsis')
            ->validate();

        $pdo = Database::connection();
        $existsStmt = $pdo->prepare("SELECT id FROM novel_translations WHERE novel_id = ? AND language = ?");
        $existsStmt->execute([$novel['id'], $data['language']]);
        if ($existsStmt->fetch()) {
            Response::error('This novel already has a ' . $data['language'] . ' edition.', 409);
        }

        $translationId = $this->insertTranslation((int) $novel['id'], $data);
        Response::success(['translationId' => $translationId], 'Language edition added.', 201);
    }

    /** PUT /api/admin/translations/{id} — edit a language edition's metadata (title/synopsis/cover/status) */
    public function updateTranslation(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $translation = $this->getOwnedTranslationOr404((int) $id, $payload);
        $data = $this->body();

        $fields = [];
        $params = [];
        foreach (['title' => 'title', 'synopsis' => 'synopsis', 'cover' => 'cover'] as $input => $column) {
            if (isset($data[$input])) {
                $fields[] = "$column = ?";
                $params[] = $data[$input];
            }
        }
        if (isset($data['status']) && in_array($data['status'], ['ongoing', 'completed', 'hiatus'], true)) {
            $fields[] = 'status = ?';
            $params[] = $data['status'];
        }
        if (isset($data['publishStatus']) && in_array($data['publishStatus'], ['draft', 'published', 'unpublished'], true)) {
            $fields[] = 'publish_status = ?';
            $params[] = $data['publishStatus'];
            if ($data['publishStatus'] === 'published') {
                $fields[] = 'published_at = COALESCE(published_at, NOW())';
            }
        }

        if (empty($fields)) {
            Response::error('No valid fields provided to update.', 422);
        }

        $params[] = $translation['id'];
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE novel_translations SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        Response::success(null, 'Translation updated.');
    }

    // ============================================================
    // CHAPTERS (per language edition)
    // ============================================================

    /** GET /api/admin/translations/{id}/chapters — full chapter list incl. drafts/scheduled, for the admin dashboard */
    public function listChapters(string $translationId): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $translation = $this->getOwnedTranslationOr404((int) $translationId, $payload);

        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT id, number, title, word_count, is_premium, coin_cost, publish_status, published_at, created_at
            FROM chapters WHERE novel_translation_id = ? ORDER BY number ASC
        ");
        $stmt->execute([$translation['id']]);

        Response::success(array_map(function ($c) {
            $isScheduled = $c['publish_status'] === 'published' && $c['published_at'] && strtotime($c['published_at']) > time();
            return [
                'id' => (int) $c['id'],
                'number' => (int) $c['number'],
                'title' => $c['title'],
                'wordCount' => (int) $c['word_count'],
                'isPremium' => (bool) $c['is_premium'],
                'coinCost' => (int) $c['coin_cost'],
                'publishStatus' => $isScheduled ? 'scheduled' : $c['publish_status'],
                'publishedAt' => $c['published_at'],
            ];
        }, $stmt->fetchAll()));
    }

    /** POST /api/admin/translations/{id}/chapters */
    public function createChapter(string $translationId): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $translation = $this->getOwnedTranslationOr404((int) $translationId, $payload);
        $data = $this->body();

        (new Validator($data))
            ->required('number', 'Chapter number')
            ->required('title', 'Title')
            ->required('content', 'Content')
            ->validate();

        $pdo = Database::connection();
        $dupStmt = $pdo->prepare("SELECT id FROM chapters WHERE novel_translation_id = ? AND number = ?");
        $dupStmt->execute([$translation['id'], $data['number']]);
        if ($dupStmt->fetch()) {
            Response::error("Chapter {$data['number']} already exists for this language edition.", 409);
        }

        $publishStatus = $data['publishStatus'] ?? 'draft';
        $publishedAt = $data['publishedAt'] ?? ($publishStatus === 'published' ? date('Y-m-d H:i:s') : null);
        $wordCount = str_word_count(strip_tags($data['content']));

        $stmt = $pdo->prepare("
            INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $translation['id'],
            $data['number'],
            $data['title'],
            $data['content'],
            $wordCount,
            !empty($data['isPremium']) ? 1 : 0,
            $data['coinCost'] ?? 0,
            $publishStatus,
            $publishedAt,
        ]);
        $chapterId = (int) $pdo->lastInsertId();

        $this->recalcChaptersCount((int) $translation['id']);

        Response::success(['chapterId' => $chapterId], 'Chapter created.', 201);
    }

    /** PUT /api/admin/chapters/{id} — edit content, premium/coin settings, or (re)schedule publishing */
    public function updateChapter(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $chapter = $this->getOwnedChapterOr404((int) $id, $payload);
        $data = $this->body();

        $fields = [];
        $params = [];

        if (isset($data['title'])) {
            $fields[] = 'title = ?';
            $params[] = $data['title'];
        }
        if (isset($data['content'])) {
            $fields[] = 'content = ?';
            $params[] = $data['content'];
            $fields[] = 'word_count = ?';
            $params[] = str_word_count(strip_tags($data['content']));
        }
        if (isset($data['isPremium'])) {
            $fields[] = 'is_premium = ?';
            $params[] = $data['isPremium'] ? 1 : 0;
        }
        if (isset($data['coinCost'])) {
            $fields[] = 'coin_cost = ?';
            $params[] = (int) $data['coinCost'];
        }
        if (isset($data['publishStatus']) && in_array($data['publishStatus'], ['draft', 'published'], true)) {
            $fields[] = 'publish_status = ?';
            $params[] = $data['publishStatus'];
        }
        if (array_key_exists('publishedAt', $data)) {
            // Lets the admin schedule a future date, or clear it back to null (unscheduled draft).
            $fields[] = 'published_at = ?';
            $params[] = $data['publishedAt'];
        }

        if (empty($fields)) {
            Response::error('No valid fields provided to update.', 422);
        }

        $params[] = $chapter['id'];
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE chapters SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        $this->recalcChaptersCount((int) $chapter['novel_translation_id']);

        Response::success(null, 'Chapter updated.');
    }

    /** DELETE /api/admin/chapters/{id} */
    public function deleteChapter(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $chapter = $this->getOwnedChapterOr404((int) $id, $payload);

        $pdo = Database::connection();
        $stmt = $pdo->prepare("DELETE FROM chapters WHERE id = ?");
        $stmt->execute([$chapter['id']]);

        $this->recalcChaptersCount((int) $chapter['novel_translation_id']);

        Response::success(null, 'Chapter deleted.');
    }

    // ============================================================
    // Helpers
    // ============================================================

    private function insertTranslation(int $novelId, array $data): int
    {
        $pdo = Database::connection();
        $slug = $this->uniqueSlug('novel_translations', $this->slugify($data['title']));

        $stmt = $pdo->prepare("
            INSERT INTO novel_translations (novel_id, language, title, slug, cover, synopsis, status, publish_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
        ");
        $stmt->execute([
            $novelId,
            $data['language'],
            $data['title'],
            $slug,
            $data['cover'] ?? null,
            $data['synopsis'],
            $data['status'] ?? 'ongoing',
        ]);
        return (int) $pdo->lastInsertId();
    }

    private function recalcChaptersCount(int $translationId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            UPDATE novel_translations SET chapters_count = (
                SELECT COUNT(*) FROM chapters
                WHERE novel_translation_id = ? AND publish_status = 'published' AND published_at <= NOW()
            ), updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$translationId, $translationId]);
    }

    private function syncGenres(int $novelId, array $genreIds): void
    {
        $pdo = Database::connection();
        $del = $pdo->prepare("DELETE FROM novel_genres WHERE novel_id = ?");
        $del->execute([$novelId]);
        $ins = $pdo->prepare("INSERT INTO novel_genres (novel_id, genre_id) VALUES (?, ?)");
        foreach ($genreIds as $genreId) {
            $ins->execute([$novelId, (int) $genreId]);
        }
    }

    private function syncTags(int $novelId, array $tagIds): void
    {
        $pdo = Database::connection();
        $del = $pdo->prepare("DELETE FROM novel_tags WHERE novel_id = ?");
        $del->execute([$novelId]);
        $ins = $pdo->prepare("INSERT INTO novel_tags (novel_id, tag_id) VALUES (?, ?)");
        foreach ($tagIds as $tagId) {
            $ins->execute([$novelId, (int) $tagId]);
        }
    }

    private function slugify(string $text): string
    {
        $slug = strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }

    private function uniqueSlug(string $table, string $baseSlug): string
    {
        $pdo = Database::connection();
        $slug = $baseSlug;
        $i = 2;
        $stmt = $pdo->prepare("SELECT id FROM $table WHERE slug = ?");
        while (true) {
            $stmt->execute([$slug]);
            if (!$stmt->fetch()) {
                return $slug;
            }
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }
    }

    private function verifyPenNameOwnership(int $penNameId, array $payload): void
    {
        if ($payload['role'] === 'admin') {
            return;
        }
        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT id FROM pen_names WHERE id = ? AND user_id = ?");
        $stmt->execute([$penNameId, $payload['sub']]);
        if (!$stmt->fetch()) {
            Response::error('You do not own this pen name.', 403);
        }
    }

    private function getOwnedNovelOr404(int $novelId, array $payload): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT n.* FROM novels n
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
            WHERE n.id = ?" . ($payload['role'] === 'admin' ? '' : ' AND pn.user_id = ?')
        );
        $params = $payload['role'] === 'admin' ? [$novelId] : [$novelId, $payload['sub']];
        $stmt->execute($params);
        $novel = $stmt->fetch();
        if (!$novel) {
            Response::error('Novel not found or you do not have access to it.', 404);
        }
        return $novel;
    }

    private function getOwnedTranslationOr404(int $translationId, array $payload): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT nt.* FROM novel_translations nt
            INNER JOIN novels n ON n.id = nt.novel_id
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
            WHERE nt.id = ?" . ($payload['role'] === 'admin' ? '' : ' AND pn.user_id = ?')
        );
        $params = $payload['role'] === 'admin' ? [$translationId] : [$translationId, $payload['sub']];
        $stmt->execute($params);
        $translation = $stmt->fetch();
        if (!$translation) {
            Response::error('Language edition not found or you do not have access to it.', 404);
        }
        return $translation;
    }

    private function getOwnedChapterOr404(int $chapterId, array $payload): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT c.* FROM chapters c
            INNER JOIN novel_translations nt ON nt.id = c.novel_translation_id
            INNER JOIN novels n ON n.id = nt.novel_id
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
            WHERE c.id = ?" . ($payload['role'] === 'admin' ? '' : ' AND pn.user_id = ?')
        );
        $params = $payload['role'] === 'admin' ? [$chapterId] : [$chapterId, $payload['sub']];
        $stmt->execute($params);
        $chapter = $stmt->fetch();
        if (!$chapter) {
            Response::error('Chapter not found or you do not have access to it.', 404);
        }
        return $chapter;
    }
}
