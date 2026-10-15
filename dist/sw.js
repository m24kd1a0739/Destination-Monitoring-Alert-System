const CACHE_NAME = 'dest-monitor-v2';
const ASSETS_TO_CACHE = [
  '/manifest.webmanifest',
  '/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through for external APIs (OSRM, Nominatim, Overpass, Tile layers)
  if (
    event.request.url.includes('nominatim.openstreetmap.org') ||
    event.request.url.includes('router.project-osrm.org') ||
    event.request.url.includes('tile.openstreetmap.org') ||
    event.request.url.includes('basemaps.cartocdn.com') ||
    event.request.url.includes('overpass-api.de') ||
    event.request.url.includes('/api/')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for navigation (HTML documents) to avoid stale JS chunk hashes
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // Cache-first, fall back to network for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.url.includes('/assets/') || event.request.url.endsWith('.svg') || event.request.url.endsWith('.png'))
          ) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
      );
    })
  );
});
