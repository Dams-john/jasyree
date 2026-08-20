import { useState } from 'react';
import { Trophy, TrendingUp, Star, Eye } from 'lucide-react';
import { NOVELS } from '../data/novels';
import { Link } from 'react-router-dom';

type RankTab = 'trending' | 'rating' | 'views' | 'new';

export default function RankingPage() {
  const [tab, setTab] = useState<RankTab>('trending');

  const tabs = [
    { id: 'trending' as RankTab, label: 'Trending', icon: TrendingUp },
    { id: 'rating' as RankTab, label: 'Top Rated', icon: Star },
    { id: 'views' as RankTab, label: 'Most Read', icon: Eye },
    { id: 'new' as RankTab, label: 'New', icon: Trophy },
  ];

  const sorted = [...NOVELS].sort((a, b) => {
    if (tab === 'rating') return b.rating - a.rating;
    if (tab === 'views') return parseFloat(b.views) - parseFloat(a.views);
    return b.reviews - a.reviews;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-7 h-7 text-amber-400" />
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Rankings</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-[#e91e8c] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((novel, i) => (
          <Link key={novel.id} to={`/novel/${novel.id}`}
            className={`flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white dark:hover:bg-[#1e1e32] border border-transparent hover:border-gray-100 dark:hover:border-gray-800 ${i < 3 ? 'bg-white dark:bg-[#1e1e32] border-gray-100 dark:border-gray-800' : ''}`}>
            <div className={`w-8 text-center font-black text-lg shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-500 dark:text-gray-400'}`}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
            </div>
            <img src={novel.cover} alt={novel.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{novel.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{novel.penName}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {novel.rating}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {novel.views}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">{novel.chapters} ch.</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${novel.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                {novel.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
