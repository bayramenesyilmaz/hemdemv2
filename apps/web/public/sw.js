/**
 * Hemdem service worker.
 *
 * Bu uygulamanın sayfaları kullanıcıya özeldir (oturum cookie'sine göre
 * sunucuda render edilir), bu yüzden HTML yanıtları **hiçbir zaman**
 * önbelleğe alınmaz — aksi halde bir kullanıcının sayfası başka bir
 * kullanıcıya servis edilebilirdi. Önbellek yalnızca içerik hash'i
 * taşıyan (dolayısıyla değişmez olan) `/_next/static/*` varlıkları ve
 * çevrimdışı yedek sayfası için kullanılır.
 */

const VERSION = "v1";
const STATIC_CACHE = `hemdem-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Server Action'lar ve diğer yazma istekleri asla araya girilmemeli.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Değişmez build varlıkları: önce önbellek, yoksa ağdan alıp sakla.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Sayfa gezinmeleri: her zaman ağ; ağ yoksa çevrimdışı yedek sayfa.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
