// Service Worker for Background Device Notifications, Background Sync & PWA
const CACHE_NAME = 'bosta_background_cache_v2';
const STATE_CACHE_KEY = '/api/sync/state';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

// Helper to fetch latest app state in background and update cache + notify active clients
async function syncLatestStateInBackground() {
  try {
    const response = await fetch('/api/sync/state', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (response.ok) {
      const cloned = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(STATE_CACHE_KEY, cloned);

      const data = await response.json();
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        client.postMessage({
          type: 'BACKGROUND_STATE_SYNC_COMPLETED',
          timestamp: data?.timestamp || Date.now(),
          state: data?.state,
        });
      }
      return data;
    }
  } catch (err) {
    // Network unavailable in background, will retry next cycle
  }
  return null;
}

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

  // Perform background state sync AND show notification concurrently
  event.waitUntil(
    Promise.allSettled([
      self.registration.showNotification(title, options),
      syncLatestStateInBackground(),
    ])
  );
});

// Periodic Background Sync Handler (Android / Chrome PWA periodic wake up)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-app-update' || event.tag === 'sync-shipments') {
    event.waitUntil(syncLatestStateInBackground());
  }
});

// Background Sync Handler (Triggered when phone re-establishes connectivity)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-state' || event.tag === 'sync-app-state') {
    event.waitUntil(syncLatestStateInBackground());
  }
});

// Listen to messages from frontend
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_BACKGROUND_SYNC') {
    event.waitUntil(syncLatestStateInBackground());
  }
});

// Handle automatic background subscription refresh
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription?.options || { userVisibleOnly: true })
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        });
      })
  );
});

