import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, BookOpen } from 'lucide-react';
import { Novel } from '../data/novels';
import { GENRES } from '../data/genres';
import NovelCard from '../components/ui/NovelCard';
import SectionHeader from '../components/ui/SectionHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { homeApi, HomeData } from '../lib/resources';
import { ApiError } from '../lib/api';

export default function HomePage() {
  const { t } = useLanguage();
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerRef = useRef<NodeJS.Timeout | null>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    homeApi.getHome()
      .then(res => { if (!cancelled) setData(res); })
      .catch(err => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load. Is the backend running?'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const bannerNovels: Novel[] = data?.featured.slice(0, 4) ?? [];

  useEffect(() => {
    if (bannerNovels.length === 0) return;
    bannerRef.current = setInterval(() => setBannerIdx(i => (i + 1) % bannerNovels.length), 4000);
    return () => { if (bannerRef.current) clearInterval(bannerRef.current); };
  }, [bannerNovels.length]);

  const prevBanner = () => setBannerIdx(i => (i - 1 + bannerNovels.length) % bannerNovels.length);
  const nextBanner = () => setBannerIdx(i => (i + 1) % bannerNovels.length);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error || 'Something went wrong.'}</p>
      </div>
    );
  }

  const featured = bannerNovels[bannerIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 animate-fade-in">

      {/* Hero Banner */}
      {featured && (
        <section className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 group">
          <div className="absolute inset-0">
            <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex flex-col justify-end pb-8 px-8">
            <div className="max-w-md">
              <div className="flex flex-wrap gap-2 mb-2">
                {featured.genres.slice(0, 3).map(g => (
                  <span key={g} className="text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">{g}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-shadow leading-tight mb-2">{featured.title}</h1>
              <p className="text-white/80 text-sm mb-1">By {featured.penName}</p>
              <p className="text-white/70 text-sm mb-4 line-clamp-2 hidden sm:block">{featured.synopsis}</p>
              <div className="flex items-center gap-3">
                <Link to={`/novel/${featured.id}`} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 rounded-full">
                  <BookOpen className="w-4 h-4" />
                  {t.readNow}
                </Link>
                <div className="flex items-center gap-1 text-white/90">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold">{featured.rating}</span>
                  <span className="text-xs text-white/60">({(featured.reviews / 1000).toFixed(1)}K)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {bannerNovels.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all ${i === bannerIdx ? 'w-5 h-1.5 bg-[#e91e8c]' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </section>
      )}

      {/* Continue Reading */}
      {data.continueReading.length > 0 && (
        <section>
          <SectionHeader title={t.continueReading} viewAllTo="/library" viewAllLabel={t.viewAll} />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {data.continueReading.map(novel => (
              <div key={novel.id} className="shrink-0 w-[120px]">
                <NovelCard novel={novel} variant="continue" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {data.trending.length > 0 && (
        <section>
          <SectionHeader title={t.trending} viewAllTo="/search?tab=trending" viewAllLabel={t.viewAll} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.trending.slice(0, 6).map((novel, i) => (
              <div key={novel.id} className="relative">
                <NovelCard novel={novel} />
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#e91e8c] text-white text-xs font-black flex items-center justify-center shadow-lg">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Genres Strip */}
      <section>
        <SectionHeader title={t.genres} viewAllTo="/genres" viewAllLabel={t.viewAll} />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {GENRES.map(genre => (
            <Link key={genre.id} to={`/genres/${genre.id}`}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-[#e91e8c]/10 hover:text-[#e91e8c] dark:hover:text-[#e91e8c] text-gray-700 dark:text-gray-300 text-sm font-medium transition-all">
              <span>{genre.icon}</span>
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      {data.latestUpdates.length > 0 && (
        <section>
          <SectionHeader title={t.latestUpdates} viewAllTo="/search?tab=latest" viewAllLabel={t.viewAll} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.latestUpdates.slice(0, 6).map(novel => (
              <Link key={novel.id} to={`/novel/${novel.id}`} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 hover:border-[#e91e8c]/30 transition-all group">
                <img src={novel.cover} alt={novel.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#e91e8c] transition-colors line-clamp-2 leading-snug">{novel.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{novel.penName}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {novel.genres.slice(0, 2).map(g => (
                      <span key={g} className="text-[10px] px-1.5 py-0.5 bg-[#e91e8c]/10 text-[#e91e8c] rounded font-medium">{g}</span>
                    ))}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${novel.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {novel.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Updated {novel.updatedAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {data.newReleases.length > 0 && (
        <section>
          <SectionHeader title={t.newReleases} viewAllTo="/search?tab=new" viewAllLabel={t.viewAll} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.newReleases.slice(0, 6).map(novel => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      {data.recommended.length > 0 && (
        <section>
          <SectionHeader title={t.recommended} viewAllTo="/search?tab=recommended" viewAllLabel={t.viewAll} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.recommended.slice(0, 6).map(novel => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Stories */}
      {data.completed.length > 0 && (
        <section className="pb-4">
          <SectionHeader title={t.completed} viewAllTo="/search?tab=completed" viewAllLabel={t.viewAll} />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.completed.slice(0, 10).map(novel => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#e91e8c] to-[#ff6db5] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-black text-xl">Get Premium Access</h3>
          <p className="text-white/80 text-sm mt-1">Unlock all chapters, ad-free reading & 200 coins/month</p>
        </div>
        <Link to="/subscription" className="shrink-0 bg-white text-[#e91e8c] font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-sm">
          Subscribe Now
        </Link>
      </section>

    </div>
  );
}
