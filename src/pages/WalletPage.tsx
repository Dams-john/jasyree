import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Gift, ShoppingBag } from 'lucide-react';
import { COIN_PACKAGES, TRANSACTIONS } from '../data/coins';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function WalletPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const totalSpent = TRANSACTIONS.filter(tx => tx.type === 'spend').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalEarned = TRANSACTIONS.filter(tx => tx.type === 'reward').reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#e91e8c] to-[#c41578] px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold text-white mb-1">{t.wallet}</h1>
        <p className="text-white/70 text-sm mb-6">Your coin balance & transactions</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/80 text-sm">My Coins</p>
            <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full capitalize">{user?.subscription} Plan</span>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-4xl">🪙</span>
              <span className="text-4xl font-black text-white">{user?.coins.toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
            {[
              { label: 'Purchased', value: '3,500', icon: ShoppingBag },
              { label: 'Earned', value: String(totalEarned), icon: Gift },
              { label: 'Spent', value: String(totalSpent), icon: ArrowDownLeft },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-black text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4 grid grid-cols-2 gap-3 mb-6">
        <Link to="/buy-coins" className="bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#e91e8c]/30 transition-colors shadow-sm">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <span className="text-xl">🪙</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{t.buyCoins}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Get more coins</p>
          </div>
        </Link>
        <Link to="/subscription" className="bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#e91e8c]/30 transition-colors shadow-sm">
          <div className="w-10 h-10 bg-[#e91e8c]/10 rounded-xl flex items-center justify-center">
            <span className="text-xl">⭐</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Subscribe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Get monthly coins</p>
          </div>
        </Link>
      </div>

      {/* Coin Packages Preview */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Popular Packages</h2>
          <Link to="/buy-coins" className="text-sm text-[#e91e8c]">{t.viewAll}</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-0 pb-2">
          {COIN_PACKAGES.slice(0, 4).map(pkg => (
            <Link to="/buy-coins" key={pkg.id}
              className={`shrink-0 w-32 p-3 rounded-xl border transition-colors text-center ${pkg.isPopular ? 'border-[#e91e8c] bg-[#e91e8c]/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32]'}`}>
              {pkg.isPopular && (
                <span className="inline-block text-[10px] font-bold text-white bg-[#e91e8c] px-2 py-0.5 rounded-full mb-1">Popular</span>
              )}
              <div className="text-2xl mb-1">🪙</div>
              <p className="font-black text-gray-900 dark:text-white text-sm">{pkg.coins.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{pkg.currency} {pkg.price.toLocaleString()}</p>
              {pkg.bonus && <p className="text-[10px] text-emerald-500 font-medium">+{pkg.bonus} bonus</p>}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['overview', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white dark:bg-[#1e1e32] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {tab === 'history' ? t.purchaseHistory : 'Overview'}
            </button>
          ))}
        </div>

        {activeTab === 'history' && (
          <div className="space-y-2">
            {TRANSACTIONS.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'purchase' ? 'bg-blue-100 dark:bg-blue-900/30' : tx.type === 'reward' ? 'bg-emerald-100 dark:bg-emerald-900/30' : tx.type === 'spend' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {tx.type === 'purchase' ? <ShoppingBag className="w-4 h-4 text-blue-500" /> :
                    tx.type === 'reward' ? <Gift className="w-4 h-4 text-emerald-500" /> :
                      tx.type === 'spend' ? <ArrowDownLeft className="w-4 h-4 text-red-500" /> :
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{tx.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Bal: {tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'This Month', value: '2,450 🪙', sub: 'coins used', color: 'text-[#e91e8c]' },
                { label: 'Chapters Unlocked', value: '3', sub: 'this week', color: 'text-blue-500' },
                { label: 'Rewards Earned', value: `${totalEarned} 🪙`, sub: 'this month', color: 'text-emerald-500' },
                { label: 'Active Streak', value: '5 days', sub: 'daily login', color: 'text-amber-500' },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-xl bg-white dark:bg-[#1e1e32] border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
