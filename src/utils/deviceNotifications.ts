// Device Notification Utility using Browser Notification API & Web Audio Synthesizer

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
};

// Request Notification Permission from Browser/Device
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendDeviceNotification('تم تفعيل الإشعارات بنجاح! 🔔', {
        body: 'ستصلك التنبيهات المباشرة للشحنات والردود على هذا الجهاز.',
        tag: 'welcome-notification',
      });
    }
    return permission as NotificationPermissionState;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
};

// Web Audio API Beep Generator for Instant Notification Sound
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.15);
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio context autoplay restriction if unhandled
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

// Send Native Device/Browser System Notification
export const sendDeviceNotification = (
  title: string,
  options: SendNotificationOptions = {}
) => {
  const { sound = true, onClick, body, icon, tag, data } = options;

  if (sound) {
    playNotificationSound();
  }

  if (!isNotificationSupported()) {
    console.log('Browser does not support notifications:', title, body);
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const notificationIcon = icon || 'https://cdn-icons-png.flaticon.com/512/2822/2822408.png'; // Truck icon

    // If Service Worker ready, use SW showNotification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: notificationIcon,
          badge: notificationIcon,
          tag: tag || `notif-${Date.now()}`,
          data,
          dir: 'rtl',
          lang: 'ar',
          vibrate: [200, 100, 200],
        } as any);
      }).catch(() => {
        // Fallback to standard Notification API
        fallbackNotification(title, { body, icon: notificationIcon, tag, data, onClick });
      });
    } else {
      fallbackNotification(title, { body, icon: notificationIcon, tag, data, onClick });
    }
  } catch (err) {
    console.error('Failed to trigger device notification:', err);
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
export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.log('ServiceWorker registration skipped or failed:', err);
        });
    });
  }
};
