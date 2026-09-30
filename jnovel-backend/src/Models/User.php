<?php

class User
{
    // ...

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
            'avatar' => $row['avatar'] ?: '/default-avatar.svg',
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
