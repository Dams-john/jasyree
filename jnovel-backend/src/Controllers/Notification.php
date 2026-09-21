<?php

require_once __DIR__ . '/../../config/database.php';

class Notification
{
    public const TYPES = ['chapter', 'reward', 'system', 'promo', 'comment'];

    /** Create one notification for one user. */
    public static function create(int $userId, string $type, string $title, string $message, ?int $novelId = null, ?string $avatar = null): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, title, message, novel_id, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $type, $title, $message, $novelId, $avatar]);
    }

    /** Create the same notification for many users at once (e.g. everyone who favorited a novel). */
    public static function createBulk(array $userIds, string $type, string $title, string $message, ?int $novelId = null, ?string $avatar = null): void
    {
        $userIds = array_unique(array_filter($userIds));
        if (empty($userIds)) {
            return;
        }
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, title, message, novel_id, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($userIds as $userId) {
            $stmt->execute([$userId, $type, $title, $message, $novelId, $avatar]);
        }
    }

    /** Every user who has favorited OR bookmarked a novel — the audience for "new chapter" notifications. */
    public static function getInterestedUserIds(int $novelId): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT user_id FROM favorites WHERE novel_id = ?
            UNION
            SELECT user_id FROM bookmarks WHERE novel_id = ?
        ");
        $stmt->execute([$novelId, $novelId]);
        return array_map('intval', array_column($stmt->fetchAll(), 'user_id'));
    }

    /** Every active reader (used for platform-wide promo broadcasts). */
    public static function getAllUserIds(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query("SELECT id FROM users WHERE status = 'active'");
        return array_map('intval', array_column($stmt->fetchAll(), 'id'));
    }

    /** Every user with a currently-active subscription (used for subscriber-only promo broadcasts). */
    public static function getActiveSubscriberIds(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query("
            SELECT DISTINCT user_id FROM user_subscriptions
            WHERE status = 'active' AND current_period_end > NOW()
        ");
        return array_map('intval', array_column($stmt->fetchAll(), 'user_id'));
    }
}
