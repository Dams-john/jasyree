import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, AdminGenre } from '../../lib/adminApi';
import { ApiError } from '../../lib/api';

export default function AdminGenres() {
  const [genres, setGenres] = useState<(AdminGenre & { icon: string; count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.listGenres().then(setGenres).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.createGenre({ name, icon: icon || undefined });
      setName('');
      setIcon('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create genre.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Genres</h1>
          <p className="text-sm text-gray-500 mt-1">{genres.length} genres</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          New Genre
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 flex items-end gap-3">
          <div className="w-20">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Icon</label>
            <input value={icon} onChange={e => setIcon(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="🚀" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="e.g. Sci-Fi" />
          </div>
          <button type="submit" disabled={saving} className="bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </form>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {genres.map(g => (
            <div key={g.id} className="bg-[#151521] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{g.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{g.name}</p>
                <p className="text-xs text-gray-500">{g.count} novels</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
