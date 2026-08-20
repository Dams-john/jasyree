import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { GENRES } from '../../data/genres';

export default function AdminGenres() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Genres</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{GENRES.length} genres</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Genre
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GENRES.map(genre => (
          <div key={genre.id} className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${genre.color}20` }}>
              {genre.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white">{genre.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{genre.count.toLocaleString()} novels</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Genre</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Genre Name" className="input-field" />
              <input type="text" placeholder="Icon Emoji" className="input-field" />
              <input type="text" placeholder="Color (hex)" className="input-field" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-primary py-2.5 rounded-xl text-sm">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
