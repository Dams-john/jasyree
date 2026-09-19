import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/layout/Layout';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import GenresPage from './pages/GenresPage';
import NovelDetailPage from './pages/NovelDetailPage';
import ReadingPage from './pages/ReadingPage';
import LibraryPage from './pages/LibraryPage';
import WalletPage from './pages/WalletPage';
import BuyCoinsPage from './pages/BuyCoinsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import RewardsPage from './pages/RewardsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import CommentsPage from './pages/CommentsPage';
import RankingPage from './pages/RankingPage';

import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNovels from './pages/admin/AdminNovels';
import AdminNovelDetail from './pages/admin/AdminNovelDetail';
import AdminPenNames from './pages/admin/AdminPenNames';
import AdminGenres from './pages/admin/AdminGenres';


export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Pages (no layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/email-verification" element={<EmailVerificationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Reading Page (full screen, no standard header) */}
              <Route path="/read/:novelId/:chapterNum" element={<ReadingPage />} />

              {/* Admin: separate login, deliberately not linked from the regular site nav.
                  Same account system as everyone else, but its own entry point — a reader
                  account is rejected immediately on this screen, never silently logged in. */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="novels" element={<AdminNovels />} />
                <Route path="novels/:id" element={<AdminNovelDetail />} />
                <Route path="pen-names" element={<AdminPenNames />} />
                <Route path="genres" element={<AdminGenres />} />
              </Route>

              {/* Main App Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/genres" element={<GenresPage />} />
                <Route path="/genres/:id" element={<GenresPage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/novel/:id" element={<NovelDetailPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/buy-coins" element={<BuyCoinsPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/comments" element={<CommentsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
