import { TrendingUp, Users, BookOpen, DollarSign, Eye } from 'lucide-react';
import { NOVELS } from '../../data/novels';

const MONTHLY_DATA = [
  { month: 'Jan', reads: 120000, revenue: 450000, users: 800 },
  { month: 'Feb', reads: 145000, revenue: 520000, users: 950 },
  { month: 'Mar', reads: 135000, revenue: 490000, users: 890 },
  { month: 'Apr', reads: 180000, revenue: 650000, users: 1100 },
  { month: 'May', reads: 160000, revenue: 590000, users: 1020 },
  { month: 'Jun', reads: 200000, revenue: 730000, users: 1250 },
  { month: 'Jul', reads: 175000, revenue: 640000, users: 1150 },
  { month: 'Aug', reads: 245000, revenue: 890000, users: 1480 },
  { month: 'Sep', reads: 220000, revenue: 800000, users: 1340 },
  { month: 'Oct', reads: 195000, revenue: 710000, users: 1200 },
  { month: 'Nov', reads: 265000, revenue: 960000, users: 1590 },
  { month: 'Dec', reads: 240000, revenue: 870000, users: 1420 },
];

const maxReads = Math.max(...MONTHLY_DATA.map(d => d.reads));
const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

export default function AdminAnalytics() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Active Users', value: '12,548', delta: '+12.5%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Reads This Month', value: '2.45M', delta: '+18.3%', icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Monthly Revenue', value: 'NGN 960K', delta: '+16.7%', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Active Stories', value: '78', delta: '+5.4%', icon: BookOpen, color: 'text-[#e91e8c]', bg: 'bg-[#e91e8c]/10' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{stat.label}</p>
            <span className="text-xs font-bold text-emerald-500 mt-1 inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {stat.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Reads Chart */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Reads Overview (12 months)</h2>
        <div className="flex items-end gap-2 h-40">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#e91e8c] rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${(d.reads / maxReads) * 100}%` }}
                title={`${d.month}: ${(d.reads / 1000).toFixed(0)}K reads`} />
              <span className="text-[8px] text-gray-400 dark:text-gray-600">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Overview (12 months)</h2>
        <div className="flex items-end gap-2 h-40">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-amber-400 rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                title={`${d.month}: NGN ${(d.revenue / 1000).toFixed(0)}K`} />
              <span className="text-[8px] text-gray-400 dark:text-gray-600">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Novels */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Performing Novels</h2>
        <div className="space-y-3">
          {NOVELS.slice(0, 8).map((novel, i) => {
            const pct = Math.round(((8 - i) / 8) * 100);
            return (
              <div key={novel.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-black text-[#e91e8c]">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{novel.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{novel.views}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full bg-[#e91e8c] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
