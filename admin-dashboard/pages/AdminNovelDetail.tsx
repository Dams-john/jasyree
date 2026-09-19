import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Globe, Check } from 'lucide-react';
import { adminApi, AdminNovelDetail as NovelDetail, AdminChapter } from '../adminApi';
import { ApiError } from '../api';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
];

export default function AdminNovelDetail() {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<NovelDetail | null>(null);
  const [activeTranslationId, setActiveTranslationId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [showAddLang, setShowAddLang] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [langForm, setLangForm] = useState({ language: 'fr', title: '', synopsis: '' });
  const [chapterForm, setChapterForm] = useState({ number: 1, title: '', content: '', publishNow: true, scheduledAt: '' });

  const loadNovel = () => {
    if (!id) return;
    setLoading(true);
    adminApi.getNovel(Number(id)).then(n => {
      setNovel(n);
      if (n.translations.length > 0 && !activeTranslationId) {
        setActiveTranslationId(n.translations[0].id);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(loadNovel, [id]);

  useEffect(() => {
    if (!activeTranslationId) return;
    setChaptersLoading(true);
    adminApi.getChapters(activeTranslationId).then(setChapters).finally(() => setChaptersLoading(false));
  }, [activeTranslationId]);

  const activeTranslation = novel?.translations.find(t => t.id === activeTranslationId);

  const handlePublishTranslation = async () => {
    if (!activeTranslationId) return;
    await adminApi.updateTranslation(activeTranslationId, { publishStatus: 'published' });
    loadNovel();
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novel) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.addTranslation(novel.id, langForm);
      setLangForm({ language: 'fr', title: '', synopsis: '' });
      setShowAddLang(false);
      loadNovel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add language edition.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTranslationId) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.createChapter(activeTranslationId, {
        number: chapterForm.number,
        title: chapterForm.title,
        content: chapterForm.content,
        publishStatus: chapterForm.publishNow || chapterForm.scheduledAt ? 'published' : 'draft',
        publishedAt: chapterForm.scheduledAt || undefined,
      });
      setChapterForm({ number: chapterForm.number + 1, title: '', content: '', publishNow: true, scheduledAt: '' });
      setShowChapterForm(false);
      adminApi.getChapters(activeTranslationId).then(setChapters);
      loadNovel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create chapter.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="w-8 h-8 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" /></div>;
  }
  if (!novel) {
    return <p className="text-red-400">Novel not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{activeTranslation?.title || novel.slug}</h1>
        <p className="text-sm text-gray-500 mt-1">by pen name #{novel.penNameId} · {novel.translations.length} language edition(s)</p>
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        {novel.translations.map(t => (
          <button key={t.id} onClick={() => setActiveTranslationId(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTranslationId === t.id ? 'bg-[#e91e8c] text-white' : 'bg-[#151521] text-gray-400 border border-gray-800'}`}>
            <Globe className="w-3.5 h-3.5" />
            {t.language.toUpperCase()}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.publishStatus === 'published' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
              {t.publishStatus}
            </span>
          </button>
        ))}
        <button onClick={() => setShowAddLang(!showAddLang)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add Language
        </button>
      </div>

      {showAddLang && (
        <form onSubmit={handleAddLanguage} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
              <select value={langForm.language} onChange={e => setLangForm({ ...langForm, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]">
                {LANGUAGES.filter(l => !novel.translations.some(t => t.language === l.code)).map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
              <input value={langForm.title} onChange={e => setLangForm({ ...langForm, title: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="Translated title" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Synopsis</label>
            <textarea value={langForm.synopsis} onChange={e => setLangForm({ ...langForm, synopsis: e.target.value })} required rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="Translated synopsis" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
            {saving ? 'Adding...' : 'Add Language Edition'}
          </button>
        </form>
      )}

      {activeTranslation && (
        <>
          {activeTranslation.publishStatus !== 'published' && (
            <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-amber-400">This {activeTranslation.language.toUpperCase()} edition is still a draft — not visible to readers yet.</p>
              <button onClick={handlePublishTranslation} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <Check className="w-4 h-4" />
                Publish Edition
              </button>
            </div>
          )}

          {/* Chapters */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Chapters ({activeTranslation.chaptersCount} live)</h2>
            <button onClick={() => setShowChapterForm(!showChapterForm)} className="flex items-center gap-2 bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              New Chapter
            </button>
          </div>

          {showChapterForm && (
            <form onSubmit={handleAddChapter} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Chapter #</label>
                  <input type="number" value={chapterForm.number} onChange={e => setChapterForm({ ...chapterForm, number: Number(e.target.value) })} required min={1}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                  <input value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="Chapter title" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
                <textarea value={chapterForm.content} onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })} required rows={8}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="Chapter text..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Schedule for later (optional) — leave blank to publish immediately
                </label>
                <input type="datetime-local" value={chapterForm.scheduledAt} onChange={e => setChapterForm({ ...chapterForm, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={saving} className="bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
                {saving ? 'Saving...' : chapterForm.scheduledAt ? 'Schedule Chapter' : 'Publish Chapter'}
              </button>
            </form>
          )}

          {chaptersLoading ? (
            <div className="flex justify-center py-10"><span className="w-6 h-6 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" /></div>
          ) : chapters.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No chapters yet for this language edition.</p>
          ) : (
            <div className="space-y-2">
              {chapters.map(ch => (
                <div key={ch.id} className="flex items-center justify-between bg-[#151521] border border-gray-800 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Chapter {ch.number}: {ch.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ch.wordCount.toLocaleString()} words {ch.isPremium ? `· ${ch.coinCost} coins` : '· Free'}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                    ch.publishStatus === 'published' ? 'bg-emerald-900/40 text-emerald-400' :
                    ch.publishStatus === 'scheduled' ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {ch.publishStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
