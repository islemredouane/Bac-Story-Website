const CACHE_NAME = 'bac-story-v34';

// Install: nothing is pre-downloaded. Pages link CSS/JS/components with ?v=<content hash>, and
// a cached file only matches the exact address a page asks for, so the old fixed list ('/style.css',
// '/script.js', ...) was downloaded on every new version and never used. Files are cached as they
// are first requested, by the fetch handler below.
self.addEventListener('install', () => {
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

  // 3. Never intercept dynamic API endpoints, nor the 1.8 MB search data: it is downloaded
  //    only when someone searches, and the browser's own cache keeps it already.
  const path = new URL(req.url).pathname;
  if (path.startsWith('/api/') || path === '/search-index.json') return;

  // 4. Stale-While-Revalidate for sub-resources (CSS, JS, images, component HTML)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const networkFetch = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone).then(() => dropOtherVersions(cache, req.url)));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});

// CSS/JS/components are linked as /file?v=<content hash>. When a new version is cached, delete
// the older ones of the same file, so the cache holds one copy per file instead of growing with
// every update.
function dropOtherVersions(cache, url) {
  const u = new URL(url);
  if (!u.searchParams.has('v')) return;
  return cache.keys().then((keys) => Promise.all(keys
    .filter((k) => { const o = new URL(k.url); return o.pathname === u.pathname && o.search !== u.search; })
    .map((k) => cache.delete(k))));
}
