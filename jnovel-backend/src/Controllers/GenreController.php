<?php

require_once __DIR__ . '/../Models/Novel.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../../config/database.php';

class GenreController
{
    /** GET /api/genres */
    public function index(): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT g.id, g.name, g.slug, g.icon, g.color, g.cover,
                   COUNT(DISTINCT CASE WHEN nt.id IS NOT NULL THEN ng.novel_id END) AS novel_count
            FROM genres g
            LEFT JOIN novel_genres ng ON ng.genre_id = g.id
            LEFT JOIN novel_translations nt ON nt.novel_id = ng.novel_id AND nt.publish_status = 'published'
            GROUP BY g.id
            ORDER BY g.name ASC
        ");
        $stmt->execute();
        $genres = array_map(fn($row) => [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'icon' => $row['icon'],
            'count' => (int) $row['novel_count'],
            'color' => $row['color'],
            'cover' => $row['cover'],
        ], $stmt->fetchAll());
        Response::success($genres);
    }

    /** GET /api/genres/{slug}/novels?page=1&per_page=20&lang=en */
    public function novelsByGenre(string $slug): void
    {
        $userId = AuthMiddleware::optionalUserId();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min((int) ($_GET['per_page'] ?? 20), 50));
        $lang = $_GET['lang'] ?? Novel::DEFAULT_LANGUAGE;

        $result = Novel::getByGenre($slug, $lang, $page, $perPage, $userId);
        Response::paginated($result['items'], $result['total'], $page, $perPage);
    }
}
