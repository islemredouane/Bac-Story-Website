const CACHE_NAME = 'bac-story-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/components/shared.js',
  '/favicon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Force update immediately
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
  self.clients.claim(); // Take control of all pages immediately
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests — never intercept POSTs (feedback
  // submissions) or cross-origin calls (API, ads, analytics, fonts). This
  // also stops dynamic API responses from being cached and served stale.
  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (e) {}
  if (req.method !== 'GET' || !sameOrigin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((response) => {
        // Only cache successful responses — never cache errors/redirects
        if (response && response.ok) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(req);
      })
  );
});
