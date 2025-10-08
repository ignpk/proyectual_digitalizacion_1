// ...existing code...
const CACHE_NAME = 'michi-box-v1';
const PRECACHE_URLS = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/style/normalize.css',
  '/style/style.css',
  '/sketch/sketch.js',
  '/galeria.html',
  '/quees.html',
  '/noticias.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
  
];

// Install: precache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch: navigation -> network-first, assets -> cache-first + runtime update
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Navigation: network-first fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        // Update cache with latest index
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For same-origin static assets: cache-first, then update cache in background
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Fetch in background to update cache
        fetch(req).then(resp => {
          if (resp && resp.ok) {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, respClone));
          }
        }).catch(()=>{});
        return cached;
      }
      return fetch(req).then(resp => {
        if (!resp || !resp.ok) return resp;
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, respClone));
        return resp;
      }).catch(() => {
        // optional fallback for images or fonts
        if (req.destination === 'image') return caches.match('/assets/icon-192.png');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});