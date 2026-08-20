import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GENRES } from '../data/genres';
import { NOVELS } from '../data/novels';
import NovelCard from '../components/ui/NovelCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function GenresPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (id) {
    const genre = GENRES.find(g => g.id === Number(id));
    const genreNovels = NOVELS.filter(n => n.genres.some(g => g === genre?.name));

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
          {(genreNovels.length > 0 ? genreNovels : NOVELS).map(novel => (
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
        {GENRES.map(genre => (
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
        {GENRES.slice(0, 3).map(genre => {
          const genreNovels = NOVELS.filter(n => n.genres.includes(genre.name));
          if (genreNovels.length === 0) return null;
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
                {genreNovels.slice(0, 5).map(novel => (
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
