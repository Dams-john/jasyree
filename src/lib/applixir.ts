const APPLIXIR_SCRIPT = 'https://cdn.applixir.com/applixir.app.v6.1.0.js';
// Sandbox — swap for live key after activation
const APPLIXIR_API_KEY = '5a4db0c5-0000-4000-8000-5a4db0c50001';

declare global {
  interface Window {
    initializeAndOpenPlayer?: (options: {
      apiKey: string;
      injectionElementId: string;
      adStatusCallbackFn: (status: { type: string }) => void;
      adErrorCallbackFn: (error: { getError: () => { data: unknown } }) => void;
    }) => void;
  }
}

function ensureContainer(): void {
  if (document.getElementById('applixir-ad-container')) return;
  const el = document.createElement('div');
  el.id = 'applixir-ad-container';
  document.body.appendChild(el);
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.initializeAndOpenPlayer) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${APPLIXIR_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('AppLixir script failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = APPLIXIR_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('AppLixir script failed'));
    document.head.appendChild(s);
  });
}

/** Show rewarded ad; resolves only when status.type === 'complete'. */
export function watchRewardedAd(): Promise<void> {
  return loadScript().then(
    () =>
      new Promise<void>((resolve, reject) => {
        ensureContainer();
        if (!window.initializeAndOpenPlayer) {
          reject(new Error('AppLixir player not available'));
          return;
        }
        window.initializeAndOpenPlayer({
          apiKey: APPLIXIR_API_KEY,
          injectionElementId: 'applixir-ad-container',
          adStatusCallbackFn: status => {
            if (status.type === 'complete') {
              resolve();
            }
          },
          adErrorCallbackFn: error => {
            try {
              console.error('Ad error:', error.getError().data);
            } catch {
              console.error('Ad error');
            }
            reject(new Error('Ad failed or was closed early'));
          },
        });
      })
  );
}
