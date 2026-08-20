import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Settings2, Sun, Moon, AlignJustify, ChevronLeft, ChevronRight, X, Type, Maximize2, Minimize2 } from 'lucide-react';
import { NOVELS, CHAPTERS, CHAPTER_CONTENT } from '../data/novels';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

type ReaderTheme = 'dark' | 'light' | 'sepia';

export default function ReadingPage() {
  const { novelId, chapterNum } = useParams<{ novelId: string; chapterNum: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(theme === 'dark' ? 'dark' : 'light');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const novel = NOVELS.find(n => n.id === Number(novelId));
  const chN = Number(chapterNum);
  const chapter = CHAPTERS.find(c => c.novelId === Number(novelId) && c.number === chN);
  const totalChapters = novel?.chapters || 12;

  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const scrollPct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(100, Math.round(scrollPct)));
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContentClick = () => {
    setShowUI(prev => !prev);
    if (showSettings) setShowSettings(false);
  };

  const bgColor = readerTheme === 'dark' ? '#0f0f1a' : readerTheme === 'sepia' ? '#f7f0e6' : '#ffffff';
  const textColor = readerTheme === 'dark' ? '#e2e8f0' : readerTheme === 'sepia' ? '#5c4a32' : '#1a1a2e';
  const toolbarBg = readerTheme === 'dark' ? '#1e1e32' : '#ffffff';

  if (!novel) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Novel not found</p>
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
          <button onClick={() => setIsBookmarked(!isBookmarked)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
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
            <p className="text-xs opacity-50" style={{ color: textColor }}>{chapter?.publishedAt || '2024-05-12'}</p>
          </div>

          <div className="whitespace-pre-line leading-relaxed select-text" style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing, color: textColor, fontFamily: "'Georgia', serif" }}>
            {CHAPTER_CONTENT}
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
            <button onClick={() => setReaderTheme(t => t === 'light' ? 'dark' : 'light')} className="flex flex-col items-center gap-0.5" style={{ color: textColor }}>
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
