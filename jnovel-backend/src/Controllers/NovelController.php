<?php

require_once __DIR__ . '/../Models/Novel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../../config/database.php';

class NovelController
{
    /** GET /api/search?q=alpha&page=1&per_page=20&lang=en */
    public function search(): void
    {
        $query = trim($_GET['q'] ?? '');
        if ($query === '') {
            Response::error('Search query "q" is required.', 422);
        }

        $userId = AuthMiddleware::optionalUserId();
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min((int) ($_GET['per_page'] ?? 20), 50));

        $result = Novel::search($query, $lang, $page, $perPage, $userId);
        Response::paginated($result['items'], $result['total'], $page, $perPage);
    }

    /** GET /api/novels/{translationSlugOrId}?lang=en */
    public function show(string $idOrSlug): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;

        // Public novel payload cached for everyone (logged-in too)
        $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', $idOrSlug . '_' . $lang);
        $cacheFile = sys_get_temp_dir() . '/jasyre_novel_' . $safe . '.json';
        $ttl = 300;

        if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
            $cached = file_get_contents($cacheFile);
            if ($cached !== false) {
                header('Content-Type: application/json; charset=utf-8');
                header('X-Novel-Cache: HIT');
                echo $cached;
                return;
            }
        }

        // null userId = public shape (no per-user flags slowing the heavy query)
        $novel = Novel::findBySlugOrId($idOrSlug, $lang, null);
        if (!$novel) {
            Response::error('Novel not found.', 404);
        }

        $novel['availableLanguages'] = Novel::getAvailableLanguages($novel['id']);

        $payload = json_encode([
            'success' => true,
            'message' => 'OK',
            'data' => $novel,
        ], JSON_UNESCAPED_UNICODE);
        if ($payload !== false) {
            @file_put_contents($cacheFile, $payload, LOCK_EX);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Novel-Cache: MISS');
            echo $payload;
            return;
        }

        Response::success($novel);
    }

    /** GET /api/novels/{translationSlugOrId}/chapters?lang=en */
    public function chapters(string $idOrSlug): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;
        $pdo = Database::connection();

        $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', $idOrSlug . '_' . $lang . '_ch');
        $cacheFile = sys_get_temp_dir() . '/jasyre_chapters_' . $safe . '.json';
        $ttl = 300;

        $chapters = null;
        if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
            $raw = file_get_contents($cacheFile);
            if ($raw !== false) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded) && isset($decoded['rows'], $decoded['translationId'])) {
                    $chapters = $decoded['rows'];
                    $translationId = (int) $decoded['translationId'];
                    header('X-Chapters-Cache: HIT');
                }
            }
        }

        if ($chapters === null) {
            $translationId = $this->resolveTranslationId($idOrSlug, $lang);
            if (!$translationId) {
                Response::error('Novel not found.', 404);
            }

            $stmt = $pdo->prepare("
                SELECT id, number, title, published_at, word_count, is_premium, coin_cost
                FROM chapters
                WHERE novel_translation_id = ?
                  AND publish_status = 'published'
                  AND published_at <= NOW()
                ORDER BY number ASC
            ");
            $stmt->execute([$translationId]);
            $chapters = $stmt->fetchAll();

            @file_put_contents($cacheFile, json_encode([
                'translationId' => $translationId,
                'rows' => $chapters,
            ], JSON_UNESCAPED_UNICODE), LOCK_EX);
            header('X-Chapters-Cache: MISS');
        }

        $readChapterIds = [];
        $unlockedChapterIds = [];
        if ($userId && !empty($chapters)) {
            $ids = array_column($chapters, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            $readStmt = $pdo->prepare(
                "SELECT chapter_id FROM chapter_reads WHERE user_id = ? AND chapter_id IN ($placeholders)"
            );
            $readStmt->execute([$userId, ...$ids]);
            $readChapterIds = array_column($readStmt->fetchAll(), 'chapter_id');

            $unlockStmt = $pdo->prepare(
                "SELECT chapter_id FROM chapter_unlocks WHERE user_id = ? AND chapter_id IN ($placeholders)"
            );
            $unlockStmt->execute([$userId, ...$ids]);
            $unlockedChapterIds = array_column($unlockStmt->fetchAll(), 'chapter_id');
        }

        $result = array_map(function ($row) use ($readChapterIds, $unlockedChapterIds, $translationId) {
            $isPremium = (bool) $row['is_premium'];
            return [
                'id' => (int) $row['id'],
                'novelTranslationId' => (int) $translationId,
                'number' => (int) $row['number'],
                'title' => $row['title'],
                'publishedAt' => $row['published_at'],
                'wordCount' => (int) $row['word_count'],
                'isPremium' => $isPremium,
                'isRead' => in_array($row['id'], $readChapterIds),
                'isUnlocked' => !$isPremium || in_array($row['id'], $unlockedChapterIds),
                'coinCost' => (int) $row['coin_cost'],
            ];
        }, $chapters);

        Response::success($result);
    }

    /** GET /api/chapters/{id} — full chapter incl. content, for the reader */
    public function chapterContent(string $id): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("
            SELECT id, novel_translation_id, number, title, content, published_at, is_premium, coin_cost
            FROM chapters
            WHERE id = ? AND publish_status = 'published' AND published_at <= NOW()
        ");
        $stmt->execute([$id]);
        $chapter = $stmt->fetch();

        if (!$chapter) {
            Response::error('Chapter not found.', 404);
        }

        $isUnlocked = !$chapter['is_premium'];
        if (!$isUnlocked && $userId) {
            $unlockStmt = $pdo->prepare(
                "SELECT 1 FROM chapter_unlocks WHERE user_id = ? AND chapter_id = ?"
            );
            $unlockStmt->execute([$userId, $chapter['id']]);
            $isUnlocked = (bool) $unlockStmt->fetch();
        }

        if (!$isUnlocked) {
            Response::error('This chapter is locked.', 403, [
                'isPremium' => true,
                'coinCost' => (int) $chapter['coin_cost'],
            ]);
        }

        Response::success([
            'id' => (int) $chapter['id'],
            'novelTranslationId' => (int) $chapter['novel_translation_id'],
            'number' => (int) $chapter['number'],
            'title' => $chapter['title'],
            'content' => $chapter['content'],
            'publishedAt' => $chapter['published_at'],
            'isPremium' => (bool) $chapter['is_premium'],
        ]);
    }

    /** POST /api/chapters/{id}/unlock — spend coins to unlock a premium chapter */
    public function unlockChapter(string $id): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("
            SELECT id, title, is_premium, coin_cost, publish_status
            FROM chapters WHERE id = ?
        ");
        $stmt->execute([(int) $id]);
        $chapter = $stmt->fetch();
        if (!$chapter) {
            Response::error('Chapter not found.', 404);
        }
        if (!(bool) $chapter['is_premium']) {
            Response::success(['alreadyFree' => true], 'Chapter is free.');
        }

        $check = $pdo->prepare(
            "SELECT 1 FROM chapter_unlocks WHERE user_id = ? AND chapter_id = ?"
        );
        $check->execute([$userId, $chapter['id']]);
        if ($check->fetch()) {
            Response::success(['alreadyUnlocked' => true], 'Already unlocked.');
        }

        $cost = (int) $chapter['coin_cost'];
        if ($cost < 1) {
            Response::error('This chapter has no coin price set.', 422);
        }

        $pdo->beginTransaction();
        try {
            $u = $pdo->prepare("SELECT coins FROM users WHERE id = ? FOR UPDATE");
            $u->execute([$userId]);
            $user = $u->fetch();
            if (!$user) {
                $pdo->rollBack();
                Response::error('User not found.', 404);
            }
            $balance = (int) $user['coins'];
            if ($balance < $cost) {
                $pdo->rollBack();
                Response::error('Not enough coins.', 402, [
                    'required' => $cost,
                    'balance' => $balance,
                ]);
            }
            $newBal = $balance - $cost;
            $pdo->prepare("UPDATE users SET coins = ? WHERE id = ?")->execute([$newBal, $userId]);
            $pdo->prepare("
                INSERT INTO chapter_unlocks (user_id, chapter_id, coins_spent)
                VALUES (?, ?, ?)
            ")->execute([$userId, $chapter['id'], $cost]);
            $pdo->prepare("
                INSERT INTO coin_transactions
                  (user_id, type, description, amount, balance_after, reference_type, reference_id)
                VALUES (?, 'spend', ?, ?, ?, 'chapter_unlock', ?)
            ")->execute([
                $userId,
                'Unlocked: ' . $chapter['title'],
                -$cost,
                $newBal,
                $chapter['id'],
            ]);
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Response::success([
            'chapterId' => (int) $chapter['id'],
            'coinsSpent' => $cost,
            'balance' => $newBal,
        ], 'Chapter unlocked.');
    }

    private function resolveTranslationId(string $identifier, string $lang): ?int
    {
        $pdo = Database::connection();
        $isNumeric = ctype_digit($identifier);
        if ($isNumeric) {
            $stmt = $pdo->prepare("
                SELECT nt.id FROM novel_translations nt
                WHERE nt.novel_id = ? AND nt.language = ? AND nt.publish_status = 'published'
            ");
            $stmt->execute([$identifier, $lang]);
        } else {
            $stmt = $pdo->prepare(
                "SELECT id FROM novel_translations WHERE slug = ? AND publish_status = 'published'"
            );
            $stmt->execute([$identifier]);
        }
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : null;
    }
}
