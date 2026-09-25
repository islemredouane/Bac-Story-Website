const CACHE_NAME = 'bac-story-v14';
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

// Activate Event - Purge old caches immediately
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

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. NEVER intercept full-page navigations!
  // Allowing the browser to handle HTML navigations natively completely eliminates
  // ERR_FAILED, prevents clean-URL redirect failures, and lets Chrome perform native
  // multi-IP failover if an edge IP is temporarily unreachable.
  if (req.mode === 'navigate') {
    return;
  }

  // 2. Only handle same-origin GET requests
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (e) {}
  if (req.method !== 'GET' || !sameOrigin) {
    return;
  }

  // 3. Never intercept dynamic API endpoints
  try {
    if (new URL(req.url).pathname.startsWith('/api/')) return;
  } catch (e) {}

  // 4. Stale-While-Revalidate for sub-resources (CSS, JS, images, component HTML)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const networkFetch = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
