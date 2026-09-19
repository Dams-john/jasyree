import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, Eye, DollarSign, Coins, Crown, Megaphone } from 'lucide-react';
import { adminApi, AdminStats } from '../../lib/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => setError('Could not load statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-red-400">{error || 'Something went wrong.'}</p>;
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#3b82f6' },
    { label: 'Total Novels', value: stats.totalNovels.toLocaleString(), icon: BookOpen, color: '#e91e8c' },
    { label: 'Total Chapters', value: `${stats.publishedChapters.toLocaleString()} / ${stats.totalChapters.toLocaleString()}`, icon: FileText, color: '#8b5cf6', sub: 'published / total' },
    { label: 'Total Reads', value: stats.totalReads.toLocaleString(), icon: Eye, color: '#10b981' },
  ];

  const revenueCards = [
    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
    { label: 'Coin Sales', value: `$${stats.coinSales.total.toLocaleString()}`, sub: `${stats.coinSales.count} purchases`, icon: Coins, color: '#eab308' },
    { label: 'Subscription Sales', value: `$${stats.subscriptionSales.total.toLocaleString()}`, sub: `${stats.subscriptionSales.count} active`, icon: Crown, color: '#a855f7' },
    { label: 'Ad Revenue', value: stats.advertisementRevenue === null ? 'Not tracked' : `$${stats.advertisementRevenue}`, icon: Megaphone, color: '#6b7280' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-[#151521] border border-gray-800 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${c.color}20` }}>
              <c.icon className="w-4 h-4" style={{ color: c.color }} />
            </div>
            <p className="text-2xl font-black text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}{c.sub ? ` (${c.sub})` : ''}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Monetization</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueCards.map(c => (
            <div key={c.label} className="bg-[#151521] border border-gray-800 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${c.color}20` }}>
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <p className="text-2xl font-black text-white">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}{c.sub ? ` — ${c.sub}` : ''}</p>
            </div>
          ))}
        </div>
        {stats.advertisementRevenue === null && (
          <p className="text-xs text-gray-600 mt-3">
            Revenue figures will populate once a payment provider is integrated. Ad revenue isn't tracked at all yet — no ads system exists.
          </p>
        )}
      </div>
    </div>
  );
}
