// Service Worker for Background Device Notifications & PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle notification click on Mobile & Desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const shipmentId = event.notification.data?.shipmentId;
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICKED', shipmentId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Support background push / broadcast messages (works when phone is locked or app is closed)
self.addEventListener('push', (event) => {
  let title = 'إشعار جديد 📦';
  let body = 'تم تحديث حالة شحنة في النظام';
  let tag = `push-${Date.now()}`;
  let data = { url: '/' };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed.title) title = parsed.title;
      if (parsed.body) body = parsed.body;
      if (parsed.tag) tag = parsed.tag;
      if (parsed.data) data = parsed.data;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
    tag,
    data,
    dir: 'rtl',
    lang: 'ar',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    renotify: true,
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle automatic background subscription refresh
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
      })
  );
});
