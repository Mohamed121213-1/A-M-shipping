import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, RefreshCw, Send, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';

interface EnableNotificationsProps {
  userId?: string;
  role?: string;
  courierId?: string;
  className?: string;
  variant?: 'card' | 'compact' | 'banner';
}

// Utility to convert VAPID public key from base64 string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const EnableNotifications: React.FC<EnableNotificationsProps> = ({
  userId,
  role,
  courierId,
  className = '',
  variant = 'card',
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check iOS environment
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if running as Installed PWA Standalone app
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPwa);

    // Check notification support & permission state
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    // Check if device is already registered for Push
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    setMessage(null);
    setIsLoading(true);

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        throw new Error('متصفحك لا يدعم الإشعارات الفورية (Web Push). يرجى التحديث أو استخدام متصفح حديث.');
      }

      // 1. Request user permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        throw new Error('تم رفض إذن الإشعارات. يرجى تفعيل الإذن من إعدادات المتصفح أو الموقع.');
      }

      // 2. Wait for Service Worker registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Fetch VAPID Public Key from server
      const keyRes = await fetch('/api/push/vapid-public-key');
      if (!keyRes.ok) {
        throw new Error('فشل جلب مفتاح VAPID من الخادم.');
      }
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        throw new Error('مفتاح VAPID العام غير متوفر.');
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // 4. Subscribe to PushManager
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 5. Send subscription payload to Backend
      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON ? subscription.toJSON() : subscription,
          userId,
          role,
          courierId,
        }),
      });

      if (!subRes.ok) {
        throw new Error('فشل تسجيل الاشتراك في خادم الإشعارات.');
      }

      setIsSubscribed(true);
      setMessage({
        text: 'تم تفعيل واشتراك الإشعارات بنجاح! ستصلك التنبيهات حتى والتطبيق مقفول.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Subscription error:', err);
      setMessage({
        text: err.message || 'حدث خطأ أثناء تفعيل الإشعارات.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setMessage(null);
    setIsSendingTest(true);

    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال الإشعار التجريبي.');
      }

      setMessage({
        text: 'تم إرسال الإشعار التجريبي! يمكنك قفل شاشة الهاتف أو إغلاق المتصفح لمشاهدته.',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || 'حدث خطأ أثناء إرسال الإشعار التجريبي.',
        type: 'error',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {permission === 'granted' && isSubscribed ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              الإشعارات مفعّلة
            </span>
            <button
              onClick={handleSendTestPush}
              disabled={isSendingTest}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="تجربة إرسال إشعار"
            >
              <Send className="w-3 h-3 text-slate-500" />
              {isSendingTest ? 'جار الإرسال...' : 'اختبار'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
            تفعيل الإشعارات
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-right ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            permission === 'granted' && isSubscribed
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : permission === 'denied'
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {permission === 'granted' && isSubscribed ? (
              <BellRing className="w-6 h-6 animate-pulse" />
            ) : permission === 'denied' ? (
              <BellOff className="w-6 h-6" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>إشعارات الهاتف الفورية (Web Push)</span>
              {permission === 'granted' && isSubscribed && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  متصل ومفعّل ✅
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              استقبل تنبيهات الشحنات والمهام والتحصيل فوراً حتى والتطبيق مغلق وشاشة الهاتف مقفلة.
            </p>
          </div>
        </div>
      </div>

      {/* iOS Safari Notice if not added to Home Screen */}
      {isIOS && !isStandalone && (
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-black">
            <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ملاحظة هامة لمستخدمي أجهزة iPhone (iOS 16.4+):</span>
          </div>
          <p className="text-amber-800 leading-relaxed font-medium">
            لتشغيل الإشعارات على الآيفون أثناء قفل الشاشة، يجب أولاً إضافة الموقع إلى الشاشة الرئيسية:
            اضغط زر <strong>المشاركة (Share ⎋)</strong> في متصفح Safari ثم اختر <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>، ثم افتح التطبيق من الأيقونة واضغط تفعيل الإشعارات.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {permission !== 'granted' || !isSubscribed ? (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
            <span>تفعيل الإشعارات الآن 🔔</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendTestPush}
            disabled={isSendingTest}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
            <span>إرسال إشعار تجريبي (للهاتف المقفول) 📲</span>
          </button>
        )}

        {permission === 'granted' && !isSubscribed && (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة ربط الجهاز
          </button>
        )}
      </div>

      {/* Feedback Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : message.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};
