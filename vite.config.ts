import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {createHash} from 'crypto';
import {writeFileSync} from 'fs';
import {defineConfig, loadEnv} from 'vite';

function generateSwPlugin() {
  return {
    name: 'generate-sw',
    apply: 'build' as const,
    closeBundle() {
      const hash = createHash('md5').update(Date.now().toString()).digest('hex').slice(0, 8);
      const CACHE_NAME = `commentcraft-${hash}`;
      const swContent = `const CACHE_NAME = '${CACHE_NAME}';
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
`;
      const outDir = path.resolve(__dirname, 'dist');
      writeFileSync(path.join(outDir, 'sw.js'), swContent);
    },
  };
}

export default defineConfig(({mode}) => {
  loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), generateSwPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true' ? { protocol: 'ws' } : false,
    },
  };
});
