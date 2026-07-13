const CACHE_NAME = 'tawjihi-cache-v1';
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
