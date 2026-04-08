const CACHE_VERSION = 'v4';
const CACHE_NAME = `arbre-bio-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const AGENT_CACHE = `agent-${CACHE_VERSION}`;

const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

// Main site static assets
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://rsms.me/inter/inter.css',
  'https://i.imgur.com/79cS79J.png',
];

// Agent portal shell pages (cached for offline use)
const AGENT_SHELL_ASSETS = [
  '/sales-agent/',
  '/sales-agent/login',
  '/sales-agent/sales/',
  '/sales-agent/inventory/',
  '/sales-agent/customers/',
  '/sales-agent/categories/',
  '/manifest-agent.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
        .catch(() => {}),
      caches.open(AGENT_CACHE)
        .then(cache => cache.addAll(
          AGENT_SHELL_ASSETS.map(url => new Request(url, { cache: 'reload', credentials: 'include' }))
        ))
        .catch(() => {}),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName =>
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== AGENT_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Don't cache API calls, auth endpoints, or Supabase
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis') ||
    url.pathname.includes('token')
  ) {
    return;
  }

  // Agent portal pages — network first, fall back to cache
  if (url.pathname.startsWith('/sales-agent/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(AGENT_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request, { ignoreVary: true })
            .then(cached => {
              if (cached) return cached;
              // Fall back to the login page shell
              return caches.match('/sales-agent/login');
            });
        })
    );
    return;
  }

  // Font Awesome CDN — cache first
  if (url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('rsms.me')) {
    event.respondWith(
      caches.match(request, { ignoreVary: true })
        .then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response && response.status === 200) {
              caches.open(AGENT_CACHE).then(cache => cache.put(request, response.clone()));
            }
            return response;
          });
        })
    );
    return;
  }

  // Skip non-same-origin and non-CDN requests
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes('imgur.com') &&
    !url.hostname.includes('cdnjs.cloudflare.com') &&
    !url.hostname.includes('rsms.me')
  ) {
    return;
  }

  // Stale-while-revalidate for main site
  event.respondWith(
    caches.match(request, { ignoreVary: true })
      .then(cachedResponse => {
        if (cachedResponse) {
          fetch(request).then(response => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              const cacheName = isStaticAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
              caches.open(cacheName).then(cache => cache.put(request, responseToCache));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            const cacheName = isStaticAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
            caches.open(cacheName).then(cache => cache.put(request, responseToCache));
            return response;
          })
          .catch(() => {
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background Sync for offline sale submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-sales') {
    event.waitUntil(syncPendingSales());
  }
});

async function syncPendingSales() {
  // The actual sync logic lives in the page (IndexedDB + fetch).
  // We notify all agent portal clients to run the sync.
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    if (client.url.includes('/sales-agent/')) {
      client.postMessage({ type: 'SYNC_SALES' });
    }
  });
}

function isStaticAsset(url) {
  return url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.webp') ||
         url.includes('inter.css') ||
         url.includes('font-awesome');
}
