<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../../config/database.php';

class PenNameController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** GET /api/admin/pen-names — list pen names owned by the requesting user */
    public function index(): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $pdo = Database::connection();

        $stmt = $pdo->prepare("SELECT id, name, slug, bio, avatar, created_at FROM pen_names WHERE user_id = ? ORDER BY name ASC");
        $stmt->execute([$payload['sub']]);

        Response::success(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'name' => $r['name'],
            'slug' => $r['slug'],
            'bio' => $r['bio'],
            'avatar' => $r['avatar'],
        ], $stmt->fetchAll()));
    }

    /** POST /api/admin/pen-names */
    public function create(): void
    {
        $payload = AuthMiddleware::requireRole(['author', 'admin']);
        $data = $this->body();

        (new Validator($data))->required('name', 'Pen name')->maxLength('name', 100)->validate();

        $slug = $this->slugify($data['name']);
        $pdo = Database::connection();

        // Ensure slug uniqueness by appending a number if needed
        $baseSlug = $slug;
        $i = 2;
        while ($this->slugExists($slug)) {
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }

        $stmt = $pdo->prepare("INSERT INTO pen_names (user_id, name, slug, bio, avatar) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$payload['sub'], trim($data['name']), $slug, $data['bio'] ?? null, $data['avatar'] ?? null]);

        Response::success(['id' => (int) $pdo->lastInsertId(), 'name' => trim($data['name']), 'slug' => $slug], 'Pen name created.', 201);
    }

    private function slugExists(string $slug): bool
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("SELECT id FROM pen_names WHERE slug = ?");
        $stmt->execute([$slug]);
        return (bool) $stmt->fetch();
    }

    private function slugify(string $text): string
    {
        $slug = strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }
}
