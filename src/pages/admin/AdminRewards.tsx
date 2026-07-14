import { useState } from 'react';
import { Plus, Edit2, Trash2, Gift } from 'lucide-react';

const REWARDS_CONFIG = [
  { id: 1, type: 'Daily Login Day 1', coins: 10, status: 'active' },
  { id: 2, type: 'Daily Login Day 2', coins: 20, status: 'active' },
  { id: 3, type: 'Daily Login Day 3', coins: 30, status: 'active' },
  { id: 4, type: 'Daily Login Day 4', coins: 40, status: 'active' },
  { id: 5, type: 'Daily Login Day 5', coins: 50, status: 'active' },
  { id: 6, type: 'Daily Login Day 6', coins: 60, status: 'active' },
  { id: 7, type: 'Daily Login Day 7', coins: 100, status: 'active' },
  { id: 8, type: 'Watch Ad Reward', coins: 15, status: 'active' },
  { id: 9, type: 'Reading Reward (30 min)', coins: 20, status: 'active' },
  { id: 10, type: 'Referral Bonus', coins: 100, status: 'active' },
  { id: 11, type: 'First Login Bonus', coins: 50, status: 'active' },
];

export default function AdminRewards() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Rewards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage reward configurations</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Reward
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REWARDS_CONFIG.map(reward => (
          <div key={reward.id} className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{reward.type}</p>
              <p className="text-sm text-amber-500 font-bold mt-0.5">🪙 {reward.coins} coins</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${reward.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {reward.status}
              </span>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Reward</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Reward Name" className="input-field" />
              <input type="number" placeholder="Coins Amount" className="input-field" />
              <select className="input-field">
                <option>active</option>
                <option>inactive</option>
              </select>
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
