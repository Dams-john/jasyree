import { useEffect, useState } from 'react';
import { Plus, User } from 'lucide-react';
import { adminApi, PenName } from '../../lib/adminApi';
import { ApiError } from '../../lib/api';

export default function AdminPenNames() {
  const [penNames, setPenNames] = useState<PenName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getPenNames().then(setPenNames).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.createPenName(name);
      setName('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create pen name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Pen Names</h1>
          <p className="text-sm text-gray-500 mt-1">Author identities you publish under</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          New Pen Name
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="e.g. Temijasire" />
          </div>
          <button type="submit" disabled={saving} className="bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </form>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" /></div>
      ) : penNames.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No pen names yet — create one to start publishing novels.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {penNames.map(pn => (
            <div key={pn.id} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e91e8c]/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#e91e8c]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{pn.name}</p>
                <p className="text-xs text-gray-500">/{pn.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
