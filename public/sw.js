// Service Worker para cache offline (Workbox não necessário - implementação nativa)
const CACHE_NAME = "nexis-digital-v1";
const STATIC_ASSETS = [
  "/",
  "/solucoes",
  "/solucoes/pousadas",
  "/solucoes/livrarias",
  "/solucoes/catalogo-digital",
  "/solucoes/site-institucional",
  "/solucoes/gestao-empresarial",
  "/solucoes/gestao-rh",
  "/solucoes/cardapio-digital",
  "/contato",
  "/logo-white.png",
  "/icon.svg",
  "/apple-icon.png",
];

// Instalação - cache assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { credentials: "same-origin" })));
    })
  );
  self.skipWaiting();
});

// Ativação - limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - strategy: stale-while-revalidate para HTML, cache-first para assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests não-GET
  if (request.method !== "GET") return;

  // Ignora requests cross-origin (ex: fonts.googleapis.com)
  if (url.origin !== location.origin) return;

  // HTML pages - network first, fallback to cache
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets estáticos - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Message handler para skipWaiting
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});