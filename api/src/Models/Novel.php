<?php

require_once __DIR__ . '/../../config/database.php';

class Novel
{
    public const DEFAULT_LANGUAGE = 'en';

    /**
     * Base SELECT: joins novels -> novel_translations (for a given language) -> pen_names.
     * Only returns rows where that language edition is actually published.
     * The `?` placeholder for language must be bound first by every caller.
     */
    private const BASE_SELECT = "
        SELECT
            nt.id AS translation_id, n.id AS novel_id, nt.title, nt.slug, nt.cover, nt.synopsis,
            nt.status, nt.language, nt.chapters_count, nt.published_at, nt.updated_at,
            n.is_featured, n.rating_avg, n.rating_count, n.views_count,
            pn.name AS pen_name
        FROM novel_translations nt
        INNER JOIN novels n ON n.id = nt.novel_id
        INNER JOIN pen_names pn ON pn.id = n.pen_name_id
        WHERE nt.language = ? AND nt.publish_status = 'published'
    ";

    public static function formatCount(int $n): string
    {
        if ($n >= 1000000) {
            return round($n / 1000000, 1) . 'M';
        }
        if ($n >= 1000) {
            return round($n / 1000, 1) . 'K';
        }
        return (string) $n;
    }

    /** Map a raw DB row (+ optional per-user fields) into the frontend Novel shape. */
    public static function toApiShape(array $row, ?array $userContext = null): array
    {
        $novel = [
            'id' => (int) $row['novel_id'],
            'translationId' => (int) $row['translation_id'],
            'title' => $row['title'],
            'penName' => $row['pen_name'],
            'cover' => $row['cover'],
            'synopsis' => $row['synopsis'],
            'genres' => $row['genres'] ?? [],
            'tags' => $row['tags'] ?? [],
            'status' => ucfirst($row['status']),
            'rating' => (float) $row['rating_avg'],
            'reviews' => (int) $row['rating_count'],
            'views' => self::formatCount((int) $row['views_count']),
            'chapters' => (int) $row['chapters_count'],
            'language' => $row['language'],
            'updatedAt' => $row['updated_at'],
            'isPremium' => (bool) ($row['is_premium'] ?? false),
        ];

        if ($userContext) {
            $novel['isBookmarked'] = $userContext['isBookmarked'] ?? false;
            $novel['isFavorite'] = $userContext['isFavorite'] ?? false;
            if (isset($userContext['progress'])) {
                $novel['progress'] = $userContext['progress'];
            }
            if (isset($userContext['currentChapter'])) {
                $novel['currentChapter'] = $userContext['currentChapter'];
            }
        }

        return $novel;
    }

    /** Fetch genres + tags for a batch of rows (keyed by novel_id, not translation_id — genres are shared). */
    public static function attachGenresAndTags(array $rows): array
    {
        if (empty($rows)) {
            return $rows;
        }
        $pdo = Database::connection();
        $novelIds = array_unique(array_column($rows, 'novel_id'));
        $placeholders = implode(',', array_fill(0, count($novelIds), '?'));

        $genreStmt = $pdo->prepare("
            SELECT ng.novel_id, g.name
            FROM novel_genres ng
            INNER JOIN genres g ON g.id = ng.genre_id
            WHERE ng.novel_id IN ($placeholders)
        ");
        $genreStmt->execute($novelIds);
        $genresByNovel = [];
        foreach ($genreStmt->fetchAll() as $g) {
            $genresByNovel[$g['novel_id']][] = $g['name'];
        }

        $tagStmt = $pdo->prepare("
            SELECT nt.novel_id, t.name
            FROM novel_tags nt
            INNER JOIN tags t ON t.id = nt.tag_id
            WHERE nt.novel_id IN ($placeholders)
        ");
        $tagStmt->execute($novelIds);
        $tagsByNovel = [];
        foreach ($tagStmt->fetchAll() as $t) {
            $tagsByNovel[$t['novel_id']][] = $t['name'];
        }

        foreach ($rows as &$row) {
            $row['genres'] = $genresByNovel[$row['novel_id']] ?? [];
            $row['tags'] = $tagsByNovel[$row['novel_id']] ?? [];
        }

        return $rows;
    }

    /** Attach per-user bookmark/favorite flags (keyed by novel_id — language-agnostic). */
    public static function attachUserContext(array $rows, ?int $userId): array
    {
        if (!$userId || empty($rows)) {
            return array_map(fn($r) => [$r, null], $rows);
        }

        $pdo = Database::connection();
        $novelIds = array_unique(array_column($rows, 'novel_id'));
        $placeholders = implode(',', array_fill(0, count($novelIds), '?'));

        $bookmarkStmt = $pdo->prepare("SELECT novel_id FROM bookmarks WHERE user_id = ? AND novel_id IN ($placeholders)");
        $bookmarkStmt->execute([$userId, ...$novelIds]);
        $bookmarked = array_column($bookmarkStmt->fetchAll(), 'novel_id');

        $favStmt = $pdo->prepare("SELECT novel_id FROM favorites WHERE user_id = ? AND novel_id IN ($placeholders)");
        $favStmt->execute([$userId, ...$novelIds]);
        $favorited = array_column($favStmt->fetchAll(), 'novel_id');

        $result = [];
        foreach ($rows as $row) {
            $result[] = [$row, [
                'isBookmarked' => in_array($row['novel_id'], $bookmarked),
                'isFavorite' => in_array($row['novel_id'], $favorited),
            ]];
        }
        return $result;
    }

    public static function getFeatured(string $lang, int $limit = 4, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(self::BASE_SELECT . " AND n.is_featured = 1 ORDER BY nt.updated_at DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getLatestUpdates(string $lang, int $limit = 10, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(self::BASE_SELECT . " ORDER BY nt.updated_at DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getTrending(string $lang, int $limit = 8, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(self::BASE_SELECT . " ORDER BY n.views_count DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getRecommended(string $lang, int $limit = 8, ?int $userId = null): array
    {
        $pdo = Database::connection();
        if ($userId) {
            $stmt = $pdo->prepare("
                " . self::BASE_SELECT . "
                AND n.id NOT IN (
                    SELECT novel_id FROM favorites WHERE user_id = ?
                    UNION
                    SELECT novel_id FROM bookmarks WHERE user_id = ?
                )
                AND n.id IN (
                    SELECT DISTINCT ng2.novel_id FROM novel_genres ng2
                    WHERE ng2.genre_id IN (
                        SELECT ng.genre_id FROM novel_genres ng
                        INNER JOIN favorites f ON f.novel_id = ng.novel_id
                        WHERE f.user_id = ?
                    )
                )
                ORDER BY n.rating_avg DESC
                LIMIT ?
            ");
            $stmt->bindValue(1, $lang, PDO::PARAM_STR);
            $stmt->bindValue(2, $userId, PDO::PARAM_INT);
            $stmt->bindValue(3, $userId, PDO::PARAM_INT);
            $stmt->bindValue(4, $userId, PDO::PARAM_INT);
            $stmt->bindValue(5, $limit, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                return self::hydrate($rows, $userId);
            }
        }

        $stmt = $pdo->prepare(self::BASE_SELECT . " ORDER BY n.rating_avg DESC, n.rating_count DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getNewReleases(string $lang, int $limit = 10, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(self::BASE_SELECT . " ORDER BY nt.published_at DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getCompleted(string $lang, int $limit = 20, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(self::BASE_SELECT . " AND nt.status = 'completed' ORDER BY nt.updated_at DESC LIMIT ?");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return self::hydrate($stmt->fetchAll(), $userId);
    }

    public static function getByGenre(string $genreSlug, string $lang, int $page = 1, int $perPage = 20, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $offset = ($page - 1) * $perPage;

        $countStmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM novel_translations nt
            INNER JOIN novels n ON n.id = nt.novel_id
            INNER JOIN novel_genres ng ON ng.novel_id = n.id
            INNER JOIN genres g ON g.id = ng.genre_id
            WHERE g.slug = ? AND nt.language = ? AND nt.publish_status = 'published'
        ");
        $countStmt->execute([$genreSlug, $lang]);
        $total = (int) $countStmt->fetch()['total'];

        $stmt = $pdo->prepare(self::BASE_SELECT . "
            AND n.id IN (
                SELECT ng.novel_id FROM novel_genres ng
                INNER JOIN genres g ON g.id = ng.genre_id
                WHERE g.slug = ?
            )
            ORDER BY nt.updated_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $genreSlug, PDO::PARAM_STR);
        $stmt->bindValue(3, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(4, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['items' => self::hydrate($stmt->fetchAll(), $userId), 'total' => $total];
    }

    public static function search(string $query, string $lang, int $page = 1, int $perPage = 20, ?int $userId = null): array
    {
        $pdo = Database::connection();
        $offset = ($page - 1) * $perPage;
        $likeQuery = '%' . $query . '%';

        $countStmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM novel_translations nt
            WHERE nt.language = ? AND nt.publish_status = 'published'
            AND (MATCH(nt.title, nt.synopsis) AGAINST(? IN NATURAL LANGUAGE MODE) OR nt.title LIKE ?)
        ");
        $countStmt->execute([$lang, $query, $likeQuery]);
        $total = (int) $countStmt->fetch()['total'];

        $stmt = $pdo->prepare(self::BASE_SELECT . "
            AND (MATCH(nt.title, nt.synopsis) AGAINST(? IN NATURAL LANGUAGE MODE) OR nt.title LIKE ?)
            ORDER BY
                MATCH(nt.title, nt.synopsis) AGAINST(? IN NATURAL LANGUAGE MODE) DESC,
                n.views_count DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $lang, PDO::PARAM_STR);
        $stmt->bindValue(2, $query, PDO::PARAM_STR);
        $stmt->bindValue(3, $likeQuery, PDO::PARAM_STR);
        $stmt->bindValue(4, $query, PDO::PARAM_STR);
        $stmt->bindValue(5, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(6, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['items' => self::hydrate($stmt->fetchAll(), $userId), 'total' => $total];
    }

    /** "Continue Reading": novels the user has in-progress, for whichever language edition they were reading. */
    public static function getContinueReading(int $userId, int $limit = 10): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT
                nt.id AS translation_id, n.id AS novel_id, nt.title, nt.slug, nt.cover, nt.synopsis,
                nt.status, nt.language, nt.chapters_count, nt.published_at, nt.updated_at,
                n.is_featured, n.rating_avg, n.rating_count, n.views_count,
                pn.name AS pen_name,
                rp.chapter_id AS current_chapter_id,
                rp.updated_at AS progress_updated_at,
                c.number AS current_chapter_number
            FROM reading_progress rp
            INNER JOIN novel_translations nt ON nt.id = rp.novel_translation_id
            INNER JOIN novels n ON n.id = nt.novel_id
            INNER JOIN pen_names pn ON pn.id = n.pen_name_id
            INNER JOIN chapters c ON c.id = rp.chapter_id
            WHERE rp.user_id = ?
            ORDER BY rp.updated_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $rows = self::attachGenresAndTags($rows);

        $result = [];
        foreach ($rows as $row) {
            $novel = self::toApiShape($row, ['isBookmarked' => false, 'isFavorite' => false]);
            $novel['currentChapter'] = (int) $row['current_chapter_number'];
            $novel['progress'] = $row['chapters_count'] > 0
                ? (int) round(($row['current_chapter_number'] / $row['chapters_count']) * 100)
                : 0;
            $result[] = $novel;
        }
        return $result;
    }

    /** Looks up a novel by its translation slug or translation id, for the language that slug belongs to. */
    public static function findBySlugOrId(string $identifier, string $lang, ?int $userId = null): ?array
    {
        $pdo = Database::connection();
        $isNumeric = ctype_digit($identifier);
        // When numeric, treat it as a translation id directly and ignore the language filter
        // (a translation id is already language-specific).
        if ($isNumeric) {
            $stmt = $pdo->prepare(str_replace("WHERE nt.language = ? AND nt.publish_status = 'published'", "WHERE nt.id = ? AND nt.publish_status = 'published'", self::BASE_SELECT));
            $stmt->execute([$identifier]);
        } else {
            $stmt = $pdo->prepare(str_replace("WHERE nt.language = ? AND nt.publish_status = 'published'", "WHERE nt.slug = ? AND nt.publish_status = 'published'", self::BASE_SELECT));
            $stmt->execute([$identifier]);
        }
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        $rows = self::attachGenresAndTags([$row]);
        [$row, $context] = self::attachUserContext($rows, $userId)[0];
        return self::toApiShape($row, $context ?? ['isBookmarked' => false, 'isFavorite' => false]);
    }

    /** All published language editions available for a given novel (for a language-switcher UI). */
    public static function getAvailableLanguages(int $novelId): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT language, slug, title, status, chapters_count
            FROM novel_translations
            WHERE novel_id = ? AND publish_status = 'published'
            ORDER BY language ASC
        ");
        $stmt->execute([$novelId]);
        return $stmt->fetchAll();
    }

    private static function hydrate(array $rows, ?int $userId): array
    {
        $rows = self::attachGenresAndTags($rows);
        $withContext = self::attachUserContext($rows, $userId);
        return array_map(
            fn($pair) => self::toApiShape($pair[0], $pair[1] ?? ['isBookmarked' => false, 'isFavorite' => false]),
            $withContext
        );
    }
}
