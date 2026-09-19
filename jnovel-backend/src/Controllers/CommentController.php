<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../../config/database.php';

class CommentController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** GET /api/novels/{idOrSlug}/comments?page=1&per_page=20 — top-level comments + their replies */
    public function index(string $idOrSlug): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $novelId = $this->resolveNovelId($idOrSlug);
        if (!$novelId) {
            Response::error('Novel not found.', 404);
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min((int) ($_GET['per_page'] ?? 20), 50));
        $offset = ($page - 1) * $perPage;

        $pdo = Database::connection();

        $countStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM comments WHERE novel_id = ? AND is_deleted = 0");
        $countStmt->execute([$novelId]);
        $total = (int) $countStmt->fetch()['c'];

        $stmt = $pdo->prepare("
            SELECT c.id, c.user_id, c.content, c.likes_count, c.created_at, u.name AS user_name, u.avatar AS user_avatar
            FROM comments c
            INNER JOIN users u ON u.id = c.user_id
            WHERE c.novel_id = ? AND c.is_deleted = 0
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $novelId, PDO::PARAM_INT);
        $stmt->bindValue(2, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $comments = $stmt->fetchAll();

        if (empty($comments)) {
            Response::paginated([], $total, $page, $perPage);
        }

        $commentIds = array_column($comments, 'id');
        $placeholders = implode(',', array_fill(0, count($commentIds), '?'));

        $replyStmt = $pdo->prepare("
            SELECT r.id, r.comment_id, r.user_id, r.content, r.likes_count, r.created_at, u.name AS user_name, u.avatar AS user_avatar
            FROM comment_replies r
            INNER JOIN users u ON u.id = r.user_id
            WHERE r.comment_id IN ($placeholders) AND r.is_deleted = 0
            ORDER BY r.created_at ASC
        ");
        $replyStmt->execute($commentIds);
        $repliesByComment = [];
        foreach ($replyStmt->fetchAll() as $r) {
            $repliesByComment[$r['comment_id']][] = $this->replyShape($r);
        }

        $likedCommentIds = $likedReplyIds = [];
        if ($userId) {
            $likeStmt = $pdo->prepare("SELECT comment_id, reply_id FROM comment_likes WHERE user_id = ? AND (comment_id IN ($placeholders) OR reply_id IS NOT NULL)");
            $likeStmt->execute([$userId, ...$commentIds]);
            foreach ($likeStmt->fetchAll() as $l) {
                if ($l['comment_id']) $likedCommentIds[] = (int) $l['comment_id'];
                if ($l['reply_id']) $likedReplyIds[] = (int) $l['reply_id'];
            }
        }

        $result = array_map(function ($c) use ($repliesByComment, $likedCommentIds, $likedReplyIds) {
            $shaped = $this->commentShape($c, in_array((int) $c['id'], $likedCommentIds));
            $shaped['replies'] = array_map(
                fn($r) => array_merge($r, ['isLiked' => in_array($r['id'], $likedReplyIds)]),
                $repliesByComment[$c['id']] ?? []
            );
            return $shaped;
        }, $comments);

        Response::paginated($result, $total, $page, $perPage);
    }

    /** POST /api/novels/{idOrSlug}/comments — { content, chapterId? } */
    public function create(string $idOrSlug): void
    {
        $userId = AuthMiddleware::requireUserId();
        $novelId = $this->resolveNovelId($idOrSlug);
        if (!$novelId) {
            Response::error('Novel not found.', 404);
        }

        $data = $this->body();
        (new Validator($data))->required('content', 'Comment')->maxLength('content', 2000)->validate();

        $pdo = Database::connection();
        $stmt = $pdo->prepare("INSERT INTO comments (user_id, novel_id, chapter_id, content) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $novelId, $data['chapterId'] ?? null, trim($data['content'])]);

        Response::success(['id' => (int) $pdo->lastInsertId()], 'Comment posted.', 201);
    }

    /** DELETE /api/comments/{id} — owner or admin only */
    public function delete(string $id): void
    {
        $payload = AuthMiddleware::requirePayload();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->execute([$id]);
        $comment = $stmt->fetch();
        if (!$comment) {
            Response::error('Comment not found.', 404);
        }
        if ((int) $comment['user_id'] !== (int) $payload['sub'] && $payload['role'] !== 'admin') {
            Response::error('You can only delete your own comments.', 403);
        }

        $pdo->prepare("UPDATE comments SET is_deleted = 1 WHERE id = ?")->execute([$id]);
        Response::success(null, 'Comment deleted.');
    }

    /** POST /api/comments/{id}/replies — { content } */
    public function reply(string $id): void
    {
        $userId = AuthMiddleware::requireUserId();
        $data = $this->body();
        (new Validator($data))->required('content', 'Reply')->maxLength('content', 2000)->validate();

        $pdo = Database::connection();
        $checkStmt = $pdo->prepare("SELECT id, user_id, novel_id FROM comments WHERE id = ? AND is_deleted = 0");
        $checkStmt->execute([$id]);
        $comment = $checkStmt->fetch();
        if (!$comment) {
            Response::error('Comment not found.', 404);
        }

        $stmt = $pdo->prepare("INSERT INTO comment_replies (comment_id, user_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$id, $userId, trim($data['content'])]);

        // Notify the original commenter — but not if they're replying to their own comment.
        // Wrapped defensively: a notification hiccup should never block the reply itself,
        // which has already been saved successfully by this point.
        if ((int) $comment['user_id'] !== $userId) {
            try {
                require_once __DIR__ . '/../Models/Notification.php';
                $replierStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
                $replierStmt->execute([$userId]);
                $replierName = $replierStmt->fetch()['name'] ?? 'Someone';
                $preview = trim($data['content']);
                if (strlen($preview) > 100) {
                    $preview = substr($preview, 0, 100) . '...';
                }
                Notification::create(
                    (int) $comment['user_id'],
                    'comment',
                    'New reply to your comment',
                    "{$replierName} replied: \"{$preview}\"",
                    (int) $comment['novel_id']
                );
            } catch (Throwable $e) {
                error_log('Failed to create reply notification: ' . $e->getMessage());
            }
        }

        Response::success(['id' => (int) $pdo->lastInsertId()], 'Reply posted.', 201);
    }

    /** DELETE /api/comments/replies/{id} — owner or admin only */
    public function deleteReply(string $id): void
    {
        $payload = AuthMiddleware::requirePayload();
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT user_id FROM comment_replies WHERE id = ?");
        $stmt->execute([$id]);
        $reply = $stmt->fetch();
        if (!$reply) {
            Response::error('Reply not found.', 404);
        }
        if ((int) $reply['user_id'] !== (int) $payload['sub'] && $payload['role'] !== 'admin') {
            Response::error('You can only delete your own replies.', 403);
        }

        $pdo->prepare("UPDATE comment_replies SET is_deleted = 1 WHERE id = ?")->execute([$id]);
        Response::success(null, 'Reply deleted.');
    }

    /** POST /api/comments/{id}/like */
    public function likeComment(string $id): void
    {
        $this->toggleLike($id, null, true);
    }

    /** DELETE /api/comments/{id}/like */
    public function unlikeComment(string $id): void
    {
        $this->toggleLike($id, null, false);
    }

    /** POST /api/comments/replies/{id}/like */
    public function likeReply(string $id): void
    {
        $this->toggleLike(null, $id, true);
    }

    /** DELETE /api/comments/replies/{id}/like */
    public function unlikeReply(string $id): void
    {
        $this->toggleLike(null, $id, false);
    }

    private function toggleLike(?string $commentId, ?string $replyId, bool $liking): void
    {
        $userId = AuthMiddleware::requireUserId();
        $pdo = Database::connection();
        $table = $commentId ? 'comments' : 'comment_replies';
        $targetId = $commentId ?? $replyId;
        $column = $commentId ? 'comment_id' : 'reply_id';

        if ($liking) {
            $stmt = $pdo->prepare("INSERT IGNORE INTO comment_likes (user_id, $column) VALUES (?, ?)");
            $stmt->execute([$userId, $targetId]);
            if ($pdo->query("SELECT ROW_COUNT()")->fetchColumn() > 0) {
                $pdo->prepare("UPDATE $table SET likes_count = likes_count + 1 WHERE id = ?")->execute([$targetId]);
            }
        } else {
            $stmt = $pdo->prepare("DELETE FROM comment_likes WHERE user_id = ? AND $column = ?");
            $stmt->execute([$userId, $targetId]);
            if ($stmt->rowCount() > 0) {
                $pdo->prepare("UPDATE $table SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?")->execute([$targetId]);
            }
        }

        $countStmt = $pdo->prepare("SELECT likes_count FROM $table WHERE id = ?");
        $countStmt->execute([$targetId]);
        Response::success(['likes' => (int) $countStmt->fetch()['likes_count']], $liking ? 'Liked.' : 'Like removed.');
    }

    private function commentShape(array $c, bool $isLiked): array
    {
        return [
            'id' => (int) $c['id'],
            'userId' => (int) $c['user_id'],
            'userName' => $c['user_name'],
            'userAvatar' => $c['user_avatar'],
            'content' => $c['content'],
            'likes' => (int) $c['likes_count'],
            'isLiked' => $isLiked,
            'createdAt' => $c['created_at'],
        ];
    }

    private function replyShape(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'commentId' => (int) $r['comment_id'],
            'userId' => (int) $r['user_id'],
            'userName' => $r['user_name'],
            'userAvatar' => $r['user_avatar'],
            'content' => $r['content'],
            'likes' => (int) $r['likes_count'],
            'createdAt' => $r['created_at'],
        ];
    }

    private function resolveNovelId(string $identifier): ?int
    {
        $pdo = Database::connection();
        $isNumeric = ctype_digit($identifier);
        if ($isNumeric) {
            $stmt = $pdo->prepare("SELECT id FROM novels WHERE id = ?");
            $stmt->execute([$identifier]);
        } else {
            $stmt = $pdo->prepare("SELECT novel_id AS id FROM novel_translations WHERE slug = ?");
            $stmt->execute([$identifier]);
        }
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : null;
    }
}
