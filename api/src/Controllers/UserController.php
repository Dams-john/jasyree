<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/Novel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../../config/database.php';

class UserController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** PATCH /api/user/profile */
    public function updateProfile(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $data = $this->body();

        if (isset($data['name'])) {
            (new Validator($data))->maxLength('name', 100)->validate();
        }

        User::updateProfile($userId, array_intersect_key($data, ['name' => 1, 'avatar' => 1]));

        $user = User::findById($userId);
        Response::success(User::toApiShape($user), 'Profile updated.');
    }

    /** GET /api/user/reading-history?page=1&per_page=20 */
    public function readingHistory(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min((int) ($_GET['per_page'] ?? 20), 50));
        $offset = ($page - 1) * $perPage;

        $pdo = Database::connection();

        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM chapter_reads WHERE user_id = ?");
        $countStmt->execute([$userId]);
        $total = (int) $countStmt->fetch()['total'];

        $stmt = $pdo->prepare("
            SELECT cr.read_at, c.id AS chapter_id, c.number AS chapter_number, c.title AS chapter_title,
                   nt.id AS translation_id, nt.title AS novel_title, nt.slug AS novel_slug, nt.cover, nt.language,
                   n.id AS novel_id
            FROM chapter_reads cr
            INNER JOIN chapters c ON c.id = cr.chapter_id
            INNER JOIN novel_translations nt ON nt.id = c.novel_translation_id
            INNER JOIN novels n ON n.id = nt.novel_id
            WHERE cr.user_id = ?
            ORDER BY cr.read_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = array_map(fn($r) => [
            'novelId' => (int) $r['novel_id'],
            'novelTitle' => $r['novel_title'],
            'novelSlug' => $r['novel_slug'],
            'cover' => $r['cover'],
            'language' => $r['language'],
            'chapterId' => (int) $r['chapter_id'],
            'chapterNumber' => (int) $r['chapter_number'],
            'chapterTitle' => $r['chapter_title'],
            'readAt' => $r['read_at'],
        ], $stmt->fetchAll());

        Response::paginated($items, $total, $page, $perPage);
    }

    /** POST /api/user/reading-progress — call this as the reader scrolls/finishes a chapter */
    public function recordProgress(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $data = $this->body();

        (new Validator($data))
            ->required('translationId', 'Novel translation')
            ->required('chapterId', 'Chapter')
            ->validate();

        $pdo = Database::connection();
        $scrollPercent = min(100, max(0, (int) ($data['scrollPercent'] ?? 0)));

        $stmt = $pdo->prepare("
            INSERT INTO reading_progress (user_id, novel_translation_id, chapter_id, scroll_percent)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE chapter_id = VALUES(chapter_id), scroll_percent = VALUES(scroll_percent), updated_at = NOW()
        ");
        $stmt->execute([$userId, $data['translationId'], $data['chapterId'], $scrollPercent]);

        // Mark as fully read once they've scrolled far enough (drives isRead + booksRead stats).
        if ($scrollPercent >= 90) {
            $readStmt = $pdo->prepare("INSERT IGNORE INTO chapter_reads (user_id, chapter_id) VALUES (?, ?)");
            $readStmt->execute([$userId, $data['chapterId']]);
        }

        Response::success(null, 'Progress saved.');
    }

    /** GET /api/user/favorites?lang=en */
    public function favorites(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;

        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT novel_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $novelIds = array_column($stmt->fetchAll(), 'novel_id');

        Response::success($this->novelsByIds($novelIds, $lang, $userId));
    }

    /** POST /api/user/favorites/{novelId} */
    public function addFavorite(string $novelId): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("INSERT IGNORE INTO favorites (user_id, novel_id) VALUES (?, ?)");
        $stmt->execute([$userId, $novelId]);
        Response::success(null, 'Added to favorites.');
    }

    /** DELETE /api/user/favorites/{novelId} */
    public function removeFavorite(string $novelId): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = ? AND novel_id = ?");
        $stmt->execute([$userId, $novelId]);
        Response::success(null, 'Removed from favorites.');
    }

    /** GET /api/user/bookmarks?lang=en */
    public function bookmarks(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;

        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT novel_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $novelIds = array_column($stmt->fetchAll(), 'novel_id');

        Response::success($this->novelsByIds($novelIds, $lang, $userId));
    }

    /** POST /api/user/bookmarks/{novelId} */
    public function addBookmark(string $novelId): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("INSERT IGNORE INTO bookmarks (user_id, novel_id) VALUES (?, ?)");
        $stmt->execute([$userId, $novelId]);
        Response::success(null, 'Bookmarked.');
    }

    /** DELETE /api/user/bookmarks/{novelId} */
    public function removeBookmark(string $novelId): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("DELETE FROM bookmarks WHERE user_id = ? AND novel_id = ?");
        $stmt->execute([$userId, $novelId]);
        Response::success(null, 'Bookmark removed.');
    }

    /** GET /api/user/notifications?page=1&per_page=20 */
    public function notifications(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min((int) ($_GET['per_page'] ?? 20), 50));
        $offset = ($page - 1) * $perPage;

        $pdo = Database::connection();

        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM notifications WHERE user_id = ?");
        $countStmt->execute([$userId]);
        $total = (int) $countStmt->fetch()['total'];

        $stmt = $pdo->prepare("
            SELECT id, type, title, message, novel_id, avatar, is_read, created_at
            FROM notifications WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = array_map(fn($n) => [
            'id' => (int) $n['id'],
            'type' => $n['type'],
            'title' => $n['title'],
            'message' => $n['message'],
            'novelId' => $n['novel_id'] ? (int) $n['novel_id'] : null,
            'avatar' => $n['avatar'],
            'isRead' => (bool) $n['is_read'],
            'time' => $n['created_at'],
        ], $stmt->fetchAll());

        Response::paginated($items, $total, $page, $perPage);
    }

    /** PATCH /api/user/notifications/{id}/read */
    public function markNotificationRead(string $id): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        Response::success(null, 'Marked as read.');
    }

    /** PATCH /api/user/notifications/read-all */
    public function markAllNotificationsRead(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        Response::success(null, 'All notifications marked as read.');
    }

    /** Shared helper: given a list of novel_ids, return them in the frontend Novel shape for a given language. */
    private function novelsByIds(array $novelIds, string $lang, int $userId): array
    {
        if (empty($novelIds)) {
            return [];
        }
        $pdo = Database::connection();
        $placeholders = implode(',', array_fill(0, count($novelIds), '?'));

        $stmt = $pdo->prepare("
            SELECT
                nt.id AS translation_id, n.id AS novel_id, nt.title, nt.slug, nt.cover, nt.synopsis,
                nt.status, nt.language, nt.chapters_count, nt.published_at, nt.updated_at,
                n.is_featured, n.rating_avg, n.rating_count, n.views_count,
                pn.name AS pen_name
            FROM novel_translations nt
            INNER JOIN novels n ON n.id = nt.novel_id
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
            WHERE n.id IN ($placeholders) AND nt.language = ? AND nt.publish_status = 'published'
        ");
        $stmt->execute([...$novelIds, $lang]);
        $rows = $stmt->fetchAll();

        $rows = Novel::attachGenresAndTags($rows);
        $withContext = Novel::attachUserContext($rows, $userId);

        // Preserve the original favorite/bookmark order (most recently added first)
        $byNovelId = [];
        foreach ($withContext as [$row, $context]) {
            $byNovelId[$row['novel_id']] = Novel::toApiShape($row, $context);
        }
        $ordered = [];
        foreach ($novelIds as $nid) {
            if (isset($byNovelId[$nid])) {
                $ordered[] = $byNovelId[$nid];
            }
        }
        return $ordered;
    }
}
