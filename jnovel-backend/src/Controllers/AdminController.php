<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Models/Notification.php';
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

    /** GET /api/admin/novels */
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
            SELECT id, novel_id, language, title, status, publish_status, chapters_count
            FROM novel_translations WHERE novel_id IN ($placeholders)
        ");
        $transStmt->execute($novelIds);
        $translationsByNovel = [];
        foreach ($transStmt->fetchAll() as $t) {
            $translationsByNovel[$t['novel_id']][] = [
                'id' => (int) $t['id'],
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

    /** GET /api/admin/novels/{id} */
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

    /** POST /api/admin/novels */
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

    /** DELETE /api/admin/novels/{id} */
    public function deleteNovel(string $id): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $novel = $this->getOwnedNovelOr404((int) $id, $payload);
        $pdo = Database::connection();

        $pdo->beginTransaction();
        try {
            $transStmt = $pdo->prepare("SELECT id FROM novel_translations WHERE novel_id = ?");
            $transStmt->execute([$novel['id']]);
            $translationIds = $transStmt->fetchAll(\PDO::FETCH_COLUMN);

            if (!empty($translationIds)) {
                $placeholders = implode(',', array_fill(0, count($translationIds), '?'));
                $pdo->prepare("DELETE FROM chapters WHERE novel_translation_id IN ($placeholders)")
                    ->execute($translationIds);
            }

            $pdo->prepare("DELETE FROM novel_translations WHERE novel_id = ?")->execute([$novel['id']]);
            $pdo->prepare("DELETE FROM novel_tags WHERE novel_id = ?")->execute([$novel['id']]);
            $pdo->prepare("DELETE FROM novel_genres WHERE novel_id = ?")->execute([$novel['id']]);
            $pdo->prepare("DELETE FROM novels WHERE id = ?")->execute([$novel['id']]);

            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Response::success(null, 'Novel deleted.');
    }

    /** POST /api/admin/novels/{id}/translations */
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

    /** PUT /api/admin/translations/{id} */
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
    // CHAPTERS
    // ============================================================

    /** GET /api/admin/translations/{id}/chapters */
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

    /**
     * POST /api/admin/translations/{id}/chapters/manuscript
     * Multipart: file (.docx or .txt)
     * Optional POST fields: publishStatus, isPremium, coinCost, startNumber
     */
    public function importManuscript(string $translationId): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $translation = $this->getOwnedTranslationOr404((int) $translationId, $payload);

        if (empty($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
            Response::error('Please upload a .docx or .txt file.', 422);
        }

        $name = strtolower($_FILES['file']['name'] ?? '');
        $tmp = $_FILES['file']['tmp_name'];
        $publishStatus = $_POST['publishStatus'] ?? 'draft';
        $isPremium = !empty($_POST['isPremium']);
        $coinCost = (int) ($_POST['coinCost'] ?? 0);
        $startNumber = max(1, (int) ($_POST['startNumber'] ?? 1));

        if (str_ends_with($name, '.docx')) {
            $text = $this->extractTextFromDocx($tmp);
        } elseif (str_ends_with($name, '.txt')) {
            $text = file_get_contents($tmp) ?: '';
        } else {
            Response::error('Only .docx or .txt files are supported.', 422);
        }

        $text = trim(str_replace("\r\n", "\n", $text));
        if ($text === '') {
            Response::error('Could not read any text from the file.', 422);
        }

        $chapters = $this->splitManuscriptIntoChapters($text);
        if (count($chapters) === 0) {
            Response::error('No chapters found. Use headings like "Chapter 1" in the document.', 422);
        }

        $pdo = Database::connection();

        $maxStmt = $pdo->prepare("SELECT COALESCE(MAX(number), 0) AS m FROM chapters WHERE novel_translation_id = ?");
        $maxStmt->execute([$translation['id']]);
        $maxNum = (int) $maxStmt->fetch()['m'];
        $number = max($startNumber, $maxNum + 1);

        $created = [];
        $pdo->beginTransaction();
        try {
            $ins = $pdo->prepare("
                INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $publishedAt = $publishStatus === 'published' ? date('Y-m-d H:i:s') : null;

            foreach ($chapters as $ch) {
                $content = trim($ch['content']);
                if ($content === '') {
                    continue;
                }
                $title = $ch['title'] !== '' ? $ch['title'] : ('Chapter ' . $number);
                $wordCount = str_word_count(strip_tags($content));
                $ins->execute([
                    $translation['id'],
                    $number,
                    $title,
                    $content,
                    $wordCount,
                    $isPremium ? 1 : 0,
                    $coinCost,
                    $publishStatus,
                    $publishedAt,
                ]);
                $created[] = [
                    'chapterId' => (int) $pdo->lastInsertId(),
                    'number' => $number,
                    'title' => $title,
                ];
                $number++;
            }
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        $this->recalcChaptersCount((int) $translation['id']);

        Response::success([
            'createdCount' => count($created),
            'chapters' => $created,
        ], count($created) . ' chapters imported.', 201);
    }

    private function extractTextFromDocx(string $path): string
    {
        if (!class_exists('ZipArchive')) {
            Response::error('Server cannot read DOCX (ZipArchive missing).', 500);
        }
        $zip = new ZipArchive();
        if ($zip->open($path) !== true) {
            Response::error('Could not open DOCX file.', 422);
        }
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($xml === false || $xml === '') {
            Response::error('DOCX has no document.xml.', 422);
        }

        $xml = preg_replace('/<w:tab[^>]*\/>/', "\t", $xml);
        $xml = preg_replace('/<\/w:p>/', "\n", $xml);
        $xml = preg_replace('/<w:br[^>]*\/>/', "\n", $xml);

        $dom = new DOMDocument();
        @$dom->loadXML($xml);
        $text = $dom->textContent ?? '';
        $text = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
        $text = preg_replace("/\n{3,}/", "\n\n", $text);
        return trim($text);
    }

    /** Split on lines like "Chapter 1", "CHAPTER 12: Title", "Ch. 3 - Name" */
    private function splitManuscriptIntoChapters(string $text): array
    {
        $lines = explode("\n", $text);
        \( pattern = '/^(chapter|ch\.?)\s*(\d+)\s*([:.\-\x{2013}\x{2014}]\s*(.+))? \)/iu';

        $chapters = [];
        $currentTitle = '';
        $currentBody = [];
        $foundHeading = false;

        foreach ($lines as $line) {
            $trim = trim($line);
            if (preg_match($pattern, $trim, $m)) {
                $foundHeading = true;
                if ($currentTitle !== '') {
                    $chapters[] = [
                        'title' => $currentTitle,
                        'content' => trim(implode("\n", $currentBody)),
                    ];
                }
                $extra = isset($m[4]) ? trim($m[4]) : '';
                $currentTitle = $extra !== ''
                    ? ('Chapter ' . $m[2] . ': ' . $extra)
                    : ('Chapter ' . $m[2]);
                $currentBody = [];
            } else {
                $currentBody[] = $line;
            }
        }

        if ($currentTitle !== '') {
            $chapters[] = [
                'title' => $currentTitle,
                'content' => trim(implode("\n", $currentBody)),
            ];
        } elseif (!$foundHeading) {
            $chapters = [['title' => 'Chapter 1', 'content' => trim($text)]];
        }

        return array_values(array_filter(
            $chapters,
            static fn(array $c): bool => trim($c['content']) !== ''
        ));
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

        $isLiveNow = $publishStatus === 'published' && $publishedAt && strtotime($publishedAt) <= time();
        if ($isLiveNow) {
            $this->notifyNewChapter((int) $translation['id'], $data['number'], $data['title']);
        }

        Response::success(['chapterId' => $chapterId], 'Chapter created.', 201);
    }

    /** PUT /api/admin/chapters/{id} */
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

        $wasLive = $chapter['publish_status'] === 'published'
            && $chapter['published_at'] && strtotime($chapter['published_at']) <= time();

        $newPublishStatus = $data['publishStatus'] ?? $chapter['publish_status'];
        $newPublishedAt = array_key_exists('publishedAt', $data) ? $data['publishedAt'] : $chapter['published_at'];
        $isLiveNow = $newPublishStatus === 'published' && $newPublishedAt && strtotime($newPublishedAt) <= time();

        if ($isLiveNow && !$wasLive) {
            $this->notifyNewChapter((int) $chapter['novel_translation_id'], $chapter['number'], $data['title'] ?? $chapter['title']);
        }

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
    // GENRES / TAGS
    // ============================================================

    /** POST /api/admin/genres */
    public function createGenre(): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();

        (new Validator($data))
            ->required('name', 'Genre name')
            ->maxLength('name', 60)
            ->validate();

        $pdo = Database::connection();
        $nameCheckStmt = $pdo->prepare("SELECT id FROM genres WHERE name = ?");
        $nameCheckStmt->execute([trim($data['name'])]);
        if ($nameCheckStmt->fetch()) {
            Response::error('A genre with this name already exists.', 409);
        }

        $slug = $this->uniqueSlug('genres', $this->slugify($data['name']));

        $stmt = $pdo->prepare("INSERT INTO genres (name, slug, icon, color, cover) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            trim($data['name']),
            $slug,
            $data['icon'] ?? null,
            $data['color'] ?? null,
            $data['cover'] ?? null,
        ]);

        Response::success([
            'id' => (int) $pdo->lastInsertId(),
            'name' => trim($data['name']),
            'slug' => $slug,
        ], 'Genre created.', 201);
    }

    /** GET /api/admin/tags */
    public function listTags(): void
    {
        AuthMiddleware::requireRole(['author', 'admin']);
        $pdo = Database::connection();
        $stmt = $pdo->query("
            SELECT t.id, t.name, t.slug, COUNT(DISTINCT nvt.novel_id) AS novel_count
            FROM tags t
            LEFT JOIN novel_tags nvt ON nvt.tag_id = t.id
            GROUP BY t.id
            ORDER BY t.name ASC
        ");
        Response::success(array_map(fn($row) => [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'count' => (int) $row['novel_count'],
        ], $stmt->fetchAll()));
    }

    /** POST /api/admin/tags */
    public function createTag(): void
    {
        AuthMiddleware::requireRole(['admin', 'author']);
        $data = $this->body();

        (new Validator($data))
            ->required('name', 'Tag name')
            ->maxLength('name', 60)
            ->validate();

        $pdo = Database::connection();
        $name = trim($data['name']);
        $nameCheck = $pdo->prepare("SELECT id FROM tags WHERE name = ?");
        $nameCheck->execute([$name]);
        if ($nameCheck->fetch()) {
            Response::error('A tag with this name already exists.', 409);
        }

        $slug = $this->uniqueSlug('tags', $this->slugify($name));
        $stmt = $pdo->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
        $stmt->execute([$name, $slug]);

        Response::success([
            'id' => (int) $pdo->lastInsertId(),
            'name' => $name,
            'slug' => $slug,
            'count' => 0,
        ], 'Tag created.', 201);
    }

    // ============================================================
    // DASHBOARD STATISTICS
    // ============================================================

    /** GET /api/admin/stats */
    public function stats(): void
    {
        AuthMiddleware::requireRole(['admin']);
        $pdo = Database::connection();

        $totalUsers = (int) $pdo->query("SELECT COUNT(*) AS c FROM users")->fetch()['c'];
        $totalNovels = (int) $pdo->query("SELECT COUNT(*) AS c FROM novels")->fetch()['c'];
        $totalChapters = (int) $pdo->query("SELECT COUNT(*) AS c FROM chapters")->fetch()['c'];
        $publishedChapters = (int) $pdo->query("
            SELECT COUNT(*) AS c FROM chapters WHERE publish_status = 'published' AND published_at <= NOW()
        ")->fetch()['c'];
        $totalReads = (int) $pdo->query("SELECT COUNT(*) AS c FROM chapter_reads")->fetch()['c'];

        $revenueRow = $pdo->query("
            SELECT COALESCE(SUM(amount), 0) AS total FROM payment_transactions WHERE status = 'successful'
        ")->fetch();
        $coinSalesRow = $pdo->query("
            SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
            FROM payment_transactions WHERE type = 'coin_package' AND status = 'successful'
        ")->fetch();
        $subscriptionSalesRow = $pdo->query("
            SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
            FROM payment_transactions WHERE type = 'subscription' AND status = 'successful'
        ")->fetch();

        Response::success([
            'totalUsers' => $totalUsers,
            'totalNovels' => $totalNovels,
            'totalChapters' => $totalChapters,
            'publishedChapters' => $publishedChapters,
            'totalReads' => $totalReads,
            'revenue' => (float) $revenueRow['total'],
            'coinSales' => [
                'total' => (float) $coinSalesRow['total'],
                'count' => (int) $coinSalesRow['count'],
            ],
            'subscriptionSales' => [
                'total' => (float) $subscriptionSalesRow['total'],
                'count' => (int) $subscriptionSalesRow['count'],
            ],
            'advertisementRevenue' => null,
        ]);
    }

    // ============================================================
    // NOTIFICATIONS / REWARDS
    // ============================================================

    /** POST /api/admin/notifications/broadcast */
    public function broadcastNotification(): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();

        (new Validator($data))
            ->required('title', 'Title')
            ->required('message', 'Message')
            ->validate();

        $audience = $data['audience'] ?? 'all';
        $userIds = match ($audience) {
            'subscribers' => Notification::getActiveSubscriberIds(),
            'all' => Notification::getAllUserIds(),
            default => Response::error('audience must be "all" or "subscribers".', 422),
        };

        Notification::createBulk($userIds, 'promo', $data['title'], $data['message']);

        Response::success(['recipientCount' => count($userIds)], 'Promotion sent.', 201);
    }

    /** POST /api/admin/users/{userId}/reward-coins */
    public function rewardCoins(string $userId): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();

        (new Validator($data))->required('amount', 'Coin amount')->validate();
        $amount = (int) $data['amount'];
        if ($amount <= 0) {
            Response::error('amount must be a positive number.', 422);
        }

        $pdo = Database::connection();
        $userStmt = $pdo->prepare("SELECT id, coins FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();
        if (!$user) {
            Response::error('User not found.', 404);
        }

        $newBalance = (int) $user['coins'] + $amount;
        $description = $data['message'] ?? 'Coin reward from JNovel';

        $pdo->beginTransaction();
        try {
            $updateStmt = $pdo->prepare("UPDATE users SET coins = ? WHERE id = ?");
            $updateStmt->execute([$newBalance, $userId]);

            $txStmt = $pdo->prepare("
                INSERT INTO coin_transactions (user_id, type, description, amount, balance_after, reference_type)
                VALUES (?, 'reward', ?, ?, ?, 'admin_reward')
            ");
            $txStmt->execute([$userId, $description, $amount, $newBalance]);

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Notification::create(
            (int) $userId,
            'reward',
            'You received a coin reward!',
            "{$description} — +{$amount} coins added to your wallet."
        );

        Response::success(['newBalance' => $newBalance], 'Coins granted.');
    }

    /** POST /api/admin/users/{userId}/subscription */
    public function grantSubscription(string $userId): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();

        (new Validator($data))->required('planSlug', 'Plan')->required('days', 'Duration in days')->validate();

        $pdo = Database::connection();
        $userStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        if (!$userStmt->fetch()) {
            Response::error('User not found.', 404);
        }

        $planStmt = $pdo->prepare("SELECT id, name FROM subscription_plans WHERE slug = ? AND is_active = 1");
        $planStmt->execute([$data['planSlug']]);
        $plan = $planStmt->fetch();
        if (!$plan) {
            Response::error('Unknown subscription plan.', 404);
        }

        $pdo->prepare("UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE user_id = ? AND status = 'active'")
            ->execute([$userId]);

        $periodEnd = date('Y-m-d H:i:s', time() + ((int) $data['days'] * 86400));
        $insertStmt = $pdo->prepare("
            INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_end)
            VALUES (?, ?, 'active', ?)
        ");
        $insertStmt->execute([$userId, $plan['id'], $periodEnd]);

        Notification::create(
            (int) $userId,
            'system',
            'Your subscription was updated',
            "You now have {$plan['name']} access until " . date('M j, Y', strtotime($periodEnd)) . "."
        );

        Response::success(['plan' => $plan['name'], 'expiresAt' => $periodEnd], 'Subscription granted.');
    }

    // ============================================================
    // PRICING
    // ============================================================

    /** GET /api/admin/coin-packages */
    public function listCoinPackages(): void
    {
        AuthMiddleware::requireRole(['admin']);
        $pdo = Database::connection();
        $rows = $pdo->query("
            SELECT id, coins, price, currency, bonus, is_popular, is_best_value, image, is_active, sort_order
            FROM coin_packages ORDER BY sort_order ASC, id ASC
        ")->fetchAll();

        Response::success(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'coins' => (int) $r['coins'],
            'price' => (float) $r['price'],
            'currency' => $r['currency'],
            'bonus' => (int) $r['bonus'],
            'isPopular' => (bool) $r['is_popular'],
            'isBestValue' => (bool) $r['is_best_value'],
            'image' => $r['image'],
            'isActive' => (bool) $r['is_active'],
            'sortOrder' => (int) $r['sort_order'],
        ], $rows));
    }

    /** PUT /api/admin/coin-packages/{id} */
    public function updateCoinPackage(string $id): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT id FROM coin_packages WHERE id = ?");
        $stmt->execute([(int) $id]);
        if (!$stmt->fetch()) {
            Response::error('Coin package not found.', 404);
        }

        $fields = [];
        $params = [];
        if (array_key_exists('price', $data)) {
            $fields[] = 'price = ?';
            $params[] = (float) $data['price'];
        }
        if (array_key_exists('currency', $data)) {
            $fields[] = 'currency = ?';
            $params[] = strtoupper(trim((string) $data['currency']));
        }
        if (array_key_exists('coins', $data)) {
            $fields[] = 'coins = ?';
            $params[] = (int) $data['coins'];
        }
        if (array_key_exists('bonus', $data)) {
            $fields[] = 'bonus = ?';
            $params[] = (int) $data['bonus'];
        }
        if (array_key_exists('isActive', $data)) {
            $fields[] = 'is_active = ?';
            $params[] = $data['isActive'] ? 1 : 0;
        }
        if (array_key_exists('isPopular', $data)) {
            $fields[] = 'is_popular = ?';
            $params[] = $data['isPopular'] ? 1 : 0;
        }
        if (array_key_exists('isBestValue', $data)) {
            $fields[] = 'is_best_value = ?';
            $params[] = $data['isBestValue'] ? 1 : 0;
        }
        if (empty($fields)) {
            Response::error('No fields to update.', 422);
        }
        $params[] = (int) $id;
        $pdo->prepare('UPDATE coin_packages SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        Response::success(null, 'Coin package updated.');
    }

    /** GET /api/admin/subscription-plans */
    public function listSubscriptionPlans(): void
    {
        AuthMiddleware::requireRole(['admin']);
        $pdo = Database::connection();
        $rows = $pdo->query("
            SELECT id, name, slug, price, currency, period, monthly_coins, features, color,
                   is_popular, is_best_value, is_active, sort_order
            FROM subscription_plans ORDER BY sort_order ASC, id ASC
        ")->fetchAll();

        Response::success(array_map(function ($r) {
            $features = json_decode($r['features'] ?? '[]', true);
            return [
                'id' => (int) $r['id'],
                'name' => $r['name'],
                'slug' => $r['slug'],
                'price' => (float) $r['price'],
                'currency' => $r['currency'],
                'period' => $r['period'],
                'monthlyCoins' => (int) $r['monthly_coins'],
                'features' => is_array($features) ? $features : [],
                'color' => $r['color'],
                'isPopular' => (bool) $r['is_popular'],
                'isBestValue' => (bool) $r['is_best_value'],
                'isActive' => (bool) $r['is_active'],
                'sortOrder' => (int) $r['sort_order'],
            ];
        }, $rows));
    }

    /** PUT /api/admin/subscription-plans/{id} */
    public function updateSubscriptionPlan(string $id): void
    {
        AuthMiddleware::requireRole(['admin']);
        $data = $this->body();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT id FROM subscription_plans WHERE id = ?");
        $stmt->execute([(int) $id]);
        if (!$stmt->fetch()) {
            Response::error('Subscription plan not found.', 404);
        }

        $fields = [];
        $params = [];
        if (array_key_exists('price', $data)) {
            $fields[] = 'price = ?';
            $params[] = (float) $data['price'];
        }
        if (array_key_exists('currency', $data)) {
            $fields[] = 'currency = ?';
            $params[] = strtoupper(trim((string) $data['currency']));
        }
        if (array_key_exists('monthlyCoins', $data)) {
            $fields[] = 'monthly_coins = ?';
            $params[] = (int) $data['monthlyCoins'];
        }
        if (array_key_exists('isActive', $data)) {
            $fields[] = 'is_active = ?';
            $params[] = $data['isActive'] ? 1 : 0;
        }
        if (array_key_exists('isPopular', $data)) {
            $fields[] = 'is_popular = ?';
            $params[] = $data['isPopular'] ? 1 : 0;
        }
        if (array_key_exists('isBestValue', $data)) {
            $fields[] = 'is_best_value = ?';
            $params[] = $data['isBestValue'] ? 1 : 0;
        }
        if (empty($fields)) {
            Response::error('No fields to update.', 422);
        }
        $params[] = (int) $id;
        $pdo->prepare('UPDATE subscription_plans SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        Response::success(null, 'Subscription plan updated.');
    }

    // ============================================================
    // Helpers
    // ============================================================

    private function notifyNewChapter(int $translationId, int $chapterNumber, string $chapterTitle): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT n.id AS novel_id, nt.title AS novel_title
            FROM novel_translations nt
            INNER JOIN novels n ON n.id = nt.novel_id
            WHERE nt.id = ?
        ");
        $stmt->execute([$translationId]);
        $novel = $stmt->fetch();
        if (!$novel) {
            return;
        }

        $userIds = Notification::getInterestedUserIds((int) $novel['novel_id']);
        Notification::createBulk(
            $userIds,
            'chapter',
            'New chapter released!',
            "Chapter {$chapterNumber}: \"{$chapterTitle}\" of \"{$novel['novel_title']}\" is now available.",
            (int) $novel['novel_id']
        );
    }

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
