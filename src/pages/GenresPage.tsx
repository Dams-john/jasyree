import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Flame,
  Gamepad2,
  Ghost,
  Heart,
  Moon,
  Search,
  Shirt,
  Sparkles,
  Swords,
  Users,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import { Genre } from '../data/genres';
import { Novel } from '../data/novels';
import NovelCard from '../components/ui/NovelCard';
import { useLanguage } from '../contexts/LanguageContext';
import { genreApi } from '../lib/resources';
import { ApiError } from '../lib/api';

const ALLOWED_SLUGS = new Set([
  'werewolf',
  'billionaire',
  'romance',
  'erotica',
  'chicklit',
  'adult',
  'ya-teen',
  'ya-and-teen',
  'paranormal',
  'fantasy',
  'young-adult',
  'western',
  'short-stories',
  'short-story',
  'mystery',
  'game',
]);

const ORDER = [
  'werewolf',
  'billionaire',
  'romance',
  'erotica',
  'chicklit',
  'adult',
  'ya-teen',
  'ya-and-teen',
  'paranormal',
  'fantasy',
  'young-adult',
  'western',
  'short-stories',
  'short-story',
  'mystery',
  'game',
];

const GENRE_ICONS: Record<string, LucideIcon> = {
  werewolf: Moon,
  billionaire: Briefcase,
  romance: Heart,
  erotica: Flame,
  chicklit: Shirt,
  adult: Flame,
  'ya-teen': BookOpen,
  'ya-and-teen': BookOpen,
  paranormal: Ghost,
  fantasy: Sparkles,
  'young-adult': Users,
  western: Swords,
  'short-stories': ScrollText,
  'short-story': ScrollText,
  mystery: Search,
  game: Gamepad2,
};

function normalizeSlug(g: Genre): string {
  const raw = (g.slug || g.name || '').toLowerCase().trim();
  return raw
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function genreKey(g: Genre): string {
  return normalizeSlug(g);
}

export default function GenresPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [genres, setGenres] = useState<Genre[]>([]);
  /** Published counts from the same API as the genre novel list */
  const [publishedCounts, setPublishedCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genreNovels, setGenreNovels] = useState<Record<number, Novel[]>>({});

  useEffect(() => {
    let cancelled = false;
    genreApi
      .list()
      .then(async res => {
        if (cancelled) return;
        const filtered = res
          .filter(g => ALLOWED_SLUGS.has(normalizeSlug(g)))
          .sort((a, b) => {
            const ia = ORDER.indexOf(normalizeSlug(a));
            const ib = ORDER.indexOf(normalizeSlug(b));
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          });
        setGenres(filtered);

        // Load real published totals so card count matches the detail page
        const pairs = await Promise.all(
          filtered.map(async g => {
            try {
              const page = await genreApi.novelsByGenre(g.slug ?? String(g.id), 1, 1);
              return [g.id, page.total] as const;
            } catch {
              return [g.id, 0] as const;
            }
          })
        );
        if (cancelled) return;
        const map: Record<number, number> = {};
        for (const [gid, total] of pairs) map[gid] = total;
        setPublishedCounts(map);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load genres.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const genre = id ? genres.find(g => g.id === Number(id)) : undefined;

  useEffect(() => {
    if (!id || !genre) return;
    let cancelled = false;
    genreApi
      .novelsByGenre(genre.slug ?? String(genre.id), 1, 50)
      .then(res => {
        if (cancelled) return;
        setGenreNovels(prev => ({ ...prev, [genre.id]: res.items }));
        setPublishedCounts(prev => ({ ...prev, [genre.id]: res.total }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, genre?.id]);

  useEffect(() => {
    if (id || genres.length === 0) return;
    let cancelled = false;
    Promise.all(
      genres.slice(0, 3).map(g =>
        genreApi
          .novelsByGenre(g.slug ?? String(g.id), 1, 5)
          .then((res): [number, Novel[]] => [g.id, res.items])
          .catch((): [number, Novel[]] => [g.id, []])
      )
    ).then(results => {
      if (cancelled) return;
      setGenreNovels(prev => {
        const next = { ...prev };
        for (const [gid, items] of results) next[gid] = items;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, genres.length]);

  const visibleGenres = useMemo(() => genres, [genres]);

  const countFor = (g: Genre) =>
    publishedCounts[g.id] !== undefined ? publishedCounts[g.id] : (g.count ?? 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (id) {
    const novels: Novel[] = genreNovels[Number(id)] ?? [];
    const Icon = genre ? GENRE_ICONS[genreKey(genre)] || BookOpen : BookOpen;
    const n = genre ? countFor(genre) : 0;

    return (
      <div className="max-w-4xl mx-auto pb-8">
        <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 h-12 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => navigate('/genres')}
            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Genres</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {genre?.name || 'Genre'}
          </span>
        </div>

        <div className="px-4 pt-5 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${genre?.color || '#e91e8c'}22` }}
            >
              <Icon className="w-6 h-6" style={{ color: genre?.color || '#e91e8c' }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{genre?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {n.toLocaleString()} novel{n === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {novels.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No novels found in this genre yet.
            </div>
          ) : (
            novels.map(novel => <NovelCard key={novel.id} novel={novel} />)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t.genres}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {visibleGenres.map(g => {
          const bg = g.color || '#e91e8c';
          const Icon = GENRE_ICONS[genreKey(g)] || BookOpen;
          const n = countFor(g);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => navigate(`/genres/${g.id}`)}
              className="rounded-2xl p-4 text-left border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32] hover:border-[#e91e8c]/40 hover:shadow-md transition-all group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${bg}22` }}
              >
                <Icon className="w-5 h-5" style={{ color: bg }} />
              </div>
              <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#e91e8c] transition-colors">
                {g.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {n.toLocaleString()} novel{n === 1 ? '' : 's'}
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {visibleGenres.slice(0, 3).map(g => {
          const novels = genreNovels[g.id] ?? [];
          if (novels.length === 0) return null;
          return (
            <section key={g.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = GENRE_ICONS[genreKey(g)] || BookOpen;
                    return <Icon className="w-5 h-5 text-[#e91e8c]" />;
                  })()}
                  <h2 className="font-bold text-gray-900 dark:text-white">{g.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/genres/${g.id}`)}
                  className="text-sm text-[#e91e8c] hover:text-[#c41578]"
                >
                  {t.viewAll}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {novels.slice(0, 5).map(novel => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
