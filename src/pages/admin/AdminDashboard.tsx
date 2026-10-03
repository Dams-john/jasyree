import { useEffect, useState } from 'react';
import { ArrowUpRight, Users, BookOpen, DollarSign, Eye, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/resources';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNovels: 0,
    totalReads: 0,
    revenue: 0,
  });
  const [novelCount, setNovelCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then(s => setStats({
        totalUsers: s.totalUsers ?? 0,
        totalNovels: s.totalNovels ?? 0,
        totalReads: s.totalReads ?? 0,
        revenue: s.revenue ?? 0,
      }))
      .catch(() => setError('Live stats are not available yet. Showing zeros instead of demo numbers.'));

    adminApi.listNovels()
      .then(novels => setNovelCount(novels.length))
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Total Reads', value: stats.totalReads.toLocaleString(), icon: Eye, color: 'bg-emerald-500' },
    { label: 'Total Revenue', value: `₦${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500' },
    { label: 'Novels', value: (stats.totalNovels || novelCount).toLocaleString(), icon: Crown, color: 'bg-[#e91e8c]' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Live admin figures. Empty means there is no real data yet.</p>
      </div>

      {error && <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/admin/novels" className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e91e8c]/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#e91e8c]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Manage Novels</p>
            <p className="text-xs text-gray-500">{novelCount} total</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
        <Link to="/admin/users" className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e91e8c]/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[#e91e8c]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Manage Users</p>
            <p className="text-xs text-gray-500">{stats.totalUsers.toLocaleString()} total</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
