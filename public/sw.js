const CACHE_NAME = 'commentcraft-v1';
const MAX_CACHE_ENTRIES = 50;

const ASSET_CACHE = ['image', 'font', 'icon'];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

async function trimCache(cache) {
  const entries = await cache.keys();
  if (entries.length > MAX_CACHE_ENTRIES) {
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
    await Promise.all(toDelete.map(req => cache.delete(req)));
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const dest = event.request.destination;

  if (ASSET_CACHE.includes(dest)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
              trimCache(cache);
            });
          }
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
            trimCache(cache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || fetch('/')))
  );
});
