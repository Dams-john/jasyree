<?php

require_once __DIR__ . '/../Models/Novel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../../config/database.php';

class HomeController
{
    private function lang(): string
    {
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;
        return preg_match('/^[a-z]{2}$/', $lang) ? $lang : Novel::DEFAULT_LANGUAGE;
    }

    /** GET /api/home/featured?lang=en */
    public function featured(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $novels = Novel::getFeatured($this->lang(), 4, $userId);
        Response::success($novels);
    }

    /** GET /api/home/latest?lang=en */
    public function latestUpdates(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $limit = $this->limitFromQuery(10);
        $novels = Novel::getLatestUpdates($this->lang(), $limit, $userId);
        Response::success($novels);
    }

    /** GET /api/home/trending?lang=en */
    public function trending(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $novels = Novel::getTrending($this->lang(), 8, $userId);
        Response::success($novels);
    }

    /** GET /api/home/recommended?lang=en */
    public function recommended(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $novels = Novel::getRecommended($this->lang(), 8, $userId);
        Response::success($novels);
    }

    /** GET /api/home/new-releases?lang=en */
    public function newReleases(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $limit = $this->limitFromQuery(10);
        $novels = Novel::getNewReleases($this->lang(), $limit, $userId);
        Response::success($novels);
    }

    /** GET /api/home/completed?lang=en */
    public function completed(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $limit = $this->limitFromQuery(20);
        $novels = Novel::getCompleted($this->lang(), $limit, $userId);
        Response::success($novels);
    }

    /** GET /api/home/banners */
    public function banners(): void
    {
        Response::success($this->bannersData());
    }

    /** GET /api/home/continue-reading — requires auth */
    public function continueReading(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $novels = Novel::getContinueReading($userId);
        Response::success($novels);
    }

    /** GET /api/home?lang=en — single aggregate call for the whole homepage */
    public function index(): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $lang = $this->lang();

        $data = [
            'banners' => $this->bannersData(),
            'featured' => Novel::getFeatured($lang, 4, $userId),
            'trending' => Novel::getTrending($lang, 8, $userId),
            'latestUpdates' => Novel::getLatestUpdates($lang, 10, $userId),
            'recommended' => Novel::getRecommended($lang, 8, $userId),
            'newReleases' => Novel::getNewReleases($lang, 10, $userId),
            'completed' => Novel::getCompleted($lang, 10, $userId),
            'continueReading' => $userId ? Novel::getContinueReading($userId) : [],
        ];

        Response::success($data);
    }

    private function bannersData(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT b.id, b.image, b.title, b.subtitle, b.link_translation_id, b.external_link,
                   nt.slug AS novel_slug
            FROM banners b
            LEFT JOIN novel_translations nt ON nt.id = b.link_translation_id
            WHERE b.is_active = 1
              AND (b.starts_at IS NULL OR b.starts_at <= NOW())
              AND (b.ends_at IS NULL OR b.ends_at >= NOW())
            ORDER BY b.sort_order ASC
        ");
        $stmt->execute();
        return array_map(fn($row) => [
            'id' => (int) $row['id'],
            'image' => $row['image'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'],
            'novelSlug' => $row['novel_slug'],
            'link' => $row['external_link'],
        ], $stmt->fetchAll());
    }

    private function limitFromQuery(int $default): int
    {
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : $default;
        return max(1, min($limit, 50));
    }
}
