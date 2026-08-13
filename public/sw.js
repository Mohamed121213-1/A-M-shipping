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

// Support background push / broadcast messages
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'إشعار شحنة جديد 📦';
      const options = {
        body: data.body || '',
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
        badge: data.icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
        tag: data.tag || `notif-${Date.now()}`,
        data: data.data || {},
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        renotify: true,
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.error('Error handling background push event:', e);
    }
  }
});
