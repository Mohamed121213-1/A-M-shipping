// sw.js — Service Worker for background / closed-app Web Push notifications
// Place this file at the web root (e.g. public/sw.js) so it's served at "/sw.js",
// matching navigator.serviceWorker.register('/sw.js') in deviceNotifications.ts.
//
// This is the piece that makes notifications arrive even when the site/tab is fully
// closed and the phone is locked: when the browser's push service wakes this worker up,
// it runs independently of any open tab and calls showNotification() directly.

self.addEventListener('install', (event) => {
  // Activate the new service worker as soon as it's finished installing,
  // instead of waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fired by the browser when the push service delivers a message sent from your server
// (via web-push / VAPID to the subscription registered in subscribeUserToWebPush()).
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'إشعار جديد', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Bosta';
  const options = {
    body: payload.body || '',
    icon: payload.icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
    badge: payload.badge || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
    tag: payload.tag || `push-${Date.now()}`,
    data: payload.data || {},
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    renotify: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fired when the user taps the system notification (works whether the app was open,
// backgrounded, or fully closed).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // If a tab is already open, focus it and let the app know a notification was tapped.
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-click', data: event.notification.data || {} });
          return client.focus();
        }
      }
      // Otherwise open a new window/tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Fired by the browser if it needs to rotate/refresh the push subscription on its own
// (rare, but happens e.g. after long inactivity). We can't re-POST to the server from here
// without knowing the logged-in user, so we just re-subscribe with the push service and let
// the app's own `pushsubscriptionchange` listener / next foreground check re-register it.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
      .catch(() => {})
  );
});
