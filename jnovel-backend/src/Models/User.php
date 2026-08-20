<?php

require_once __DIR__ . '/../../config/database.php';

class User
{
    public static function findByEmail(string $email): ?array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findById(int $id): ?array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(string $name, string $email, ?string $passwordHash, string $role = 'reader'): int
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$name, $email, $passwordHash ?? '', $role]);
        return (int) $pdo->lastInsertId();
    }

    public static function findOrCreateBySocialId(string $provider, string $socialId, string $name, string $email, ?string $avatar): array
    {
        $pdo = Database::connection();
        $column = $provider === 'google' ? 'google_id' : 'apple_id';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE $column = ? OR email = ?");
        $stmt->execute([$socialId, $email]);
        $existing = $stmt->fetch();

        if ($existing) {
            if (empty($existing[$column])) {
                $updateStmt = $pdo->prepare("UPDATE users SET $column = ?, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?");
                $updateStmt->execute([$socialId, $existing['id']]);
            }
            return self::findById((int) $existing['id']);
        }

        $insertStmt = $pdo->prepare("
            INSERT INTO users (name, email, password_hash, avatar, $column, email_verified_at)
            VALUES (?, ?, '', ?, ?, NOW())
        ");
        $insertStmt->execute([$name, $email, $avatar, $socialId]);
        return self::findById((int) $pdo->lastInsertId());
    }

    public static function updatePassword(int $userId, string $passwordHash): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$passwordHash, $userId]);
    }

    public static function markEmailVerified(int $userId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE users SET email_verified_at = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
    }

    public static function updateProfile(int $userId, array $fields): void
    {
        $allowed = ['name', 'avatar'];
        $sets = [];
        $params = [];
        foreach ($fields as $key => $value) {
            if (in_array($key, $allowed, true)) {
                $sets[] = "$key = ?";
                $params[] = $value;
            }
        }
        if (empty($sets)) {
            return;
        }
        $params[] = $userId;
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $sets) . " WHERE id = ?");
        $stmt->execute($params);
    }

    /** Maps a raw DB row to the exact shape the frontend's User interface expects. */
    public static function toApiShape(array $row): array
    {
        $pdo = Database::connection();

        // Active subscription tier
        $subStmt = $pdo->prepare("
            SELECT sp.slug FROM user_subscriptions us
            INNER JOIN subscription_plans sp ON sp.id = us.plan_id
            WHERE us.user_id = ? AND us.status = 'active' AND us.current_period_end > NOW()
            ORDER BY us.current_period_end DESC LIMIT 1
        ");
        $subStmt->execute([$row['id']]);
        $sub = $subStmt->fetch();
        $subscription = $sub ? $sub['slug'] : 'free';

        // Following: pen names this user follows as a reader
        $followingStmt = $pdo->prepare("SELECT COUNT(*) as c FROM author_follows WHERE user_id = ?");
        $followingStmt->execute([$row['id']]);
        $following = (int) $followingStmt->fetch()['c'];

        // Followers: total followers across all pen names this user owns (if they're an author)
        $followersStmt = $pdo->prepare("
            SELECT COUNT(*) as c FROM author_follows af
            INNER JOIN pen_names pn ON pn.id = af.pen_name_id
            WHERE pn.user_id = ?
        ");
        $followersStmt->execute([$row['id']]);
        $followers = (int) $followersStmt->fetch()['c'];

        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'avatar' => $row['avatar'] ?: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
            'coins' => (int) $row['coins'],
            'subscription' => $subscription,
            'joinedAt' => date('Y-m-d', strtotime($row['created_at'])),
            'booksRead' => (int) $row['books_read'],
            'following' => $following,
            'followers' => $followers,
            'totalReadTime' => (int) $row['total_read_time'],
        ];
    }
}
