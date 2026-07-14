import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';

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

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNovels from './pages/admin/AdminNovels';
import AdminChapters from './pages/admin/AdminChapters';
import AdminGenres from './pages/admin/AdminGenres';
import AdminPenNames from './pages/admin/AdminPenNames';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAds from './pages/admin/AdminAds';
import AdminRewards from './pages/admin/AdminRewards';
import AdminAnalytics from './pages/admin/AdminAnalytics';

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

              {/* Admin Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="novels" element={<AdminNovels />} />
                <Route path="chapters" element={<AdminChapters />} />
                <Route path="genres" element={<AdminGenres />} />
                <Route path="pen-names" element={<AdminPenNames />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="ads" element={<AdminAds />} />
                <Route path="rewards" element={<AdminRewards />} />
                <Route path="analytics" element={<AdminAnalytics />} />
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
