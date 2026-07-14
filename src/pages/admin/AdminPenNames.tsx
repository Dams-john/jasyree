import { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { NOVELS } from '../../data/novels';

const PEN_NAMES = [...new Map(NOVELS.map(n => [n.penName, n])).values()].map((n, i) => ({
  id: i + 1,
  name: n.penName,
  novels: NOVELS.filter(nov => nov.penName === n.penName).length,
  cover: n.cover,
  totalViews: NOVELS.filter(nov => nov.penName === n.penName).reduce((acc, nov) => acc + parseInt(nov.views.replace(/[^0-9]/g, '')), 0),
}));

export default function AdminPenNames() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pen Names</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{PEN_NAMES.length} authors</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Pen Name
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Pen Name</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Novels</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PEN_NAMES.map((pen, i) => (
              <tr key={pen.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${i === PEN_NAMES.length - 1 ? 'border-0' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={pen.cover} alt={pen.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{pen.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {pen.novels} novel{pen.novels !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
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
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Pen Name</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Pen Name" className="input-field" />
              <input type="email" placeholder="Email (optional)" className="input-field" />
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
