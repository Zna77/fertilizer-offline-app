const CACHE_VERSION = "v5";
const ASSET_CACHE = `fertilizer-assets-${CACHE_VERSION}`;
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./src/app.js",
  "./src/db.js",
  "./src/state.js",
  "./src/models.js",
  "./src/ui.js",
  "./src/calc.js",
  "./src/i18n.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
];

const CORE_ASSET_URLS = new Set(
  CORE_ASSETS.map((path) => new URL(path, self.location).pathname)
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(ASSET_CACHE)
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
          keys.map((key) => (key === ASSET_CACHE ? null : caches.delete(key)))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
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
  const cache = await caches.open(ASSET_CACHE);
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
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request).then((response) => response || caches.match("./index.html"))
    );
    return;
  }

  if (CORE_ASSET_URLS.has(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
