(() => {
  // src/service-worker/sw.ts
  var serviceWorker = globalThis;
  serviceWorker.addEventListener("push", (event) => {
    if (event.data) {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "2"
        }
      };
      event.waitUntil(serviceWorker.registration.showNotification(data.title, options));
    }
  });
  serviceWorker.addEventListener("notificationclick", (event) => {
    console.log("Notification click received.");
    event.notification.close();
    event.waitUntil(serviceWorker.clients.openWindow("/"));
  });
})();
