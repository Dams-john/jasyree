import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Heart, Bookmark, Clock, ChevronRight } from 'lucide-react';
import { Novel } from '../data/novels';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { homeApi, userApi } from '../lib/resources';

type LibTab = 'reading' | 'completed' | 'favorites' | 'bookmarks' | 'history';

interface HistoryItem {
  novelId: number; novelTitle: string; novelSlug: string; cover: string; language: string;
  chapterId: number; chapterNumber: number; chapterTitle: string; readAt: string;
}

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<LibTab>('reading');

  const [reading, setReading] = useState<Novel[]>([]);
  const [favorites, setFavorites] = useState<Novel[]>([]);
  const [bookmarks, setBookmarks] = useState<Novel[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      homeApi.getHome().then(h => h.continueReading).catch(() => []),
      userApi.favorites().catch(() => []),
      userApi.bookmarks().catch(() => []),
      userApi.readingHistory(1, 30).then(r => r.items).catch(() => []),
    ]).then(([r, f, b, h]) => {
      if (cancelled) return;
      setReading(r);
      setFavorites(f);
      setBookmarks(b);
      setHistory(h);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const completedNovels = [...favorites, ...bookmarks].filter(n => n.status === 'Completed');

  const tabs = [
    { id: 'reading' as LibTab, label: 'Reading', icon: BookOpen },
    { id: 'completed' as LibTab, label: t.completed, icon: CheckCircle },
    { id: 'favorites' as LibTab, label: t.favorites, icon: Heart },
    { id: 'bookmarks' as LibTab, label: t.bookmarks, icon: Bookmark },
    { id: 'history' as LibTab, label: t.readingHistory, icon: Clock },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your library awaits</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Log in to track your reading progress, favorites and bookmarks</p>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline px-6 py-2.5 rounded-xl">Log In</Link>
          <Link to="/signup" className="btn-primary px-6 py-2.5 rounded-xl">Sign Up</Link>
        </div>
      </div>
    );
  }

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
        {tabs.map(tabDef => (
          <button key={tabDef.id} onClick={() => setTab(tabDef.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === tabDef.id ? 'bg-[#e91e8c] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <tabDef.icon className="w-3.5 h-3.5" />
            {tabDef.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
          </div>
        ) : tab === 'history' ? (
          history.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <Link key={`${h.chapterId}-${h.readAt}`} to={`/novel/${h.novelId}`} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 hover:border-[#e91e8c]/30 transition-colors">
                  <img src={h.cover} alt={h.novelTitle} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">{h.novelTitle}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Chapter {h.chapterNumber} · {h.chapterTitle}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Read {new Date(h.readAt).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <NovelList
            novels={tab === 'reading' ? reading : tab === 'completed' ? completedNovels : tab === 'favorites' ? favorites : bookmarks}
            tab={tab}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">No novels here yet</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Explore stories and add them to your library</p>
      <Link to="/" className="mt-4 inline-block btn-primary px-6 py-2.5 rounded-xl text-sm">Explore Stories</Link>
    </div>
  );
}

function NovelList({ novels, tab }: { novels: Novel[]; tab: LibTab }) {
  if (novels.length === 0) return <EmptyState />;
  return (
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
  );
}
