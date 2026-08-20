import { apiFetch, apiFetchPaginated } from './api';
import { Novel, Chapter } from '../data/novels';
import { Genre } from '../data/genres';
import { User, Notification } from '../data/users';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: User; tokens: AuthTokens }>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<{ user: User; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),
  logout: (refreshToken: string) =>
    apiFetch<null>('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
  me: () => apiFetch<User>('/auth/me'),
  forgotPassword: (email: string) =>
    apiFetch<null>('/auth/forgot-password', { method: 'POST', skipAuth: true, body: JSON.stringify({ email }) }),
  resetPassword: (email: string, token: string, password: string, passwordConfirmation: string) =>
    apiFetch<null>('/auth/reset-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
    }),
  verifyEmail: (email: string, code: string) =>
    apiFetch<null>('/auth/verify-email', { method: 'POST', skipAuth: true, body: JSON.stringify({ email, code }) }),
  resendVerification: (email: string) =>
    apiFetch<null>('/auth/resend-verification', { method: 'POST', skipAuth: true, body: JSON.stringify({ email }) }),
};

export interface HomeData {
  banners: { id: number; image: string; title: string; subtitle: string; novelSlug: string; link: string | null }[];
  featured: Novel[];
  trending: Novel[];
  latestUpdates: Novel[];
  recommended: Novel[];
  newReleases: Novel[];
  completed: Novel[];
  continueReading: Novel[];
}

export const homeApi = {
  getHome: () => apiFetch<HomeData>('/home'),
  getTrending: () => apiFetch<Novel[]>('/home/trending'),
};

export const genreApi = {
  list: () => apiFetch<Genre[]>('/genres'),
  novelsByGenre: (slug: string, page = 1, perPage = 20) =>
    apiFetchPaginated<Novel>(`/genres/${slug}/novels`, { params: { page, per_page: perPage } }),
};

export const novelApi = {
  search: (query: string, page = 1, perPage = 20) =>
    apiFetchPaginated<Novel>('/search', { params: { q: query, page, per_page: perPage } }),
  show: (idOrSlug: string | number) => apiFetch<Novel & { availableLanguages: unknown[] }>(`/novels/${idOrSlug}`),
  chapters: (idOrSlug: string | number) => apiFetch<Chapter[]>(`/novels/${idOrSlug}/chapters`),
  chapterContent: (chapterId: string | number) =>
    apiFetch<{ id: number; number: number; title: string; content: string; publishedAt: string; isPremium: boolean }>(
      `/chapters/${chapterId}`
    ),
};

export const userApi = {
  updateProfile: (fields: { name?: string; avatar?: string }) =>
    apiFetch<User>('/user/profile', { method: 'PATCH', body: JSON.stringify(fields) }),
  readingHistory: (page = 1, perPage = 20) =>
    apiFetchPaginated<{
      novelId: number; novelTitle: string; novelSlug: string; cover: string; language: string;
      chapterId: number; chapterNumber: number; chapterTitle: string; readAt: string;
    }>('/user/reading-history', { params: { page, per_page: perPage } }),
  recordProgress: (translationId: number, chapterId: number, scrollPercent: number) =>
    apiFetch<null>('/user/reading-progress', {
      method: 'POST',
      body: JSON.stringify({ translationId, chapterId, scrollPercent }),
    }),
  favorites: () => apiFetch<Novel[]>('/user/favorites'),
  addFavorite: (novelId: number) => apiFetch<null>(`/user/favorites/${novelId}`, { method: 'POST' }),
  removeFavorite: (novelId: number) => apiFetch<null>(`/user/favorites/${novelId}`, { method: 'DELETE' }),
  bookmarks: () => apiFetch<Novel[]>('/user/bookmarks'),
  addBookmark: (novelId: number) => apiFetch<null>(`/user/bookmarks/${novelId}`, { method: 'POST' }),
  removeBookmark: (novelId: number) => apiFetch<null>(`/user/bookmarks/${novelId}`, { method: 'DELETE' }),
  notifications: (page = 1, perPage = 20) => apiFetchPaginated<Notification>('/user/notifications', { params: { page, per_page: perPage } }),
  markNotificationRead: (id: number) => apiFetch<null>(`/user/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiFetch<null>('/user/notifications/read-all', { method: 'PATCH' }),
};

// ---- Admin (requires author/admin role) ----

export interface AdminNovelListItem {
  id: number;
  slug: string;
  penName: string;
  penNameId: number;
  isFeatured: boolean;
  rating: number;
  views: number;
  translations: { language: string; title: string; status: string; publishStatus: string; chaptersCount: number }[];
}

export interface AdminNovelDetail {
  id: number;
  slug: string;
  penNameId: number;
  isFeatured: boolean;
  genres: { id: number; name: string }[];
  translations: {
    id: number; language: string; title: string; slug: string; cover: string | null;
    synopsis: string; status: string; publishStatus: string; chaptersCount: number;
  }[];
}

export interface AdminChapterListItem {
  id: number; number: number; title: string; wordCount: number; isPremium: boolean;
  coinCost: number; publishStatus: string; publishedAt: string | null;
}

export interface PenName { id: number; name: string; slug: string; bio: string | null; avatar: string | null }

export const adminApi = {
  listNovels: () => apiFetch<AdminNovelListItem[]>('/admin/novels'),
  showNovel: (id: number) => apiFetch<AdminNovelDetail>(`/admin/novels/${id}`),
  createNovel: (data: {
    penNameId: number; language: string; title: string; synopsis: string;
    cover?: string; status?: string; genreIds?: number[]; tagIds?: number[];
  }) => apiFetch<{ novelId: number; translationId: number; slug: string }>('/admin/novels', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addTranslation: (novelId: number, data: { language: string; title: string; synopsis: string; cover?: string; status?: string }) =>
    apiFetch<{ translationId: number }>(`/admin/novels/${novelId}/translations`, { method: 'POST', body: JSON.stringify(data) }),
  updateTranslation: (translationId: number, data: Record<string, unknown>) =>
    apiFetch<null>(`/admin/translations/${translationId}`, { method: 'PUT', body: JSON.stringify(data) }),

  listChapters: (translationId: number) => apiFetch<AdminChapterListItem[]>(`/admin/translations/${translationId}/chapters`),
  createChapter: (translationId: number, data: {
    number: number; title: string; content: string; isPremium?: boolean; coinCost?: number;
    publishStatus?: string; publishedAt?: string | null;
  }) => apiFetch<{ chapterId: number }>(`/admin/translations/${translationId}/chapters`, { method: 'POST', body: JSON.stringify(data) }),
  updateChapter: (chapterId: number, data: Record<string, unknown>) =>
    apiFetch<null>(`/admin/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChapter: (chapterId: number) => apiFetch<null>(`/admin/chapters/${chapterId}`, { method: 'DELETE' }),

  listPenNames: () => apiFetch<PenName[]>('/admin/pen-names'),
  createPenName: (data: { name: string; bio?: string; avatar?: string }) =>
    apiFetch<{ id: number; name: string; slug: string }>('/admin/pen-names', { method: 'POST', body: JSON.stringify(data) }),
};
