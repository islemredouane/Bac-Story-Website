const CACHE_NAME = 'tawjihi-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './onboarding.html',
  './dashboard.html',
  './simulator.html',
  './specialities.html',
  './styles/tokens.css',
  './styles/app.css',
  './assets/logo.svg',
  './assets/icon-192x192.png',
  './assets/icon-512x512.png'
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Claim any clients immediately, so the user doesn't have to reload.
  event.waitUntil(clients.claim());
  
  // Delete any old caches to ensure we don't serve stale content.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network First strategy: always try the network to get the freshest version.
// If offline, fallback to the cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If we got a valid response, cache a clone of it.
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline), try the cache.
        return caches.match(event.request);
      })
  );
});
