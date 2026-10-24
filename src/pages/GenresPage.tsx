import { useState, useEffect } from 'react';
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

export default function GenresPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail view
  const [novels, setNovels] = useState<Novel[]>([]);
  const [novelsLoading, setNovelsLoading] = useState(false);
  const [novelsError, setNovelsError] = useState('');

  // Grid counts (published only, from same endpoint as detail)
  const [counts, setCounts] = useState<Record<number, number>>({});

  // 1) Load genre list only (fast — do not block on novel fetches)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    genreApi
      .list()
      .then(res => {
        if (cancelled) return;
        const list = (Array.isArray(res) ? res : []) as Genre[];
        const filtered = list
          .filter(g => ALLOWED_SLUGS.has(normalizeSlug(g)))
          .sort((a, b) => {
            const ia = ORDER.indexOf(normalizeSlug(a));
            const ib = ORDER.indexOf(normalizeSlug(b));
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          });
        setGenres(filtered);
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

  // 2) After list loads, fetch published counts in background (does not block UI)
  useEffect(() => {
    if (genres.length === 0) return;
    let cancelled = false;
    (async () => {
      const next: Record<number, number> = {};
      await Promise.all(
        genres.map(async g => {
          const slug = g.slug || normalizeSlug(g);
          try {
            const page = await genreApi.novelsByGenre(slug, 1, 1);
            const items = Array.isArray(page.items) ? page.items : [];
            next[g.id] = items.length === 0 ? 0 : page.total ?? items.length;
          } catch {
            next[g.id] = 0;
          }
        })
      );
      if (!cancelled) setCounts(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [genres]);

  const genre = id ? genres.find(g => g.id === Number(id)) : undefined;

  // 3) Detail: load novels when genre is known — always by slug
  useEffect(() => {
    if (!id) {
      setNovels([]);
      setNovelsError('');
      return;
    }
    if (!genre) return; // wait until list has loaded so we have the slug

    const slug = genre.slug || normalizeSlug(genre);
    let cancelled = false;
    setNovelsLoading(true);
    setNovelsError('');
    setNovels([]);

    genreApi
      .novelsByGenre(slug, 1, 50)
      .then(page => {
        if (cancelled) return;
        const items = Array.isArray(page.items) ? page.items : [];
        setNovels(items);
        setCounts(prev => ({
          ...prev,
          [genre.id]: items.length === 0 ? 0 : page.total ?? items.length,
        }));
      })
      .catch(err => {
        if (!cancelled) {
          setNovels([]);
          setNovelsError(err instanceof ApiError ? err.message : 'Failed to load novels.');
        }
      })
      .finally(() => {
        if (!cancelled) setNovelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, genre?.id, genre?.slug]);

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

  // ---- Detail view ----
  if (id) {
    const Icon = genre ? GENRE_ICONS[normalizeSlug(genre)] || BookOpen : BookOpen;
    const n = genre ? (counts[genre.id] ?? novels.length) : 0;

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

        <div className="px-4">
          {novelsLoading && (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
            </div>
          )}
          {!novelsLoading && novelsError && (
            <div className="text-center py-12 text-red-500 text-sm">{novelsError}</div>
          )}
          {!novelsLoading && !novelsError && novels.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No novels found in this genre yet.
            </div>
          )}
          {!novelsLoading && novels.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {novels.map(novel => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Grid view ----
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t.genres}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {genres.map(g => {
          const bg = g.color || '#e91e8c';
          const Icon = GENRE_ICONS[normalizeSlug(g)] || BookOpen;
          const n = counts[g.id]; // undefined until loaded
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
                {n === undefined ? '…' : `${n.toLocaleString()} novel${n === 1 ? '' : 's'}`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
