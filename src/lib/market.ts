/** Nigeria → NGN; everyone else → USD until more markets are configured */
export function detectMarketCurrency(): 'NGN' | 'USD' {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Africa/Lagos') return 'NGN';
    const lang = (navigator.language || '').toLowerCase();
    if (lang === 'en-ng' || lang.endsWith('-ng')) return 'NGN';
  } catch {
    /* ignore */
  }
  return 'USD';
}
