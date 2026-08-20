import { useState, useEffect } from 'react';
import { Plus, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, AdminNovelListItem, PenName } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminNovels() {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [novels, setNovels] = useState<AdminNovelListItem[]>([]);
  const [penNames, setPenNames] = useState<PenName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [penNameId, setPenNameId] = useState<number | ''>('');
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.listNovels(), adminApi.listPenNames()])
      .then(([n, p]) => { setNovels(n); setPenNames(p); })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load novels.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = novels.filter(n =>
    !query || n.slug.toLowerCase().includes(query.toLowerCase()) || n.penName.toLowerCase().includes(query.toLowerCase()) ||
    n.translations.some(t => t.title.toLowerCase().includes(query.toLowerCase()))
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penNameId) { setFormError('Select a pen name first.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      await adminApi.createNovel({ penNameId: Number(penNameId), language: 'en', title, synopsis, status });
      setShowAdd(false);
      setTitle(''); setSynopsis(''); setPenNameId('');
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create novel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">All Novels</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{novels.length} novels total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add New Novel
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search novels by title or pen name..."
          className="input-field pl-9" />
      </div>

      {error && <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center"><span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Pen Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Chapters</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Views</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">No novels found.</td></tr>
                ) : filtered.map((novel, i) => {
                  const primary = novel.translations[0];
                  return (
                    <tr key={novel.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">{primary?.title || novel.slug}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{novel.penName}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{novel.penName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${primary?.publishStatus === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                          {primary?.publishStatus || 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">{primary?.chaptersCount ?? 0}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-700 dark:text-gray-300">{novel.views.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link to={`/novel/${novel.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Novel Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Novel</h3>
            {formError && <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{formError}</div>}
            <div className="space-y-3">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Novel Title" className="input-field" required />
              <select value={penNameId} onChange={e => setPenNameId(e.target.value ? Number(e.target.value) : '')} className="input-field" required>
                <option value="">Select Pen Name…</option>
                {penNames.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <textarea value={synopsis} onChange={e => setSynopsis(e.target.value)} placeholder="Synopsis" className="input-field resize-none h-24" required />
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
              {penNames.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">You need a pen name first — add one under Pen Names.</p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button type="submit" disabled={submitting || penNames.length === 0} className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">{submitting ? 'Adding…' : 'Add Novel'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
