<?php

require_once __DIR__ . '/JWT.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

class TokenService
{
    /**
     * Issues a fresh access + refresh token pair for a user.
     * The refresh token's hash is stored server-side so it can be revoked (e.g. on logout).
     */
    public static function issueTokenPair(int $userId, string $role): array
    {
        $config = appConfig()['jwt'];
        $now = time();

        $accessToken = JWT::encode([
            'sub' => $userId,
            'role' => $role,
            'type' => 'access',
            'iss' => $config['issuer'],
            'iat' => $now,
            'exp' => $now + $config['access_ttl'],
        ], $config['secret']);

        $refreshTokenPlain = bin2hex(random_bytes(40));
        $refreshTokenHash = hash('sha256', $refreshTokenPlain);
        $refreshExpiresAt = date('Y-m-d H:i:s', $now + $config['refresh_ttl']);

        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $refreshTokenHash,
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
            $_SERVER['REMOTE_ADDR'] ?? null,
            $refreshExpiresAt,
        ]);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshTokenPlain,
            'expires_in' => $config['access_ttl'],
        ];
    }

    /**
     * Validates a refresh token, revokes it, and issues a new pair (rotation).
     * Returns null if the token is invalid, expired, or already revoked.
     */
    public static function rotateRefreshToken(string $refreshTokenPlain): ?array
    {
        $pdo = Database::connection();
        $hash = hash('sha256', $refreshTokenPlain);

        $stmt = $pdo->prepare("
            SELECT rt.id, rt.user_id, rt.revoked, rt.expires_at, u.role, u.status
            FROM refresh_tokens rt
            INNER JOIN users u ON u.id = rt.user_id
            WHERE rt.token_hash = ?
        ");
        $stmt->execute([$hash]);
        $row = $stmt->fetch();

        if (!$row || $row['revoked'] || strtotime($row['expires_at']) < time() || $row['status'] !== 'active') {
            return null;
        }

        // Revoke the used token (rotation — one-time use)
        $revokeStmt = $pdo->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?");
        $revokeStmt->execute([$row['id']]);

        return self::issueTokenPair((int) $row['user_id'], $row['role']);
    }

    public static function revokeRefreshToken(string $refreshTokenPlain): void
    {
        $pdo = Database::connection();
        $hash = hash('sha256', $refreshTokenPlain);
        $stmt = $pdo->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?");
        $stmt->execute([$hash]);
    }

    /** Revokes all active refresh tokens for a user (e.g. "log out everywhere", or password reset). */
    public static function revokeAllForUser(int $userId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0");
        $stmt->execute([$userId]);
    }
}
