import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, BookOpen, Users, Tag, PenTool, Megaphone, Gift, Settings, ChevronLeft, Menu, X, Home, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_NAV = [
  { icon: BarChart2, label: 'Dashboard', to: '/admin' },
  { icon: BookOpen, label: 'Novels', to: '/admin/novels' },
  { icon: BookOpen, label: 'Chapters', to: '/admin/chapters' },
  { icon: Tag, label: 'Genres', to: '/admin/genres' },
  { icon: PenTool, label: 'Pen Names', to: '/admin/pen-names' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: Megaphone, label: 'Advertisements', to: '/admin/ads' },
  { icon: Gift, label: 'Rewards', to: '/admin/rewards' },
  { icon: TrendingUp, label: 'Analytics', to: '/admin/analytics' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] flex">
      {/* Sidebar */}
      <>
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#1a1a2e] border-r border-gray-100 dark:border-gray-800 z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:z-auto flex flex-col`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Link to="/" className="text-xl font-black text-[#e91e8c]">JASYRE</Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-1">Admin Panel</p>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {ADMIN_NAV.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors ${isActive ? 'bg-[#e91e8c] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          )}
        </aside>
      </>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-[#e91e8c] transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:block">Back to Site</span>
          </button>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {ADMIN_NAV.find(n => n.to === location.pathname)?.label || 'Admin'}
          </span>
        </div>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
