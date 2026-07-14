import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, TrendingUp } from 'lucide-react';

const ADS = [
  { id: 1, name: 'Summer Reading Campaign', type: 'Banner', status: 'active', impressions: 45230, clicks: 1240, ctr: '2.7%' },
  { id: 2, name: 'Diamond Plan Promo', type: 'Interstitial', status: 'active', impressions: 23100, clicks: 890, ctr: '3.8%' },
  { id: 3, name: 'New Release Spotlight', type: 'Rewarded', status: 'paused', impressions: 12450, clicks: 560, ctr: '4.5%' },
  { id: 4, name: 'Coin Bundle Offer', type: 'Native', status: 'active', impressions: 67800, clicks: 2100, ctr: '3.1%' },
];

export default function AdminAds() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Advertisements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{ADS.length} campaigns</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: '148.6K', icon: Eye, color: 'text-blue-500' },
          { label: 'Total Clicks', value: '4,790', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Avg CTR', value: '3.2%', icon: TrendingUp, color: 'text-amber-500' },
          { label: 'Active Campaigns', value: '3', icon: TrendingUp, color: 'text-[#e91e8c]' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Impressions</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">CTR</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ADS.map((ad, i) => (
                <tr key={ad.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${i === ADS.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ad.name}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">{ad.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ad.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 dark:text-gray-300">{ad.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm font-medium text-emerald-500">{ad.ctr}</td>
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
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Campaign</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Campaign Name" className="input-field" />
              <select className="input-field">
                <option>Banner</option>
                <option>Interstitial</option>
                <option>Rewarded</option>
                <option>Native</option>
              </select>
              <input type="date" className="input-field" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-primary py-2.5 rounded-xl text-sm">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
