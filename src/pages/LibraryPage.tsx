import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Heart, Bookmark, Clock, ChevronRight } from 'lucide-react';
import { NOVELS, CONTINUE_READING } from '../data/novels';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type LibTab = 'reading' | 'completed' | 'favorites' | 'bookmarks' | 'history';

export default function LibraryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<LibTab>('reading');

  const tabs = [
    { id: 'reading' as LibTab, label: 'Reading', icon: BookOpen },
    { id: 'completed' as LibTab, label: t.completed, icon: CheckCircle },
    { id: 'favorites' as LibTab, label: t.favorites, icon: Heart },
    { id: 'bookmarks' as LibTab, label: t.bookmarks, icon: Bookmark },
    { id: 'history' as LibTab, label: t.readingHistory, icon: Clock },
  ];

  const readingNovels = CONTINUE_READING;
  const completedNovels = NOVELS.filter(n => n.progress === 100);
  const favoriteNovels = NOVELS.filter(n => n.isFavorite);
  const bookmarkedNovels = NOVELS.filter(n => n.isBookmarked);
  const historyNovels = NOVELS.slice(0, 6);

  const getTabNovels = () => {
    switch (tab) {
      case 'reading': return readingNovels;
      case 'completed': return completedNovels;
      case 'favorites': return favoriteNovels;
      case 'bookmarks': return bookmarkedNovels;
      case 'history': return historyNovels;
    }
  };

  const novels = getTabNovels();

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t.myLibrary}</h1>
        {user && (
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#e91e8c]/30" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-[#e91e8c] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {novels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No novels here yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Explore stories and add them to your library</p>
            <Link to="/" className="mt-4 inline-block btn-primary px-6 py-2.5 rounded-xl text-sm">Explore Stories</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {novels.map(novel => (
              <div key={novel.id} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 hover:border-[#e91e8c]/30 transition-colors group">
                <Link to={`/novel/${novel.id}`}>
                  <img src={novel.cover} alt={novel.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <Link to={`/novel/${novel.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#e91e8c] transition-colors line-clamp-2 leading-snug">{novel.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{novel.penName}</p>

                  {novel.progress !== undefined && tab === 'reading' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Ch. {novel.currentChapter}</span>
                        <span className="text-xs font-medium text-[#e91e8c]">{novel.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#e91e8c] rounded-full" style={{ width: `${novel.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {tab === 'completed' && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-medium">Completed</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end justify-center gap-2">
                  {tab === 'reading' && (
                    <Link to={`/read/${novel.id}/${novel.currentChapter || 1}`}
                      className="btn-primary text-xs px-4 py-2 rounded-full shrink-0">
                      Continue
                    </Link>
                  )}
                  {tab !== 'reading' && (
                    <Link to={`/novel/${novel.id}`} className="p-2 hover:text-[#e91e8c] text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
