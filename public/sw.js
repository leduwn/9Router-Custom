// Retire the legacy PWA worker. Older releases cached the dashboard shell and
// could keep serving it after a deployment, mixing old pages with new chunks.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    await self.clients.claim();
    await self.registration.unregister();

    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    await Promise.all(windows.map((client) => client.navigate(client.url)));
  })());
});
