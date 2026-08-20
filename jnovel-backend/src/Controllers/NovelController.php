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

        $novel = Novel::findBySlugOrId($idOrSlug, $lang, $userId);
        if (!$novel) {
            Response::error('Novel not found.', 404);
        }

        $novel['availableLanguages'] = Novel::getAvailableLanguages($novel['id']);
        Response::success($novel);
    }

    /** GET /api/novels/{translationSlugOrId}/chapters */
    public function chapters(string $idOrSlug): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $pdo = Database::connection();

        $translationId = $this->resolveTranslationId($idOrSlug);
        if (!$translationId) {
            Response::error('Novel not found.', 404);
        }

        // Only chapters that are published AND whose scheduled publish time has passed.
        $stmt = $pdo->prepare("
            SELECT id, number, title, published_at, word_count, is_premium, coin_cost
            FROM chapters
            WHERE novel_translation_id = ? AND publish_status = 'published' AND published_at <= NOW()
            ORDER BY number ASC
        ");
        $stmt->execute([$translationId]);
        $chapters = $stmt->fetchAll();

        $readChapterIds = [];
        $unlockedChapterIds = [];
        if ($userId) {
            $ids = array_column($chapters, 'id');
            if (!empty($ids)) {
                $placeholders = implode(',', array_fill(0, count($ids), '?'));

                $readStmt = $pdo->prepare("SELECT chapter_id FROM chapter_reads WHERE user_id = ? AND chapter_id IN ($placeholders)");
                $readStmt->execute([$userId, ...$ids]);
                $readChapterIds = array_column($readStmt->fetchAll(), 'chapter_id');

                $unlockStmt = $pdo->prepare("SELECT chapter_id FROM chapter_unlocks WHERE user_id = ? AND chapter_id IN ($placeholders)");
                $unlockStmt->execute([$userId, ...$ids]);
                $unlockedChapterIds = array_column($unlockStmt->fetchAll(), 'chapter_id');
            }
        }

        $result = array_map(function ($row) use ($readChapterIds, $unlockedChapterIds, $translationId) {
            return [
                'id' => (int) $row['id'],
                'novelTranslationId' => (int) $translationId,
                'number' => (int) $row['number'],
                'title' => $row['title'],
                'publishedAt' => $row['published_at'],
                'wordCount' => (int) $row['word_count'],
                'isPremium' => (bool) $row['is_premium'],
                'isRead' => in_array($row['id'], $readChapterIds),
                'isUnlocked' => !$row['is_premium'] || in_array($row['id'], $unlockedChapterIds),
                'coinCost' => (int) $row['coin_cost'],
            ];
        }, $chapters);

        Response::success($result);
    }

    private function resolveTranslationId(string $identifier): ?int
    {
        $pdo = Database::connection();
        $isNumeric = ctype_digit($identifier);
        $stmt = $pdo->prepare(
            "SELECT id FROM novel_translations WHERE " . ($isNumeric ? "id = ?" : "slug = ?") . " AND publish_status = 'published'"
        );
        $stmt->execute([$identifier]);
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : null;
    }
}
