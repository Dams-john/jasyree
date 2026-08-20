import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { adminApi, AdminNovelListItem, AdminNovelDetail, AdminChapterListItem } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminChapters() {
  const [novels, setNovels] = useState<AdminNovelListItem[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
  const [novelDetail, setNovelDetail] = useState<AdminNovelDetail | null>(null);
  const [chapters, setChapters] = useState<AdminChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [number, setNumber] = useState('');
  const [chTitle, setChTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [coinCost, setCoinCost] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.listNovels().then(list => {
      setNovels(list);
      if (list.length > 0) setSelectedNovelId(list[0].id);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const translationId = novelDetail?.translations[0]?.id;

  const loadChapters = () => {
    if (!translationId) return;
    setLoading(true);
    adminApi.listChapters(translationId).then(setChapters).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!selectedNovelId) return;
    setLoading(true);
    adminApi.showNovel(selectedNovelId).then(setNovelDetail).catch(() => {});
  }, [selectedNovelId]);

  useEffect(() => {
    if (translationId) loadChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translationId) return;
    setSubmitting(true);
    setError('');
    try {
      await adminApi.createChapter(translationId, {
        number: Number(number),
        title: chTitle,
        content,
        isPremium,
        coinCost: Number(coinCost) || 0,
        publishStatus: 'published',
      });
      setShowAdd(false);
      setNumber(''); setChTitle(''); setContent(''); setIsPremium(false); setCoinCost('0');
      loadChapters();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (chapterId: number) => {
    if (!confirm('Delete this chapter?')) return;
    try {
      await adminApi.deleteChapter(chapterId);
      loadChapters();
    } catch {
      // ignore
    }
  };

  const novelTitle = novelDetail?.translations[0]?.title;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chapters</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage chapters for novels</p>
        </div>
        <button onClick={() => setShowAdd(true)} disabled={!translationId} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {novels.length === 0 ? (
        <div className="card p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No novels yet — create one under Novels first.
        </div>
      ) : (
        <>
          {/* Novel Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Select Novel</label>
            <select value={selectedNovelId ?? ''} onChange={e => setSelectedNovelId(Number(e.target.value))} className="input-field w-full max-w-sm">
              {novels.map(n => (
                <option key={n.id} value={n.id}>{n.translations[0]?.title || n.slug}</option>
              ))}
            </select>
          </div>

          {novelTitle && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{novelTitle}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{chapters.length} chapters</p>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            {loading ? (
              <div className="py-10 flex justify-center"><span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Words</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">No chapters found for this novel.</td></tr>
                  ) : chapters.map((ch, i) => (
                    <tr key={ch.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${i === chapters.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ch.number}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{ch.title}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">{ch.wordCount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 w-fit text-xs font-medium px-2 py-0.5 rounded-full ${ch.isPremium ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                          {ch.isPremium ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {ch.isPremium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400 capitalize">{ch.publishStatus}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => handleDelete(ch.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Chapter</h3>
            {error && <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            <div className="space-y-3">
              <input type="number" value={number} onChange={e => setNumber(e.target.value)} placeholder="Chapter Number" className="input-field" required min={1} />
              <input type="text" value={chTitle} onChange={e => setChTitle(e.target.value)} placeholder="Chapter Title" className="input-field" required />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Chapter Content" className="input-field resize-none h-32" required />
              <div className="flex gap-3">
                <select value={isPremium ? 'Premium' : 'Free'} onChange={e => setIsPremium(e.target.value === 'Premium')} className="input-field flex-1">
                  <option>Free</option>
                  <option>Premium</option>
                </select>
                <input type="number" value={coinCost} onChange={e => setCoinCost(e.target.value)} placeholder="Coin Cost" className="input-field flex-1" min={0} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 rounded-xl text-sm">{submitting ? 'Adding…' : 'Add Chapter'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
