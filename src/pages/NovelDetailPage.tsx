import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, BookmarkPlus, BookmarkCheck, Heart, Eye, Share2, Lock, Check } from 'lucide-react';
import { Novel, Chapter } from '../data/novels';
import { COMMENTS } from '../data/users';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { novelApi, userApi } from '../lib/resources';
import { ApiError } from '../lib/api';

type Tab = 'chapters' | 'about' | 'comments';

export default function NovelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('chapters');
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockChapter, setUnlockChapter] = useState<number | null>(null);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([novelApi.show(id), novelApi.chapters(id)])
      .then(([n, ch]) => {
        if (cancelled) return;
        setNovel(n);
        setChapters(ch);
      })
      .catch(err => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load novel.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const comments = COMMENTS.filter(c => c.novelId === novel?.id);

  const toggleBookmark = async () => {
    if (!novel) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setBusy(true);
    try {
      if (novel.isBookmarked) {
        await userApi.removeBookmark(novel.id);
      } else {
        await userApi.addBookmark(novel.id);
      }
      setNovel({ ...novel, isBookmarked: !novel.isBookmarked });
    } catch {
      // ignore — leave state unchanged
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (!novel) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setBusy(true);
    try {
      if (novel.isFavorite) {
        await userApi.removeFavorite(novel.id);
      } else {
        await userApi.addFavorite(novel.id);
      }
      setNovel({ ...novel, isFavorite: !novel.isFavorite });
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  const handleReadChapter = (chapterNum: number, isPremium: boolean, isUnlocked?: boolean) => {
    if (isPremium && !isUnlocked) {
      setUnlockChapter(chapterNum);
      setShowUnlock(true);
    } else {
      navigate(`/read/${novel!.id}/${chapterNum}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !novel) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Novel not found'}</p>
        <Link to="/" className="btn-primary px-6 py-2.5 rounded-xl">Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-white dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/search')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="flex gap-5 p-4 sm:p-6">
        <div className="shrink-0">
          <img src={novel.cover} alt={novel.title} className="w-28 sm:w-36 h-40 sm:h-52 object-cover rounded-xl shadow-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {novel.genres.map(g => (
              <span key={g} className="text-xs px-2 py-0.5 bg-[#e91e8c]/10 text-[#e91e8c] rounded-full font-medium">{g}</span>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1">{novel.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">By {novel.penName}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-gray-900 dark:text-white">{novel.rating}</span>
              <span className="text-xs">({(novel.reviews / 1000).toFixed(1)}K)</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-gray-400" />
              <span>{novel.views}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${novel.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
              {novel.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 hidden sm:block">{novel.synopsis}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate(`/read/${novel.id}/1`)} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 rounded-full">
              <BookOpen className="w-4 h-4" />
              {t.readNow}
            </button>
            <button onClick={toggleBookmark} disabled={busy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${novel.isBookmarked ? 'bg-[#e91e8c]/10 border-[#e91e8c] text-[#e91e8c]' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#e91e8c] hover:text-[#e91e8c]'}`}>
              {novel.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
              {novel.isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={toggleFavorite} disabled={busy}
              className={`p-2.5 rounded-full border transition-colors ${novel.isFavorite ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${novel.isFavorite ? 'fill-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Synopsis (mobile) */}
      <div className="px-4 sm:hidden mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{novel.synopsis}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {novel.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mx-4 grid grid-cols-3 bg-gray-50 dark:bg-[#1e1e32] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4">
        {[
          { label: 'Chapters', value: novel.chapters },
          { label: 'Views', value: novel.views },
          { label: 'Reviews', value: `${(novel.reviews / 1000).toFixed(1)}K` },
        ].map((stat, i) => (
          <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-gray-100 dark:border-gray-800' : ''}`}>
            <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-4 mb-4">
        <div className="flex gap-6">
          {(['chapters', 'about', 'comments'] as Tab[]).map(tabId => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className={`py-3 text-sm font-semibold capitalize transition-colors relative ${tab === tabId ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {tabId === 'chapters' ? t.chapters : tabId === 'about' ? 'About' : t.comments}
              {tab === tabId && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e91e8c] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {tab === 'chapters' && (
          <div className="space-y-2">
            {chapters.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">No chapters published yet.</div>
            ) : chapters.map(ch => (
              <div key={ch.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${ch.isRead ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-[#e91e8c]/30'}`}
                onClick={() => handleReadChapter(ch.number, ch.isPremium, ch.isUnlocked)}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Chapter {ch.number}</span>
                    {ch.isRead && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ch.title} · Published {ch.publishedAt}</p>
                </div>
                {ch.isPremium && !ch.isUnlocked ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    {ch.coinCost} Coins
                  </span>
                ) : ch.isRead ? (
                  <span className="text-xs text-emerald-500 font-medium">Read</span>
                ) : (
                  <span className="text-xs font-semibold text-[#e91e8c]">{ch.isPremium ? 'Unlocked' : 'Free'}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-5 py-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Synopsis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{novel.synopsis}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Status', value: novel.status },
                  { label: 'Language', value: novel.language.toUpperCase() },
                  { label: 'Chapters', value: String(novel.chapters) },
                  { label: 'Last Updated', value: novel.updatedAt },
                ].map(d => (
                  <div key={d.label} className="bg-gray-50 dark:bg-[#1e1e32] p-3 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {novel.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div>
            <div className="flex gap-3 mb-6">
              <input type="text" placeholder="Write a comment..." className="input-field flex-1" />
              <button className="btn-primary px-5 py-2.5 rounded-xl text-sm">Post</button>
            </div>
            <div className="space-y-5">
              {comments.map(comment => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#e91e8c]">
                          ❤️ {comment.likes}
                        </button>
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#e91e8c]">Reply</button>
                      </div>
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3 mt-3 ml-4">
                          <img src={reply.userAvatar} alt={reply.userName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{reply.userName}</span>
                              <span className="text-xs text-gray-400">{reply.time}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unlock Modal */}
      {showUnlock && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Premium Chapter</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Unlock Chapter {unlockChapter} to continue reading.
              </p>
            </div>
            <div className="space-y-3">
              <Link to="/subscription" onClick={() => setShowUnlock(false)}
                className="block text-center py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                ✨ Subscribe for Unlimited Access
              </Link>
            </div>
            <button onClick={() => setShowUnlock(false)} className="w-full mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
