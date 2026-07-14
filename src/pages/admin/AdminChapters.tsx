import { useState } from 'react';
import { Plus, Edit2, Trash2, Lock, Unlock } from 'lucide-react';
import { CHAPTERS } from '../../data/novels';
import { NOVELS } from '../../data/novels';

export default function AdminChapters() {
  const [selectedNovel, setSelectedNovel] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const chapters = CHAPTERS.filter(c => c.novelId === selectedNovel);
  const novel = NOVELS.find(n => n.id === selectedNovel);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chapters</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage chapters for novels</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {/* Novel Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Select Novel</label>
        <select value={selectedNovel} onChange={e => setSelectedNovel(Number(e.target.value))} className="input-field w-full max-w-sm">
          {NOVELS.map(n => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
      </div>

      {novel && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
          <img src={novel.cover} alt={novel.title} className="w-10 h-14 object-cover rounded" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{novel.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{novel.penName} · {chapters.length} chapters</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Published</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Words</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Type</th>
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
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">{ch.publishedAt}</td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500 dark:text-gray-400">{ch.wordCount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 w-fit text-xs font-medium px-2 py-0.5 rounded-full ${ch.isPremium ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                    {ch.isPremium ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {ch.isPremium ? 'Premium' : 'Free'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Chapter</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Chapter Title" className="input-field" />
              <textarea placeholder="Chapter Content" className="input-field resize-none h-32" />
              <div className="flex gap-3">
                <select className="input-field flex-1">
                  <option>Free</option>
                  <option>Premium</option>
                </select>
                <input type="number" placeholder="Coin Cost" className="input-field flex-1" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-primary py-2.5 rounded-xl text-sm">Add Chapter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
