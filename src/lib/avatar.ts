export const DEFAULT_AVATAR = '/default-avatar.svg';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://api.jasyre.com').replace(
  /\/$/,
  ''
);

export function getAvatarUrl(avatar?: string | null): string {
  if (!avatar || !String(avatar).trim()) return DEFAULT_AVATAR;
  const a = String(avatar).trim();
  if (a.startsWith('http://') || a.startsWith('https://') || a.startsWith('data:')) {
    return a;
  }
  if (a.startsWith('/')) {
    return `\( {API_BASE} \){a}`;
  }
  return a;
}
