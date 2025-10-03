const CACHE_NAME = "michi-box-cache-v1";
const urlsToCache = [
  "/",                // tu index principal
  "/index.html",
  "/galeria.html",
  "/quees.html",
  "/noticias.html",
  "/styles.css",      // tu CSS principal
  "/sketch.js",          // tu JS principal
  "/assets/icon-192.png",
  "/assets/icon-512.png"
  // 👉 acá podés agregar más archivos que quieras que funcionen offline (imágenes, otros html, sonidos, etc.)
];

// Instalar SW y cachear archivos
self.addEventListener("install", event => {
  console.log("✅ Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar SW y limpiar caches viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Cache viejo eliminado:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Interceptar peticiones y responder con cache si está offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el archivo está en cache, se devuelve
      if (response) {
        return response;
      }
      // Si no, lo pide a la red
      return fetch(event.request);
    })
  );
});
