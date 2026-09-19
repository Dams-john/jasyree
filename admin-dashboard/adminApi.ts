import { api } from './api';

export interface PenName {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
}

export interface AdminNovel {
  id: number;
  slug: string;
  penName: string;
  penNameId: number;
  isFeatured: boolean;
  rating: number;
  views: number;
  translations: {
    language: string;
    title: string;
    status: string;
    publishStatus: string;
    chaptersCount: number;
  }[];
}

export interface AdminNovelDetail {
  id: number;
  slug: string;
  penNameId: number;
  isFeatured: boolean;
  genres: { id: number; name: string }[];
  translations: {
    id: number;
    language: string;
    title: string;
    slug: string;
    cover: string | null;
    synopsis: string | null;
    status: string;
    publishStatus: string;
    chaptersCount: number;
  }[];
}

export interface AdminChapter {
  id: number;
  number: number;
  title: string;
  wordCount: number;
  isPremium: boolean;
  coinCost: number;
  publishStatus: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  publishedChapters: number;
  totalReads: number;
  revenue: number;
  coinSales: { total: number; count: number };
  subscriptionSales: { total: number; count: number };
  advertisementRevenue: number | null;
}

export interface AdminGenre {
  id: number;
  name: string;
  slug: string;
}

export const adminApi = {
  // Genres (public list, used for the genre picker)
  listGenres: () => api.get<(AdminGenre & { icon: string; count: number })[]>('/genres', { skipAuth: true }),

  // Pen names
  getPenNames: () => api.get<PenName[]>('/admin/pen-names'),
  createPenName: (name: string) => api.post<{ id: number; name: string; slug: string }>('/admin/pen-names', { name }),

  // Novels
  getNovels: () => api.get<AdminNovel[]>('/admin/novels'),
  getNovel: (id: number) => api.get<AdminNovelDetail>(`/admin/novels/${id}`),
  createNovel: (data: {
    penNameId: number; language: string; title: string; synopsis: string;
    cover?: string; status?: string; genreIds?: number[]; tagIds?: number[];
  }) => api.post<{ novelId: number; translationId: number; slug: string }>('/admin/novels', data),
  addTranslation: (novelId: number, data: { language: string; title: string; synopsis: string; cover?: string; status?: string }) =>
    api.post<{ translationId: number }>(`/admin/novels/${novelId}/translations`, data),
  updateTranslation: (translationId: number, data: Partial<{
    title: string; synopsis: string; cover: string; status: string; publishStatus: string;
  }>) => api.put(`/admin/translations/${translationId}`, data),

  // Chapters
  getChapters: (translationId: number) => api.get<AdminChapter[]>(`/admin/translations/${translationId}/chapters`),
  createChapter: (translationId: number, data: {
    number: number; title: string; content: string; isPremium?: boolean;
    coinCost?: number; publishStatus?: string; publishedAt?: string;
  }) => api.post<{ chapterId: number }>(`/admin/translations/${translationId}/chapters`, data),
  updateChapter: (chapterId: number, data: Partial<{
    title: string; content: string; isPremium: boolean; coinCost: number;
    publishStatus: string; publishedAt: string | null;
  }>) => api.put(`/admin/chapters/${chapterId}`, data),
  deleteChapter: (chapterId: number) => api.delete(`/admin/chapters/${chapterId}`),

  // Genres
  createGenre: (data: { name: string; icon?: string; color?: string; cover?: string }) =>
    api.post<{ id: number; name: string; slug: string }>('/admin/genres', data),

  // Stats
  getStats: () => api.get<AdminStats>('/admin/stats'),

  // Notifications
  broadcastNotification: (data: { title: string; message: string; audience: 'all' | 'subscribers' }) =>
    api.post<{ recipientCount: number }>('/admin/notifications/broadcast', data),
  rewardCoins: (userId: number, amount: number, message?: string) =>
    api.post<{ newBalance: number }>(`/admin/users/${userId}/reward-coins`, { amount, message }),
  grantSubscription: (userId: number, planSlug: string, days: number) =>
    api.post<{ plan: string; expiresAt: string }>(`/admin/users/${userId}/subscription`, { planSlug, days }),
};
