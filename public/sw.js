const CACHE_VERSION = "forge-shell-v1";
const SHELL = ["/", "/manifest.webmanifest", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("forge-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put("/", response.clone());
    }
    return response;
  } catch {
    return (await caches.match("/")) ?? Response.error();
  }
}

async function assetResponse(request) {
  const cached = await caches.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await refresh) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }
  event.respondWith(assetResponse(request));
});
