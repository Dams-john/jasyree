import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Genre } from '../data/genres';
import { Novel } from '../data/novels';
import NovelCard from '../components/ui/NovelCard';
import { useLanguage } from '../contexts/LanguageContext';
import { genreApi } from '../lib/resources';
import { ApiError } from '../lib/api';

export default function GenresPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genreNovels, setGenreNovels] = useState<Record<number, Novel[]>>({});

  useEffect(() => {
    let cancelled = false;
    genreApi.list()
      .then(res => { if (!cancelled) setGenres(res); })
      .catch(err => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load genres.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const genre = id ? genres.find(g => g.id === Number(id)) : undefined;

  useEffect(() => {
    if (!id || !genre) return;
    let cancelled = false;
    genreApi.novelsByGenre(genre.slug ?? String(genre.id))
      .then(res => { if (!cancelled) setGenreNovels(prev => ({ ...prev, [genre.id]: res.items })); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, genre?.id]);

  // For the overview page's "Featured by Genre" sections
  useEffect(() => {
    if (id || genres.length === 0) return;
    let cancelled = false;
    Promise.all(genres.slice(0, 3).map(g =>
      genreApi.novelsByGenre(g.slug ?? String(g.id), 1, 5)
        .then((res): [number, Novel[]] => [g.id, res.items])
        .catch((): [number, Novel[]] => [g.id, []])
    )).then(results => {
      if (cancelled) return;
      setGenreNovels(prev => {
        const next = { ...prev };
        for (const [gid, items] of results) next[gid] = items;
        return next;
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, genres.length]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 dark:text-gray-400">{error}</div>;
  }

  if (id) {
    const novels: Novel[] = genreNovels[Number(id)] ?? [];

    return (
      <div className="max-w-4xl mx-auto pb-8">
        <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 h-12 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => navigate('/genres')} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Genres</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{genre?.name || 'Genre'}</span>
        </div>

        <div className="px-4 pt-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${genre?.color}20` }}>
              {genre?.icon}
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{genre?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{genre?.count.toLocaleString()} novels</p>
            </div>
          </div>
        </div>

        <div className="px-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {novels.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">No novels found in this genre yet.</div>
          ) : novels.map(novel => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t.genres}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {genres.map(genre => (
          <button key={genre.id} onClick={() => navigate(`/genres/${genre.id}`)}
            className="relative overflow-hidden rounded-2xl aspect-video flex items-end p-3 group hover:scale-[1.02] transition-transform">
            <img src={genre.cover} alt={genre.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{genre.icon}</span>
                <span className="text-white font-bold text-sm">{genre.name}</span>
              </div>
              <p className="text-white/70 text-xs mt-0.5">{genre.count.toLocaleString()} novels</p>
            </div>
          </button>
        ))}
      </div>

      {/* Featured by Genre */}
      <div className="space-y-8">
        {genres.slice(0, 3).map(genre => {
          const novels = genreNovels[genre.id] ?? [];
          if (novels.length === 0) return null;
          return (
            <section key={genre.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{genre.icon}</span>
                  <h2 className="font-bold text-gray-900 dark:text-white">{genre.name}</h2>
                </div>
                <button onClick={() => navigate(`/genres/${genre.id}`)} className="text-sm text-[#e91e8c] hover:text-[#c41578]">
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
