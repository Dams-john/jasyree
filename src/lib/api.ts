const API_URL = (import.meta.env.VITE_API_URL as string) || 'https://jasyree-1.onrender.com/api';

const ACCESS_KEY = 'jasyre_access_token';
const REFRESH_KEY = 'jasyre_refresh_token';

export const tokenStorage = {
  get accessToken() { return localStorage.getItem(ACCESS_KEY); },
  get refreshToken() { return localStorage.getItem(REFRESH_KEY); },
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  errors?: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Decodes the `role` claim out of our access token without verifying the signature (display-only). */
export function decodeRole(accessToken: string | null): string | null {
  if (!accessToken) return null;
  try {
    const [, body] = accessToken.split('.');
    const padded = body.padEnd(body.length + ((4 - (body.length % 4)) % 4), '=');
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(API_URL.replace(/\/$/, '') + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.refreshToken;
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async res => {
        if (!res.ok) return false;
        const json = await res.json();
        if (!json.success) return false;
        tokenStorage.set(json.data.tokens.access_token, json.data.tokens.refresh_token);
        return true;
      })
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth, skipRefresh, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && tokenStorage.accessToken) {
    finalHeaders.Authorization = `Bearer ${tokenStorage.accessToken}`;
  }

  const res = await fetch(buildUrl(path, params), { ...rest, headers: finalHeaders });

  if (res.status === 401 && !skipAuth && !skipRefresh && tokenStorage.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
    tokenStorage.clear();
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.errors);
  }

  return json.data as T;
}

export async function apiFetchPaginated<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<{ items: T[]; total: number; page: number; perPage: number; totalPages: number }> {
  const { params, skipAuth, skipRefresh, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (!skipAuth && tokenStorage.accessToken) {
    finalHeaders.Authorization = `Bearer ${tokenStorage.accessToken}`;
  }

  const res = await fetch(buildUrl(path, params), { ...rest, headers: finalHeaders });

  if (res.status === 401 && !skipAuth && !skipRefresh && tokenStorage.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetchPaginated<T>(path, { ...options, skipRefresh: true });
    }
    tokenStorage.clear();
  }

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.errors);
  }

  return {
    items: json.data as T[],
    total: json.meta.total,
    page: json.meta.page,
    perPage: json.meta.per_page,
    totalPages: json.meta.total_pages,
  };
}
