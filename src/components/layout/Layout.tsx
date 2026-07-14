import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

const HIDE_NAV_PATHS = ['/login', '/signup', '/forgot-password', '/email-verification', '/reset-password'];
const HIDE_MOBILE_NAV = ['/read/'];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hideNav = HIDE_NAV_PATHS.some(p => location.pathname === p);
  const hideMobileNav = HIDE_MOBILE_NAV.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a]">
      {!hideNav && (
        <>
          <Header onMenuToggle={() => setSidebarOpen(true)} />
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}
      <main className={`${!hideNav && !hideMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </main>
      {!hideNav && !hideMobileNav && <MobileNav />}
    </div>
  );
}
