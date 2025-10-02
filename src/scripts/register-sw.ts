// Service worker registration
export function registerServiceWorker() {
  // Do not register service workers in development to avoid caching issues and stale assets
  if (process.env.NODE_ENV !== 'production') {
    console.log('Skipping service worker registration in development');
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}