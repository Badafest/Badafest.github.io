const swebCache = "sweb-cache";
const assets = [
  "https://badafest.github.io/Projects/Sweb",
  "https://badafest.github.io/Projects/Sweb/index.html",
  "https://badafest.github.io/Projects/Sweb/style.css",
  "https://badafest.github.io/Projects/Sweb/sweb.svg"
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(swebCache).then((cache) => {
      cache.addAll(assets)
    })
  )
});

self.addEventListener("fetch", (fetchEvent) => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request)
    })
  )
});