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
        $value = $_ENV[$key] ?? getenv($key);
        return $value !== false && $value !== null && trim((string) $value) !== ''
            ? $value
            : $default;
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

        // Parse connection URL if provided (e.g., DATABASE_URL or MYSQL_URL)
        $dbUrl = env('DATABASE_URL', env('MYSQL_URL'));
        $urlHost = null; $urlPort = null; $urlUser = null; $urlPass = null; $urlName = null;

        if ($dbUrl) {
            $parsedUrl = parse_url($dbUrl);
            if ($parsedUrl) {
                $urlHost = $parsedUrl['host'] ?? null;
                $urlPort = isset($parsedUrl['port']) ? (string)$parsedUrl['port'] : null;
                $urlUser = $parsedUrl['user'] ?? null;
                $urlPass = isset($parsedUrl['pass']) ? rawurldecode($parsedUrl['pass']) : null;
                $urlName = isset($parsedUrl['path']) ? ltrim($parsedUrl['path'], '/') : null;
            }
        }

        $config = [
            'app' => [
                'env' => env('APP_ENV', 'production'),
                'debug' => env('APP_DEBUG', 'false') === 'true',
                'url' => env('APP_URL', 'http://localhost'),
                'frontend_url' => env('FRONTEND_URL', 'https://jasyre.com,https://www.jasyre.com,http://localhost:5173'),
            ],
            'db' => [
                'host' => env('DB_HOST', $urlHost ?? env('MYSQLHOST', '31.70.138.125')),
                'port' => env('DB_PORT', $urlPort ?? env('MYSQLPORT', '3306')),
                'name' => env('DB_NAME', $urlName ?? env('MYSQLDATABASE', 'my_app_db')),
                'user' => env('DB_USER', $urlUser ?? env('MYSQLUjjjeSER', 'render_user')),
                'pass' => env('DB_PASS', $urlPass ?? env('MYSQLPASSWORD', 'jasyre@123')),
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
