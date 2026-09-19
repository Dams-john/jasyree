import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrap admin routes with this. Blocks anyone who isn't logged in, or logged in
 * but without 'author'/'admin' role — sending them to the dedicated admin login,
 * never the regular reader /login page, so the two entry points stay separate.
 * The backend also enforces this on every admin API call — this is just so the
 * page itself doesn't render for the wrong people.
 */
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <span className="w-8 h-8 border-2 border-gray-700 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'author' && user.role !== 'admin')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
