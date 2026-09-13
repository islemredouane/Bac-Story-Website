const CACHE_NAME = 'bac-story-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/components/shared.js',
  '/components/navbar.html',
  '/components/footer.html',
  '/components/search.html',
  '/ads-config.js',
  '/favicon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          fetch(url)
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn('SW pre-cache skip:', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Fast 2s Cache Fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests — never intercept POSTs or cross-origin calls
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (e) {}
  if (req.method !== 'GET' || !sameOrigin) {
    return;
  }

  // Never intercept dynamic API endpoints
  try {
    if (new URL(req.url).pathname.startsWith('/api/')) return;
  } catch (e) {}

  event.respondWith(
    new Promise((resolve) => {
      let resolved = false;

      // Fast fallback: if network hangs for > 2000ms, serve from cache if available
      const timeoutTimer = setTimeout(() => {
        caches.match(req).then((cached) => {
          if (cached && !resolved) {
            resolved = true;
            resolve(cached);
          }
        });
      }, 2000);

      fetch(req)
        .then((response) => {
          clearTimeout(timeoutTimer);
          if (response && response.ok) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          if (!resolved) {
            resolved = true;
            resolve(response);
          }
        })
        .catch(() => {
          clearTimeout(timeoutTimer);
          caches.match(req).then((cached) => {
            if (!resolved) {
              resolved = true;
              if (cached) {
                resolve(cached);
              } else if (req.mode === 'navigate') {
                caches.match('/index.html').then((fallback) => {
                  resolve(fallback || new Response('Offline', { status: 503 }));
                });
              } else {
                resolve(new Response('', { status: 504, statusText: 'Gateway Timeout' }));
              }
            }
          });
        });
    })
  );
});
