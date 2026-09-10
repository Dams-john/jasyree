<?php

require_once __DIR__ . '/../Utils/JWT.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../../config/config.php';

class AuthMiddleware
{
    /** Returns the authenticated user's ID, or null if no/invalid token. Never blocks the request. */
    public static function optionalUserId(): ?int
    {
        $token = self::extractToken();
        if (!$token) {
            return null;
        }
        $config = appConfig();
        $payload = JWT::decode($token, $config['jwt']['secret']);
        if (!$payload || ($payload['type'] ?? '') !== 'access') {
            return null;
        }
        return isset($payload['sub']) ? (int) $payload['sub'] : null;
    }

    /** Returns the authenticated user's ID, or halts the request with 401. */
    public static function requireUserId(): int
    {
        $userId = self::optionalUserId();
        if ($userId === null) {
            Response::error('Unauthorized. Please log in.', 401);
        }
        return $userId;
    }

    /** Returns full payload (sub, role, etc.) or halts with 401. */
    public static function requirePayload(): array
    {
        $token = self::extractToken();
        if (!$token) {
            Response::error('Unauthorized. Please log in.', 401);
        }
        $config = appConfig();
        $payload = JWT::decode($token, $config['jwt']['secret']);
        if (!$payload || ($payload['type'] ?? '') !== 'access') {
            Response::error('Invalid or expired token.', 401);
        }
        return $payload;
    }

    /** Halts with 403 unless the authenticated user has one of the given roles. */
    public static function requireRole(array $roles): array
    {
        $payload = self::requirePayload();
        if (!in_array($payload['role'] ?? '', $roles, true)) {
            Response::error('Forbidden. Insufficient permissions.', 403);
        }
        return $payload;
    }

    private static function extractToken(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }
        return substr($authHeader, 7);
    }
}
