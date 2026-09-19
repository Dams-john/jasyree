import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { adminApi, AdminNovel, PenName, AdminGenre } from '../../lib/adminApi';
import { ApiError } from '../../lib/api';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
];

export default function AdminNovels() {
  const [novels, setNovels] = useState<AdminNovel[]>([]);
  const [penNames, setPenNames] = useState<PenName[]>([]);
  const [genres, setGenres] = useState<(AdminGenre & { icon: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    penNameId: '', language: 'en', title: '', synopsis: '', cover: '', genreIds: [] as number[],
  });

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getNovels(), adminApi.getPenNames(), adminApi.listGenres()])
      .then(([n, p, g]) => { setNovels(n); setPenNames(p); setGenres(g); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleGenre = (id: number) => {
    setForm(f => ({
      ...f,
      genreIds: f.genreIds.includes(id) ? f.genreIds.filter(g => g !== id) : [...f.genreIds, id],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.penNameId) { setError('Choose a pen name first.'); return; }
    setSaving(true);
    setError('');
    try {
      await adminApi.createNovel({
        penNameId: Number(form.penNameId),
        language: form.language,
        title: form.title,
        synopsis: form.synopsis,
        cover: form.cover || undefined,
        genreIds: form.genreIds,
      });
      setForm({ penNameId: '', language: 'en', title: '', synopsis: '', cover: '', genreIds: [] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create novel.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Novels</h1>
          <p className="text-sm text-gray-500 mt-1">{novels.length} novels</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          New Novel
        </button>
      </div>

      {penNames.length === 0 && !loading && (
        <div className="bg-amber-900/20 border border-amber-800/40 text-amber-400 text-sm rounded-xl p-4">
          You need a pen name before you can create a novel. <Link to="/admin/pen-names" className="underline font-semibold">Create one first</Link>.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#151521] border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Pen Name</label>
              <select value={form.penNameId} onChange={e => setForm({ ...form, penNameId: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]">
                <option value="">Select...</option>
                {penNames.map(pn => <option key={pn.id} value={pn.id}>{pn.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="Novel title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Cover Image URL</label>
            <input value={form.cover} onChange={e => setForm({ ...form, cover: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Synopsis</label>
            <textarea value={form.synopsis} onChange={e => setForm({ ...form, synopsis: e.target.value })} required rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e91e8c]" placeholder="What's this novel about?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.genreIds.includes(g.id) ? 'bg-[#e91e8c] text-white' : 'bg-[#0f0f1a] text-gray-400 border border-gray-700'}`}>
                  {g.icon} {g.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={saving || penNames.length === 0} className="bg-[#e91e8c] hover:bg-[#c41578] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Novel'}
          </button>
          <p className="text-xs text-gray-600">
            This creates the novel as a draft. You'll add chapters and publish it from the novel's page next.
          </p>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" /></div>
      ) : novels.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No novels yet — create your first one above.</p>
      ) : (
        <div className="space-y-3">
          {novels.map(novel => (
            <Link key={novel.id} to={`/admin/novels/${novel.id}`}
              className="flex items-center gap-4 bg-[#151521] border border-gray-800 rounded-2xl p-4 hover:border-[#e91e8c]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#e91e8c]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{novel.translations[0]?.title || novel.slug}</p>
                <p className="text-xs text-gray-500">by {novel.penName}</p>
              </div>
              <div className="flex gap-1.5">
                {novel.translations.map(t => (
                  <span key={t.language} className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase ${t.publishStatus === 'published' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                    {t.language} · {t.chaptersCount}ch
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
