const CACHE_VERSION = "v2";
const CACHE_PREFIX = "fertilizer-";
const STATIC_CACHE = `${CACHE_PREFIX}static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";
const CORE_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.webmanifest" ||
  url.pathname.endsWith(".css") ||
  url.pathname.endsWith(".js") ||
  url.pathname.endsWith(".woff2");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) =>
            key.startsWith(CACHE_PREFIX) &&
            key !== STATIC_CACHE &&
            key !== RUNTIME_CACHE
              ? caches.delete(key)
              : null
          )
        )
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (
      cached ||
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const fresh = await fetchPromise;
  return (
    fresh ||
    new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    })
  );
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return (
      cached ||
      caches.match(OFFLINE_URL) ||
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      networkFirst(request).then(
        (response) => response || caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  if (isStaticAsset(url)) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".woff2")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request));
});
