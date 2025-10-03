const CACHE_NAME = "michi-box-v1";

// Archivos base (HTML, CSS, JS, manifest)
const urlsToCache = [
  "/",
  "/index.html",
  "/galeria.html",
  "/quees.html",
  "/noticias.html",
  "/style/style.css",
  "/style/normalize.css",
  "/sketch/sketch.js",
  "/manifest.json"
];

// ------------------------------------
// Instalación: cacheamos todo
// ------------------------------------
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cacheamos los archivos base
      await cache.addAll(urlsToCache);

      // Cacheamos automáticamente todas las imágenes de /assets/ que estén en el DOM
      // Nota: esto solo funcionará si se ejecuta desde una página que ya las carga
      try {
        const allClients = await self.clients.matchAll({ includeUncontrolled: true });
        for (const client of allClients) {
          const response = await client.postMessage({ action: "GET_ASSETS" });
          // La página responderá con los paths de las imágenes, que luego agregamos al cache
        }
      } catch (e) {
        console.log("No se pudieron obtener imágenes dinámicamente:", e);
      }

      self.skipWaiting();
    })()
  );
});

// ------------------------------------
// Activación: limpiar caches antiguos
// ------------------------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

// ------------------------------------
// Fetch: cache first
// ------------------------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        const requestURL = new URL(event.request.url);

        // Guardamos dinámicamente en cache si es /assets/
        if (requestURL.pathname.startsWith("/assets/")) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
        }

        return networkResponse;
      }).catch(() => new Response("Recurso no disponible offline", { status: 404 }));
    })
  );
});


self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
