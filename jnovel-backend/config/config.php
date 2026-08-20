<?php


if (!function_exists('loadEnv')) {
    function loadEnv(string $path): void
    {
        if (!file_exists($path)) {
            return;
        }
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) {
                continue;
            }
            if (!str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (strlen($value) > 1 && $value[0] === '"' && $value[strlen($value) - 1] === '"') {
                $value = substr($value, 1, -1);
            }
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

if (!function_exists('env')) {
    function env(string $key, $default = null)
    {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
}

if (!function_exists('appConfig')) {
    function appConfig(): array
    {
        static $config = null;
        if ($config !== null) {
            return $config;
        }

        loadEnv(__DIR__ . '/../.env');

        $config = [
            'app' => [
                'env' => env('APP_ENV', 'production'),
                'debug' => env('APP_DEBUG', 'false') === 'true',
                'url' => env('APP_URL', 'http://localhost'),
                'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
            ],
            'db' => [
                'host' => env('DB_HOST', '127.0.0.1'),
                'port' => env('DB_PORT', '3306'),
                'name' => env('DB_NAME', 'jnovel'),
                'user' => env('DB_USER', 'root'),
                'pass' => env('DB_PASS', ''),
            ],
            'jwt' => [
                'secret' => env('JWT_SECRET', 'change-this-secret-in-env'),
                'access_ttl' => (int) env('JWT_ACCESS_TTL', 900),
                'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 2592000),
                'issuer' => env('JWT_ISSUER', 'jnovel-api'),
            ],
            'mail' => [
                'host' => env('MAIL_HOST', ''),
                'port' => (int) env('MAIL_PORT', 587),
                'user' => env('MAIL_USER', ''),
                'pass' => env('MAIL_PASS', ''),
                'from_address' => env('MAIL_FROM_ADDRESS', 'noreply@jnovel.app'),
                'from_name' => env('MAIL_FROM_NAME', 'JNovel'),
            ],
            'google' => [
                'client_id' => env('GOOGLE_CLIENT_ID', ''),
            ],
            'apple' => [
                'client_id' => env('APPLE_CLIENT_ID', ''),
            ],
        ];

        return $config;
    }
}
