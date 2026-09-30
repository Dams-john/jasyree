export const DEFAULT_AVATAR = '/default-avatar.svg';

export function getAvatarUrl(avatar?: string | null): string {
  return avatar && avatar.trim() ? avatar : DEFAULT_AVATAR;
}
