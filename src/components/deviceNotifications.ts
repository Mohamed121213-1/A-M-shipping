import { CourierNotification, UserSession, AppUserRole } from '../types';

// Device Notification Utility using Browser Notification API & Web Audio Synthesizer

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

const NOTIFIED_IDS_KEY = 'bosta_notified_notification_ids';

export const getNotifiedNotificationIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(NOTIFIED_IDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

export const markNotificationAsNotified = (id: string) => {
  if (!id) return;
  try {
    const set = getNotifiedNotificationIds();
    set.add(id);
    const arr = Array.from(set).slice(-1000);
    localStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(arr));
  } catch (e) {}
};

export const hasNotificationBeenNotified = (id: string): boolean => {
  if (!id) return false;
  const set = getNotifiedNotificationIds();
  return set.has(id);
};

export const isNotificationFresh = (createdAt?: string, maxAgeSeconds = 180): boolean => {
  if (!createdAt) return true;
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return true;
  const ageSeconds = (Date.now() - date.getTime()) / 1000;
  return ageSeconds <= maxAgeSeconds;
};

// Helper to determine if a notification is relevant for the currently logged-in user & active role
export const isNotificationRelevantForUser = (
  notif: CourierNotification,
  user: UserSession | null,
  activeCourierId?: string,
  currentRole?: AppUserRole
): boolean => {
  const effectiveRole = currentRole || user?.role;
  if (!effectiveRole || effectiveRole === 'public_tracker') {
    return false;
  }

  // 1. Admin NEVER receives routine courier/merchant operational popup notifications or sound chimes
  if (effectiveRole === 'admin') {
    return false;
  }

  // 2. Courier receives notifications targeted specifically to them or 'all'
  if (effectiveRole === 'courier') {
    // Never show courier merchant-targeted warning alerts
    if (
      notif.type === 'status_failed_attempt' ||
      notif.type === 'no_response' ||
      notif.statusTitle?.includes('تنبيه للتاجر') ||
      notif.statusTitle?.includes('تنبيه عاجل للتاجر')
    ) {
      return false;
    }

    const courierIdToMatch = activeCourierId || (user?.role === 'courier' ? user.id : undefined);
    if (!courierIdToMatch) {
      return false;
    }

    if (notif.courierId && (notif.courierId === courierIdToMatch || notif.courierId === 'all')) {
      return true;
    }
    return false;
  }

  // 3. Merchant receives notifications for their store/shipments
  if (effectiveRole === 'merchant') {
    // Merchant should NOT receive "new shipment assigned to courier" alerts
    if (
      notif.statusTitle?.includes('مسندة إليك') ||
      notif.type === 'status_assigned' ||
      notif.statusTitle?.includes('الكابتن')
    ) {
      return false;
    }

    // "No Response" alert or failed delivery attempt for merchant's customer
    if (
      notif.type === 'status_failed_attempt' ||
      notif.type === 'no_response' ||
      notif.statusTitle?.includes('تنبيه للتاجر')
    ) {
      if (user && notif.merchantId && notif.merchantId !== user.id) {
        return false;
      }
      return true;
    }

    if (user && notif.merchantId && notif.merchantId === user.id) return true;
    if (user?.storeName && notif.merchantName && notif.merchantName === user.storeName) return true;

    return false;
  }

  return false;
};

// Smart Relative Time Formatter in Arabic (Facebook style: "الآن", "منذ 3 دقائق", "منذ ساعة")
export const formatRelativeTimeAr = (timestampStr?: string): string => {
  if (!timestampStr) return 'الآن';
  const date = new Date(timestampStr);
  if (isNaN(date.getTime())) {
    return timestampStr; // Return plain formatted time string if not ISO
  }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return 'الآن';
  if (diffInSeconds < 60) return `منذ ${diffInSeconds} ثانية`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
  return date.toLocaleDateString('ar-EG');
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
};

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Small localStorage flag so we don't hammer the server with the same subscription every load
const WEB_PUSH_SUBSCRIBED_KEY = 'bosta_web_push_subscribed_endpoint';

// Subscribe user device to server-side remote Web Push (works when app/browser/site is completely
// closed and the phone is locked — this is the mechanism that actually delivers notifications in
// that case, since sendDeviceNotification() below only fires while the JS/tab is alive).
//
// `force` re-validates the subscription against the server even if we already have a cached
// endpoint, and re-subscribes if the VAPID key changed or the old subscription is invalid.
export const subscribeUserToWebPush = async (
  user?: UserSession | null,
  activeCourierId?: string,
  force = false
): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    // Fetch VAPID public key from Express server
    const res = await fetch('/api/push/vapid-public-key');
    if (!res.ok) return false;
    const { publicKey } = await res.json();
    if (!publicKey) return false;

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    let subscription = await reg.pushManager.getSubscription();

    // If the subscription exists but was created with a different (old) VAPID key,
    // it's dead weight — the server can no longer send to it. Drop it and re-subscribe.
    if (subscription) {
      const existingKey = subscription.options?.applicationServerKey
        ? new Uint8Array(subscription.options.applicationServerKey as ArrayBuffer)
        : null;
      const keysMatch =
        existingKey &&
        existingKey.length === applicationServerKey.length &&
        existingKey.every((b, i) => b === applicationServerKey[i]);

      if (!keysMatch) {
        try {
          await subscription.unsubscribe();
        } catch (e) {}
        subscription = null;
      }
    }

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const cachedEndpoint = localStorage.getItem(WEB_PUSH_SUBSCRIBED_KEY);
    if (!force && cachedEndpoint === subscription.endpoint) {
      // Already registered this exact subscription with the server, nothing to do.
      return true;
    }

    // Register Push Subscription on Express server so it can push to this device
    // even while the app/tab/site is fully closed and the phone screen is locked.
    const subscribeRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        userId: user?.id,
        role: user?.role,
        courierId: activeCourierId || (user?.role === 'courier' ? user.id : undefined),
      }),
    });

    if (subscribeRes.ok) {
      localStorage.setItem(WEB_PUSH_SUBSCRIBED_KEY, subscription.endpoint);
      console.log('✅ Registered device for remote Web Push notifications (works even when closed)');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Web Push subscription skipped or failed:', err);
    return false;
  }
};

// Call this once when the app boots (after registerServiceWorker) to make sure an already-granted
// user still has a live subscription on the server. Push subscriptions can silently expire/rotate
// (browser updates, storage clears, etc.) — without this, notifications quietly stop arriving
// while permission still shows "granted".
export const ensureWebPushSubscriptionIsFresh = async (
  user?: UserSession | null,
  activeCourierId?: string
) => {
  if (typeof window === 'undefined') return;
  if (getNotificationPermission() !== 'granted') return;
  await subscribeUserToWebPush(user, activeCourierId, true);
};

export const isSubscribedToWebPush = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
};

// Request Notification Permission from Browser/Device
export const requestNotificationPermission = async (
  user?: UserSession | null,
  activeCourierId?: string
): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendDeviceNotification('تم تفعيل الإشعارات بنجاح! 🔔', {
        body: 'ستصلك التنبيهات المباشرة للشحنات والردود على هذا الجهاز حتى أثناء إغلاق الموقع.',
        tag: 'welcome-notification',
      });
      // Register device for Web Push automatically
      subscribeUserToWebPush(user, activeCourierId);
    }
    return permission as NotificationPermissionState;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

// Web Audio API Synthesizer generating a loud, clear, signature iPhone Tri-Tone alert chime
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Trigger vibration on mobile devices if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([150, 100, 200]);
    }

    // Classic Apple Tri-Tone Chime frequencies (C6, G6, E6)
    const tones = [
      { freq: 1046.5, start: 0, duration: 0.12 },    // C6
      { freq: 1567.98, start: 0.1, duration: 0.12 }, // G6
      { freq: 1318.51, start: 0.22, duration: 0.25 } // E6
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Fast attack, smooth exponential decay for a crisp bell chime
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (e) {
    console.warn('Audio play restricted or unsupported context:', e);
  }
};

interface SendNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  data?: any;
  sound?: boolean;
  onClick?: () => void;
}

// Set to keep track of recently triggered notification tags/hashes (deduplication window: 10 seconds)
const recentNotificationCache = new Map<string, number>();

// Send Native Device/Browser System Notification + In-App Mobile Toast for iPhone iOS & Background PWA
export const sendDeviceNotification = (
  title: string,
  options: SendNotificationOptions = {}
) => {
  const { sound = true, onClick, body, icon, tag, data } = options;

  // Deduplication check: key by tag or title+body to prevent duplicate alerts
  const dedupeKey = tag || `${title}::${body || ''}`;
  const now = Date.now();
  const lastSent = recentNotificationCache.get(dedupeKey);

  if (lastSent && now - lastSent < 10000) {
    console.log('Skipping duplicate notification trigger within 10s window:', dedupeKey);
    return;
  }
  recentNotificationCache.set(dedupeKey, now);

  // Clean up old cache entries
  for (const [key, timestamp] of recentNotificationCache.entries()) {
    if (now - timestamp > 30000) {
      recentNotificationCache.delete(key);
    }
  }

  if (sound) {
    playNotificationSound();
  }

  // Always dispatch custom window event so in-app alert banner pops up on iOS/iPhone & Desktop
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent('app-device-notification', {
      detail: {
        title,
        body,
        icon: icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        onClick,
      },
    });
    window.dispatchEvent(customEvent);
  }

  if (!isNotificationSupported()) {
    console.log('Browser notification API unsupported natively on this device/iOS view:', title, body);
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const notificationIcon = icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png';
    const notifTag = tag || `notif-${Date.now()}`;

    // Prefer Service Worker registration showNotification for background/mobile/desktop support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, {
            body,
            icon: notificationIcon,
            badge: notificationIcon,
            tag: notifTag,
            data: data || {},
            dir: 'rtl',
            lang: 'ar',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            renotify: false,
          } as any);
        })
        .catch(() => {
          fallbackNotification(title, { body, icon: notificationIcon, tag: notifTag, data, onClick });
        });
    } else {
      fallbackNotification(title, { body, icon: notificationIcon, tag: notifTag, data, onClick });
    }
  } catch (err) {
    console.error('Failed to trigger native device notification:', err);
  }
};

function fallbackNotification(
  title: string,
  options: { body?: string; icon?: string; tag?: string; data?: any; onClick?: () => void }
) {
  try {
    const notif = new Notification(title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      data: options.data,
      dir: 'rtl',
      lang: 'ar',
    });

    notif.onclick = function (event) {
      event.preventDefault();
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notif.close();
    };
  } catch (err) {
    console.warn('Standard Notification fallback failed:', err);
  }
}

// Register Service Worker for PWA / Mobile Web Push support
export const registerServiceWorker = (user?: UserSession | null, activeCourierId?: string) => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          console.log('ServiceWorker registered with scope:', reg.scope);
          if (Notification.permission === 'granted') {
            await subscribeUserToWebPush(user, activeCourierId);
          }
        })
        .catch((err) => {
          console.log('ServiceWorker registration skipped or failed:', err);
        });

      // Keep the subscription alive across sessions: browsers can silently invalidate
      // a push subscription (e.g. `pushsubscriptionchange`, key rotation on the server, etc.).
      // Re-verify and re-subscribe automatically instead of requiring the user to toggle
      // notifications off/on again.
      navigator.serviceWorker.ready.then((reg) => {
        (reg as any).addEventListener?.('pushsubscriptionchange', () => {
          subscribeUserToWebPush(user, activeCourierId, true);
        });
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }

    // Also re-check whenever the app is brought back to the foreground / tab becomes visible,
    // and once on initial load — this is what catches the "permission granted but subscription
    // silently died" case so notifications keep arriving reliably, WhatsApp-style.
    const revalidate = () => {
      if (document.visibilityState === 'visible') {
        ensureWebPushSubscriptionIsFresh(user, activeCourierId);
      }
    };
    document.addEventListener('visibilitychange', revalidate);
    window.addEventListener('focus', revalidate);
    ensureWebPushSubscriptionIsFresh(user, activeCourierId);
  }
};

// Full setup helper: registers the service worker, and if permission is already granted,
// makes sure the push subscription is registered/fresh. If permission hasn't been asked yet,
// this does NOT prompt automatically (that must stay behind a user gesture per browser policy) —
// call `requestNotificationPermission()` from a button/click handler for that.
export const initializeDeviceNotifications = (user?: UserSession | null, activeCourierId?: string) => {
  registerServiceWorker(user, activeCourierId);
};

