import { apiFetch } from '../src/lib/api';

export const api = {
  get: <T>(path: string, options?: { skipAuth?: boolean }) =>
    apiFetch<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(data) }),

  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};

