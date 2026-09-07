<?php

declare(strict_types=1);

// ---- CORS ----
require_once __DIR__ . '/../config/config.php';
$config = appConfig();
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map(
    static fn(string $origin): string => rtrim(trim($origin), '/'),
    explode(',', $config['app']['frontend_url'])
));
$allowedOrigins = array_unique(array_merge($allowedOrigins, [
    'https://jasyre.com',
    'https://www.jasyre.com',
]));
if ($requestOrigin !== '' && in_array(rtrim($requestOrigin, '/'), $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/Utils/Response.php';

// ---- Error handling: always return JSON, never leak PHP errors/HTML ----
set_exception_handler(function (Throwable $e) use ($config) {
    error_log($e->getMessage() . "\n" . $e->getTraceAsString());
    Response::error(
        $config['app']['debug'] ? $e->getMessage() : 'Internal server error',
        500,
        $config['app']['debug'] ? ['trace' => explode("\n", $e->getTraceAsString())] : null
    );
});
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// ---- Controllers ----
require_once __DIR__ . '/../src/Controllers/HomeController.php';
require_once __DIR__ . '/../src/Controllers/GenreController.php';
require_once __DIR__ . '/../src/Controllers/NovelController.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/UserController.php';
require_once __DIR__ . '/../src/Controllers/AdminController.php';
require_once __DIR__ . '/../src/Controllers/PenNameController.php';

// ---- Routing ----
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip a base path if the API isn't served from domain root, e.g. /jnovel-backend/public
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
if ($scriptDir !== '' && str_starts_with($uri, $scriptDir)) {
    $uri = substr($uri, strlen($scriptDir));
}
$uri = '/' . ltrim($uri, '/');
$uri = rtrim($uri, '/') ?: '/';

/**
 * Route table: [METHOD, pattern, [Controller, method]]
 * Patterns use {param} placeholders, matched via regex.
 */
$routes = [
    ['GET', '/api/health', static function (): void {
        Response::success(['status' => 'ok']);
    }],
    ['GET', '/api/home', [HomeController::class, 'index']],
    ['GET', '/api/home/featured', [HomeController::class, 'featured']],
    ['GET', '/api/home/latest', [HomeController::class, 'latestUpdates']],
    ['GET', '/api/home/trending', [HomeController::class, 'trending']],
    ['GET', '/api/home/recommended', [HomeController::class, 'recommended']],
    ['GET', '/api/home/new-releases', [HomeController::class, 'newReleases']],
    ['GET', '/api/home/completed', [HomeController::class, 'completed']],
    ['GET', '/api/home/banners', [HomeController::class, 'banners']],
    ['GET', '/api/home/continue-reading', [HomeController::class, 'continueReading']],

    ['GET', '/api/genres', [GenreController::class, 'index']],
    ['GET', '/api/genres/{slug}/novels', [GenreController::class, 'novelsByGenre']],

    ['GET', '/api/search', [NovelController::class, 'search']],
    ['GET', '/api/novels/{id}', [NovelController::class, 'show']],
    ['GET', '/api/novels/{id}/chapters', [NovelController::class, 'chapters']],
    ['GET', '/api/chapters/{id}', [NovelController::class, 'chapterContent']],

    ['POST', '/api/auth/register', [AuthController::class, 'register']],
    ['POST', '/api/auth/login', [AuthController::class, 'login']],
    ['POST', '/api/auth/refresh', [AuthController::class, 'refresh']],
    ['POST', '/api/auth/logout', [AuthController::class, 'logout']],
    ['GET', '/api/auth/me', [AuthController::class, 'me']],
    ['POST', '/api/auth/forgot-password', [AuthController::class, 'forgotPassword']],
    ['POST', '/api/auth/reset-password', [AuthController::class, 'resetPassword']],
    ['POST', '/api/auth/verify-email', [AuthController::class, 'verifyEmail']],
    ['POST', '/api/auth/resend-verification', [AuthController::class, 'resendVerification']],
    ['POST', '/api/auth/google', [AuthController::class, 'google']],
    ['POST', '/api/auth/apple', [AuthController::class, 'apple']],

    // User account
    ['PATCH', '/api/user/profile', [UserController::class, 'updateProfile']],
    ['GET', '/api/user/reading-history', [UserController::class, 'readingHistory']],
    ['POST', '/api/user/reading-progress', [UserController::class, 'recordProgress']],
    ['GET', '/api/user/favorites', [UserController::class, 'favorites']],
    ['POST', '/api/user/favorites/{novelId}', [UserController::class, 'addFavorite']],
    ['DELETE', '/api/user/favorites/{novelId}', [UserController::class, 'removeFavorite']],
    ['GET', '/api/user/bookmarks', [UserController::class, 'bookmarks']],
    ['POST', '/api/user/bookmarks/{novelId}', [UserController::class, 'addBookmark']],
    ['DELETE', '/api/user/bookmarks/{novelId}', [UserController::class, 'removeBookmark']],
    ['GET', '/api/user/notifications', [UserController::class, 'notifications']],
    ['PATCH', '/api/user/notifications/{id}/read', [UserController::class, 'markNotificationRead']],
    ['PATCH', '/api/user/notifications/read-all', [UserController::class, 'markAllNotificationsRead']],

    // Admin dashboard — pen names
    ['GET', '/api/admin/pen-names', [PenNameController::class, 'index']],
    ['POST', '/api/admin/pen-names', [PenNameController::class, 'create']],

    // Admin dashboard — novels & multi-language editions
    ['GET', '/api/admin/novels', [AdminController::class, 'listNovels']],
    ['POST', '/api/admin/novels', [AdminController::class, 'createNovel']],
    ['GET', '/api/admin/novels/{id}', [AdminController::class, 'showNovel']],
    ['POST', '/api/admin/novels/{id}/translations', [AdminController::class, 'addTranslation']],
    ['PUT', '/api/admin/translations/{id}', [AdminController::class, 'updateTranslation']],

    // Admin dashboard — chapters (per language edition)
    ['GET', '/api/admin/translations/{id}/chapters', [AdminController::class, 'listChapters']],
    ['POST', '/api/admin/translations/{id}/chapters', [AdminController::class, 'createChapter']],
    ['PUT', '/api/admin/chapters/{id}', [AdminController::class, 'updateChapter']],
    ['DELETE', '/api/admin/chapters/{id}', [AdminController::class, 'deleteChapter']],
];

foreach ($routes as [$routeMethod, $pattern, $handler]) {
    if ($routeMethod !== $method) {
        continue;
    }

    $regex = '#^' . preg_replace('/\{[a-zA-Z_]+\}/', '([^/]+)', $pattern) . '$#';
    if (preg_match($regex, $uri, $matches)) {
        array_shift($matches); // drop full match
        if (is_callable($handler)) {
            $handler();
        } else {
            [$controllerClass, $methodName] = $handler;
            $controller = new $controllerClass();
            $controller->$methodName(...$matches);
        }
        exit;
    }
}

Response::error('Route not found', 404);
