import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Genre } from '../../data/genres';
import { genreApi, adminApi } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminGenres() {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Genre | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#e91e8c');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    genreApi
      .list()
      .then(data => setGenres(data || []))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load genres.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setName('');
    setIcon('');
    setColor('#e91e8c');
    setFormError('');
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (genre: Genre) => {
    setEditing(genre);
    setName(genre.name || '');
    setIcon(genre.icon || '');
    setColor(genre.color || '#e91e8c');
    setFormError('');
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Genre name is required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await adminApi.updateGenre(editing.id, {
          name: name.trim(),
          icon: icon.trim() || undefined,
          color: color.trim() || undefined,
        });
      } else {
        await adminApi.createGenre({
          name: name.trim(),
          icon: icon.trim() || undefined,
          color: color.trim() || undefined,
        });
      }
      closeModal();
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (genre: Genre) => {
    if (!window.confirm(`Delete genre "${genre.name}"?`)) return;
    setDeletingId(genre.id);
    setError('');
    try {
      await adminApi.deleteGenre(genre.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Genres</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{genres.length} genres</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Genre
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {genres.map(genre => (
            <div key={genre.id} className="card p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${genre.color || '#e91e8c'}20` }}
              >
                {genre.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white">{genre.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(genre.count ?? 0).toLocaleString()} novels
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(genre)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(genre)}
                  disabled={deletingId === genre.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editing ? 'Edit Genre' : 'Add Genre'}
            </h3>
            {formError && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {formError}
              </div>
            )}
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Genre Name"
                className="input-field"
                required
              />
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="Icon Emoji (e.g. 🐺)"
                className="input-field"
              />
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Color (hex)"
                className="input-field"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {submitting ? 'Saving…' : editing ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    );
}
