const CACHE_VERSION = 'v3';
const CACHE_NAME = `arbre-bio-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  'https://rsms.me/inter/inter.css',
  'https://i.imgur.com/79cS79J.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
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

  if (url.origin !== self.location.origin &&
      !url.hostname.includes('imgur.com') &&
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('rsms.me')) {
    return;
  }

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

            caches.open(cacheName)
              .then(cache => cache.put(request, responseToCache));

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
