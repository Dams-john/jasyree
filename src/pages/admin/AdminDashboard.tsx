import { ArrowUpRight, Users, BookOpen, DollarSign, Star, TrendingUp, Eye, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NOVELS } from '../../data/novels';
import { ADMIN_USERS } from '../../data/users';

const STATS = [
  { label: 'Total Users', value: '12,548', change: '+12.5%', icon: Users, color: 'bg-blue-500' },
  { label: 'Total Reads', value: '2.45M', change: '+18.3%', icon: Eye, color: 'bg-emerald-500' },
  { label: 'Total Revenue', value: '₦8.45M', change: '+16.7%', icon: DollarSign, color: 'bg-amber-500' },
  { label: 'Active Subscriptions', value: '1,284', change: '+9.2%', icon: Crown, color: 'bg-[#e91e8c]' },
];

const READS_DATA = [45, 60, 50, 75, 65, 85, 70, 90, 80, 95, 88, 100];
const REVENUE_DATA = [40, 65, 45, 80, 55, 90, 70, 100, 85, 60, 95, 75];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const QUICK_LINKS = [
  { label: 'Manage Novels', to: '/admin/novels', count: 78, icon: BookOpen },
  { label: 'Manage Users', to: '/admin/users', count: 12548, icon: Users },
  { label: 'Analytics', to: '/admin/analytics', count: null, icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">vs last month</p>
          </div>
        ))}
      </div>

      {/* Dual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reads Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Reads Overview</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly reading activity</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Reads</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {READS_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all hover:from-emerald-600 hover:to-emerald-500 relative" style={{ height: `${val}%` }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(val * 24.5).toFixed(0)}K
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-600">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly revenue (₦)</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e91e8c]/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#e91e8c]" />
              <span className="text-xs font-semibold text-[#e91e8c]">Revenue</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {REVENUE_DATA.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full rounded-t-md bg-gradient-to-t from-[#e91e8c] to-[#f062b5] transition-all hover:from-[#c41578] hover:to-[#e91e8c] relative" style={{ height: `${val}%` }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₦{(val * 84.5).toFixed(0)}K
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-600">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Novels + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Novels */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Top Novels</h2>
            <Link to="/admin/novels" className="text-sm text-[#e91e8c] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {NOVELS.slice(0, 5).map((novel, i) => (
              <div key={novel.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-[#e91e8c] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{i + 1}</span>
                <img src={novel.cover} alt={novel.title} className="w-8 h-11 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{novel.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{novel.penName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{novel.views}</p>
                  <p className="text-[10px] text-gray-400">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-[#e91e8c] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {ADMIN_USERS.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.joinedAt}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${user.subscription === 'gold' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : user.subscription === 'diamond' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : user.subscription === 'silver' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {user.subscription}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_LINKS.map(link => (
          <Link key={link.to} to={link.to} className="card p-4 flex items-center gap-3 hover:border-[#e91e8c]/30 transition-colors">
            <div className="w-10 h-10 bg-[#e91e8c]/10 rounded-xl flex items-center justify-center">
              <link.icon className="w-5 h-5 text-[#e91e8c]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{link.label}</p>
              {link.count !== null && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{link.count.toLocaleString()} total</p>
              )}
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}
