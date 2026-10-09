import { useState, useEffect } from 'react';
import { Plus, Eye, Search, Upload, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, AdminNovelListItem, PenName, Tag } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminNovels() {
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [novels, setNovels] = useState<AdminNovelListItem[]>([]);
  const [penNames, setPenNames] = useState<PenName[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [penNameId, setPenNameId] = useState<number | ''>('');
  const [synopsis, setSynopsis] = useState('');
  const [cover, setCover] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingNovelId, setEditingNovelId] = useState<number | null>(null);
  const [editTranslationId, setEditTranslationId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editStatus, setEditStatus] = useState('ongoing');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    Promise.all([
      adminApi.listNovels().catch(err => {
        setError(err instanceof ApiError ? err.message : 'Failed to load novels.');
        return [] as AdminNovelListItem[];
      }),
      adminApi.listPenNames().catch(() => [] as PenName[]),
      adminApi.listTags().catch(() => [] as Tag[]),
    ]).then(([n, p, t]) => {
      setNovels(n);
      setPenNames(p);
      setAvailableTags(t);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = novels.filter(n =>
    !query ||
    n.slug.toLowerCase().includes(query.toLowerCase()) ||
    n.penName.toLowerCase().includes(query.toLowerCase()) ||
    n.translations.some(t => t.title.toLowerCase().includes(query.toLowerCase()))
  );

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penNameId) {
      setFormError('Select a pen name first.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await adminApi.createNovel({
        penNameId: Number(penNameId),
        language: 'en',
        title,
        synopsis,
        status,
        cover: cover.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      setShowAdd(false);
      setTitle('');
      setSynopsis('');
      setCover('');
      setPenNameId('');
      setSelectedTagIds([]);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create novel.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (novelId: number) => {
    setPublishingId(novelId);
    try {
      const detail = await adminApi.showNovel(novelId);
      const translation = detail.translations[0];
      if (!translation?.id) {
        setError('No translation found to publish.');
        return;
      }
      await adminApi.updateTranslation(translation.id, { publishStatus: 'published' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish.');
    } finally {
      setPublishingId(null);
    }
  };

  const openEdit = async (novelId: number) => {
    setEditError('');
    try {
      const detail = await adminApi.showNovel(novelId);
      const t = detail.translations[0];
      if (!t) {
        setError('No translation found to edit.');
        return;
      }
      setEditingNovelId(novelId);
      setEditTranslationId(t.id);
      setEditTitle(t.title || '');
      setEditSynopsis(t.synopsis || '');
      setEditCover(t.cover || '');
      setEditStatus(t.status || 'ongoing');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load novel for edit.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTranslationId) return;
    setEditSubmitting(true);
    setEditError('');
    try {
      await adminApi.updateTranslation(editTranslationId, {
        title: editTitle,
        synopsis: editSynopsis,
        cover: editCover.trim() || null,
        status: editStatus,
      });
      setEditingNovelId(null);
      setEditTranslationId(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update novel.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (novelId: number, titleLabel: string) => {
    if (!window.confirm(`Delete "${titleLabel}"? This cannot be undone.`)) return;
    setDeletingId(novelId);
    try {
      await adminApi.deleteNovel(novelId);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete novel.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">All Novels</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{novels.length} novels total</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Novel
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search novels by title or pen name..."
          className="input-field pl-9"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center">
            <span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
          </div>
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
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No novels found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((novel, i) => {
                    const primary = novel.translations[0];
                    const label = primary?.title || novel.slug;
                    return (
                      <tr
                        key={novel.id}
                        className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          i === filtered.length - 1 ? 'border-0' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{novel.penName}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{novel.penName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                              primary?.publishStatus === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                            }`}
                          >
                            {primary?.publishStatus || 'draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">
                          {primary?.chaptersCount ?? 0}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-700 dark:text-gray-300">
                          {novel.views.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Link
                              to={`/novel/${novel.id}`}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => openEdit(novel.id)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {primary?.publishStatus !== 'published' && (
                              <button
                                type="button"
                                title="Publish"
                                disabled={publishingId === novel.id}
                                onClick={() => handlePublish(novel.id)}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors disabled:opacity-50"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete"
                              disabled={deletingId === novel.id}
                              onClick={() => handleDelete(novel.id, label)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white dark:bg-[#1e1e32] rounded-t-2xl sm:rounded-2xl w-full max-w-lg h-[min(92vh,720px)] sm:h-auto sm:max-h-[min(90vh,720px)] flex flex-col shadow-xl"
          >
            <div className="p-5 pb-2 shrink-0 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Novel</h3>
              {formError && (
                <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="px-5 py-3 space-y-3 overflow-y-auto flex-1 min-h-0">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Novel Title" className="input-field" required />
              <select value={penNameId} onChange={e => setPenNameId(e.target.value ? Number(e.target.value) : '')} className="input-field" required>
                <option value="">Select Pen Name…</option>
                {penNames.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <textarea value={synopsis} onChange={e => setSynopsis(e.target.value)} placeholder="Synopsis" className="input-field resize-none h-24" required />
              <input type="url" value={cover} onChange={e => setCover(e.target.value)} placeholder="Cover image URL (optional)" className="input-field" />
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Select Tags</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {availableTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-[#e91e8c] text-white border-[#e91e8c]'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {penNames.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">You need a pen name first — add one under Pen Names.</p>
              )}
            </div>

            <div className="flex gap-3 p-4 pt-3 shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32] sticky bottom-0">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || penNames.length === 0}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add Novel'}
              </button>
            </div>
          </form>
        </div>
      )}

            <div className="px-6 space-y-3 overflow-y-auto flex-1 min-h-0">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Novel Title"
                className="input-field"
                required
              />
              <select
                value={penNameId}
                onChange={e => setPenNameId(e.target.value ? Number(e.target.value) : '')}
                className="input-field"
                required
              >
                <option value="">Select Pen Name…</option>
                {penNames.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <textarea
                value={synopsis}
                onChange={e => setSynopsis(e.target.value)}
                placeholder="Synopsis"
                className="input-field resize-none h-24"
                required
              />
              <input
                type="url"
                value={cover}
                onChange={e => setCover(e.target.value)}
                placeholder="Cover image URL (optional)"
                className="input-field"
              />
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {availableTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-[#e91e8c] text-white border-[#e91e8c]'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {penNames.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  You need a pen name first — add one under Pen Names.
                </p>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-4 shrink-0 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || penNames.length === 0}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {submitting ? 'Adding…' : 'Add Novel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingNovelId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleEdit}
            className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-lg my-auto max-h-[min(90vh,720px)] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Novel</h3>
            {editError && (
              <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {editError}
              </div>
            )}
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Novel Title"
                className="input-field"
                required
              />
              <textarea
                value={editSynopsis}
                onChange={e => setEditSynopsis(e.target.value)}
                placeholder="Synopsis"
                className="input-field resize-none h-24"
                required
              />
              <input
                type="url"
                value={editCover}
                onChange={e => setEditCover(e.target.value)}
                placeholder="Cover image URL (optional)"
                className="input-field"
              />
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-field">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setEditingNovelId(null);
                  setEditTranslationId(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              <button
                type="submit"
                disabled={editSubmitting}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {editSubmitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
      }
