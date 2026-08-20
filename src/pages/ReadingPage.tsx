import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Settings2, Sun, Moon, AlignJustify, ChevronLeft, ChevronRight, X, Type, Lock } from 'lucide-react';
import { Novel, Chapter } from '../data/novels';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { novelApi, userApi } from '../lib/resources';
import { ApiError } from '../lib/api';

type ReaderTheme = 'dark' | 'light' | 'sepia';

export default function ReadingPage() {
  const { novelId, chapterNum } = useParams<{ novelId: string; chapterNum: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(theme === 'dark' ? 'dark' : 'light');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');

  const chN = Number(chapterNum);
  const chapter = chapters.find(c => c.number === chN);
  const totalChapters = novel?.chapters || chapters.length || 1;
  const progressReported = useRef(false);

  useEffect(() => {
    if (!novelId || !chapterNum) return;
    let cancelled = false;
    setLoading(true);
    setLocked(false);
    setError('');
    setContent(null);
    progressReported.current = false;

    (async () => {
      try {
        const [n, ch] = await Promise.all([novelApi.show(novelId), novelApi.chapters(novelId)]);
        if (cancelled) return;
        setNovel(n);
        setChapters(ch);
        setIsBookmarked(!!n.isBookmarked);

        const target = ch.find(c => c.number === Number(chapterNum));
        if (!target) { setError('Chapter not found.'); return; }

        const full = await novelApi.chapterContent(target.id);
        if (cancelled) return;
        setContent(full.content);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setLocked(true);
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load chapter.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [novelId, chapterNum]);

  const reportProgress = useCallback((pct: number) => {
    if (!isAuthenticated || !novel?.translationId || !chapter) return;
    if (pct >= 90 && progressReported.current) return;
    if (pct >= 90) progressReported.current = true;
    userApi.recordProgress(novel.translationId, chapter.id, pct).catch(() => {});
  }, [isAuthenticated, novel, chapter]);

  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const scrollable = el.scrollHeight - el.clientHeight;
      const scrollPct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 100;
      const pct = Math.min(100, Math.round(scrollPct));
      setProgress(pct);
      reportProgress(pct);
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [reportProgress]);

  const toggleBookmark = async () => {
    if (!novel) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      if (isBookmarked) await userApi.removeBookmark(novel.id);
      else await userApi.addBookmark(novel.id);
      setIsBookmarked(!isBookmarked);
    } catch {
      // ignore
    }
  };

  const handleContentClick = () => {
    setShowUI(prev => !prev);
    if (showSettings) setShowSettings(false);
  };

  const bgColor = readerTheme === 'dark' ? '#0f0f1a' : readerTheme === 'sepia' ? '#f7f0e6' : '#ffffff';
  const textColor = readerTheme === 'dark' ? '#e2e8f0' : readerTheme === 'sepia' ? '#5c4a32' : '#1a1a2e';
  const toolbarBg = readerTheme === 'dark' ? '#1e1e32' : '#ffffff';

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: bgColor }}>
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!novel || error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">{error || 'Novel not found'}</p>
    </div>
  );

  if (locked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
      <Lock className="w-10 h-10 text-amber-500" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chapter {chN} is locked</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">This is a premium chapter. Subscribe to unlock it.</p>
      <div className="flex gap-3">
        <Link to={`/novel/${novel.id}`} className="btn-outline px-6 py-2.5 rounded-xl">Back to Novel</Link>
        <Link to="/subscription" className="btn-primary px-6 py-2.5 rounded-xl">Subscribe</Link>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: bgColor }}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-200/20 z-50">
        <div className="h-full bg-[#e91e8c] transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ background: toolbarBg, borderBottom: `1px solid ${readerTheme === 'dark' ? '#374151' : '#e5e7eb'}` }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(`/novel/${novelId}`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" style={{ color: textColor }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: textColor }}>{novel.title}</p>
            <p className="text-xs opacity-60" style={{ color: textColor }}>Chapter {chN}</p>
          </div>
          <button onClick={toggleBookmark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-[#e91e8c]" /> : <Bookmark className="w-5 h-5" style={{ color: textColor }} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings2 className="w-5 h-5" style={{ color: textColor }} />
          </button>
        </div>
        {/* Progress display */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#e91e8c] rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs opacity-50 shrink-0" style={{ color: textColor }}>{progress}%</span>
        </div>
      </div>

      {/* Reading Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 sm:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}
        onClick={handleContentClick}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold mb-1" style={{ color: textColor }}>
              Chapter {chN}{chapter ? ` – ${chapter.title}` : ''}
            </h2>
            <p className="text-xs opacity-50" style={{ color: textColor }}>{chapter?.publishedAt}</p>
          </div>

          <div className="whitespace-pre-line leading-relaxed select-text" style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing, color: textColor, fontFamily: "'Georgia', serif" }}>
            {content}
          </div>

          <div className="mt-12 pt-6 border-t opacity-20" style={{ borderColor: textColor }}>
            <p className="text-center text-sm" style={{ color: textColor }}>— End of Chapter {chN} —</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        style={{ background: toolbarBg, borderTop: `1px solid ${readerTheme === 'dark' ? '#374151' : '#e5e7eb'}` }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => chN > 1 && navigate(`/read/${novelId}/${chN - 1}`)}
            disabled={chN <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            style={{ borderColor: readerTheme === 'dark' ? '#374151' : '#e5e7eb', color: textColor }}>
            <ChevronLeft className="w-4 h-4" />
            {t.previous}
          </button>

          {/* Bottom Icons */}
          <div className="flex items-center gap-4">
            <button className="flex flex-col items-center gap-0.5" style={{ color: textColor }}>
              <AlignJustify className="w-5 h-5 opacity-70" />
              <span className="text-[10px] opacity-60">{t.more}</span>
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="flex flex-col items-center gap-0.5" style={{ color: textColor }}>
              <Type className="w-5 h-5 opacity-70" />
              <span className="text-[10px] opacity-60">{t.font}</span>
            </button>
            <button onClick={() => setReaderTheme(th => th === 'light' ? 'dark' : 'light')} className="flex flex-col items-center gap-0.5" style={{ color: textColor }}>
              {readerTheme === 'dark' ? <Sun className="w-5 h-5 opacity-70" /> : <Moon className="w-5 h-5 opacity-70" />}
              <span className="text-[10px] opacity-60">{readerTheme === 'dark' ? t.light : t.dark}</span>
            </button>
          </div>

          <button onClick={() => chN < totalChapters && navigate(`/read/${novelId}/${chN + 1}`)}
            disabled={chN >= totalChapters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#e91e8c] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-[#c41578]">
            {t.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50" onClick={() => setShowSettings(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 space-y-5 animate-slide-up"
            style={{ background: toolbarBg }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold" style={{ color: textColor }}>Reading Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5 opacity-60" style={{ color: textColor }} />
              </button>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70" style={{ color: textColor }}>Font Size</span>
                <span className="text-sm font-bold" style={{ color: textColor }}>{fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold" style={{ borderColor: readerTheme === 'dark' ? '#374151' : '#e5e7eb', color: textColor }}>−</button>
                <input type="range" min={12} max={24} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="flex-1 accent-[#e91e8c]" />
                <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold" style={{ borderColor: readerTheme === 'dark' ? '#374151' : '#e5e7eb', color: textColor }}>+</button>
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-70" style={{ color: textColor }}>Line Spacing</span>
                <span className="text-sm font-bold" style={{ color: textColor }}>{lineSpacing}x</span>
              </div>
              <input type="range" min={1.2} max={2.5} step={0.1} value={lineSpacing} onChange={e => setLineSpacing(Number(e.target.value))} className="w-full accent-[#e91e8c]" />
            </div>

            {/* Theme */}
            <div>
              <span className="text-sm opacity-70 block mb-2" style={{ color: textColor }}>Theme</span>
              <div className="flex gap-2">
                {(['light', 'dark', 'sepia'] as ReaderTheme[]).map(th => (
                  <button key={th} onClick={() => setReaderTheme(th)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${readerTheme === th ? 'border-[#e91e8c] text-[#e91e8c]' : 'border-gray-200 dark:border-gray-700'}`}
                    style={{ background: th === 'dark' ? '#0f0f1a' : th === 'sepia' ? '#f7f0e6' : '#ffffff', color: readerTheme === th ? '#e91e8c' : th === 'dark' ? '#fff' : '#1a1a2e' }}>
                    {th === 'light' ? t.light : th === 'dark' ? t.dark : 'Sepia'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
