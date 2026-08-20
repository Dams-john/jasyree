import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { adminApi, PenName } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminPenNames() {
  const [penNames, setPenNames] = useState<PenName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.listPenNames().then(setPenNames).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await adminApi.createPenName({ name, bio: bio || undefined });
      setShowAdd(false);
      setName('');
      setBio('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create pen name.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pen Names</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{penNames.length} pen name{penNames.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Pen Name
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center"><span className="w-6 h-6 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Pen Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Bio</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {penNames.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">No pen names yet. Add one to start publishing novels.</td></tr>
              ) : penNames.map((pen, i) => (
                <tr key={pen.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${i === penNames.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {pen.avatar ? (
                        <img src={pen.avatar} alt={pen.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{pen.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{pen.bio || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete not supported by the API yet">
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

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Pen Name</h3>
            {error && <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            <div className="space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Pen Name" className="input-field" required />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio (optional)" className="input-field resize-none h-20" />
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 rounded-xl text-sm">{submitting ? 'Adding…' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
