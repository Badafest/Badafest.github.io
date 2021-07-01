const swebCache = "sweb-cache";
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/sweb.svg"
]

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(swebCache).then((cache) => {
      cache.addAll(assets);
    });
  );
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    });
  );
});