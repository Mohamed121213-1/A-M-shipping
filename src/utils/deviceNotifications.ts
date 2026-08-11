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

// Send Native Device/Browser System Notification + In-App Mobile Toast for iPhone iOS
export const sendDeviceNotification = (
  title: string,
  options: SendNotificationOptions = {}
) => {
  const { sound = true, onClick, body, icon, tag, data } = options;

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

    // 1. Try Service Worker registration showNotification first (Works best for Mobile / Android / Web PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: notificationIcon,
          badge: notificationIcon,
          tag: tag || `notif-${Date.now()}`,
          data: data || {},
          dir: 'rtl',
          lang: 'ar',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          renotify: true,
        } as any);
      }).catch(() => {
        fallbackNotification(title, { body, icon: notificationIcon, tag, data, onClick });
      });
    }

    // 2. Also trigger standard fallback Notification if available for immediate desktop OS popups
    fallbackNotification(title, { body, icon: notificationIcon, tag, data, onClick });
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
