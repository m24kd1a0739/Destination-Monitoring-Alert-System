// Automatic Service Worker Cleanup & Cache Eviction
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        console.log('[SW Cleanup] Deleting cache:', key);
        return caches.delete(key);
      }));
    }).then(() => {
      console.log('[SW Cleanup] Unregistering service worker');
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Always pass through directly to network without caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

