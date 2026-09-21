<?php

require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../../config/database.php';

class TagController
{
    /** GET /api/tags — every tag, with how many published novels use it */
    public function index(): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT t.id, t.name, t.slug, COUNT(DISTINCT nt.novel_id) AS novel_count
            FROM tags t
            LEFT JOIN novel_tags nvt ON nvt.tag_id = t.id
            LEFT JOIN novel_translations nt ON nt.novel_id = nvt.novel_id AND nt.publish_status = 'published'
            GROUP BY t.id
            ORDER BY t.name ASC
        ");
        $stmt->execute();

        Response::success(array_map(fn($row) => [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'count' => (int) $row['novel_count'],
        ], $stmt->fetchAll()));
    }
}
