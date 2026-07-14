export interface Genre {
  id: number;
  name: string;
  icon: string;
  count: number;
  color: string;
  cover: string;
}

export const GENRES: Genre[] = [
  { id: 1, name: 'Werewolf', icon: '🐺', count: 2840, color: '#6366f1', cover: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 2, name: 'Romance', icon: '💕', count: 5120, color: '#e91e8c', cover: 'https://images.pexels.com/photos/3932839/pexels-photo-3932839.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 3, name: 'Fantasy', icon: '✨', count: 3680, color: '#f59e0b', cover: 'https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 4, name: 'Billionaire', icon: '💼', count: 1920, color: '#10b981', cover: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 5, name: 'Drama', icon: '🎭', count: 2240, color: '#ef4444', cover: 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 6, name: 'Mystery', icon: '🔍', count: 1560, color: '#8b5cf6', cover: 'https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 7, name: 'Thriller', icon: '⚡', count: 1340, color: '#f97316', cover: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 8, name: 'Vampire', icon: '🧛', count: 980, color: '#dc2626', cover: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 9, name: 'Contemporary', icon: '🌆', count: 2100, color: '#0ea5e9', cover: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 10, name: 'Dark Romance', icon: '🖤', count: 1780, color: '#374151', cover: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 11, name: 'Suspense', icon: '😱', count: 1420, color: '#7c3aed', cover: 'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 12, name: 'Dragon', icon: '🐉', count: 860, color: '#d97706', cover: 'https://images.pexels.com/photos/3617501/pexels-photo-3617501.jpeg?auto=compress&cs=tinysrgb&w=400' },
];
