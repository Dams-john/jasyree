import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Novel } from '../data/novels';
import { Genre } from '../data/genres';
import NovelCard from '../components/ui/NovelCard';
import { useLanguage } from '../contexts/LanguageContext';
import { novelApi, genreApi, homeApi } from '../lib/resources';

type SearchTab = 'top' | 'novels' | 'authors' | 'genres';

export default function SearchPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchTab>('top');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [trending, setTrending] = useState<Novel[]>([]);
  const [results, setResults] = useState<Novel[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    genreApi.list().then(setGenres).catch(() => {});
    homeApi.getTrending().then(setTrending).catch(() => {});
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const handle = setTimeout(() => {
      novelApi.search(trimmed, 1, 30)
        .then(res => { if (!cancelled) setResults(res.items); })
        .catch(() => { if (!cancelled) setResults([]); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 350);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [query]);

  const topResults = results.slice(0, 5);
  const novelResults = results;
  const authorResults = [...new Map(results.map(n => [n.penName, n])).values()];
  const genreResults = genres.filter(g => !query || g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Search Header */}
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search novels, authors..."
              autoFocus
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e91e8c] focus:border-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#e91e8c] whitespace-nowrap">
            Cancel
          </button>
        </div>

        {query && (
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {(['top', 'novels', 'authors', 'genres'] as SearchTab[]).map(tabId => (
              <button key={tabId} onClick={() => setTab(tabId)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize ${tab === tabId ? 'bg-[#e91e8c] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {tabId === 'top' ? 'Top Results' : tabId === 'genres' ? t.genres : tabId.charAt(0).toUpperCase() + tabId.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {!query ? (
          <div className="space-y-6">
            {/* Popular searches */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Alpha', 'Werewolf Romance', 'Billionaire', 'Dark Romance', 'Fantasy Kingdom', 'Vampire', 'Rejected Mate', 'Contract Marriage'].map(s => (
                  <button key={s} onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-[#e91e8c]/10 hover:text-[#e91e8c] transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            {trending.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Trending</h3>
                <div className="space-y-3">
                  {trending.slice(0, 5).map((novel, i) => (
                    <button key={novel.id} onClick={() => navigate(`/novel/${novel.id}`)} className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <span className="w-6 text-sm font-bold text-[#e91e8c]">#{i + 1}</span>
                      <img src={novel.cover} alt={novel.title} className="w-10 h-14 object-cover rounded-lg" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{novel.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{novel.penName}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {novel.genres.slice(0, 1).map(g => (
                          <span key={g} className="text-[10px] px-1.5 py-0.5 bg-[#e91e8c]/10 text-[#e91e8c] rounded">{g}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {searching && (
              <div className="flex justify-center py-8">
                <span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
              </div>
            )}

            {!searching && tab === 'top' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Results for "{query}"</h3>
                {topResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                  </div>
                ) : topResults.map(novel => (
                  <button key={novel.id} onClick={() => navigate(`/novel/${novel.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-[#1e1e32] transition-colors">
                    <img src={novel.cover} alt={novel.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{novel.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{novel.penName}</p>
                      <span className="text-xs mt-1 inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">NOVEL</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && tab === 'novels' && (
              <div className="grid grid-cols-3 gap-3">
                {novelResults.map(novel => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
                {novelResults.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">No novels found</div>
                )}
              </div>
            )}

            {!searching && tab === 'authors' && (
              <div className="space-y-3">
                {authorResults.map(novel => (
                  <div key={novel.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-[#1e1e32] transition-colors cursor-pointer">
                    <img src={novel.cover} alt={novel.penName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{novel.penName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{results.filter(n => n.penName === novel.penName).length} novel(s)</p>
                    </div>
                  </div>
                ))}
                {authorResults.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">No authors found</div>
                )}
              </div>
            )}

            {!searching && tab === 'genres' && (
              <div className="grid grid-cols-2 gap-3">
                {genreResults.map(genre => (
                  <button key={genre.id} onClick={() => navigate(`/genres/${genre.id}`)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 hover:border-[#e91e8c]/30 transition-colors text-left">
                    <span className="text-2xl">{genre.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{genre.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{genre.count.toLocaleString()} novels</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
