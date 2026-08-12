import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, Sparkles, X, Volume2, Info, RefreshCw, Smartphone } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendDeviceNotification,
  playNotificationSound,
  NotificationPermissionState,
} from '../utils/deviceNotifications';

export const DeviceNotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTestToast, setShowTestToast] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeInAppNotification, setActiveInAppNotification] = useState<{
    title: string;
    body?: string;
    timestamp?: string;
    icon?: string;
  } | null>(null);

  const checkAndRefreshPermission = () => {
    setPermission(getNotificationPermission());
  };

  useEffect(() => {
    checkAndRefreshPermission();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom app device notification events
    const handleInAppNotif = (event: any) => {
      const detail = event.detail;
      if (detail) {
        setActiveInAppNotification({
          title: detail.title,
          body: detail.body,
          timestamp: detail.timestamp,
          icon: detail.icon,
        });

        // Auto-hide after 6 seconds
        setTimeout(() => {
          setActiveInAppNotification((prev) => (prev?.title === detail.title ? null : prev));
        }, 6000);
      }
    };

    window.addEventListener('app-device-notification', handleInAppNotif);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('app-device-notification', handleInAppNotif);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowHelpModal(true);
    }
  };

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleSendTestNotification = () => {
    playNotificationSound();
    sendDeviceNotification('🔔 إشعار تجريبي ناجح!', {
      body: 'نظام إشعارات الأجهزة مفعّل ويعمل بنجاح على جهازك (A&M Shipping).',
      sound: true,
      tag: 'test-notification',
    });
    setShowTestToast(true);
    setTimeout(() => setShowTestToast(false), 4000);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-800/60 text-white py-2.5 px-3 sm:px-4 text-xs transition-all animate-in fade-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Status Text */}
        <div className="flex items-center gap-2.5 text-center sm:text-right">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            {permission === 'granted' ? (
              <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : permission === 'denied' ? (
              <BellOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
            )}
          </div>

          <div>
            {permission === 'granted' ? (
              <p className="font-extrabold text-slate-100 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓ إشعارات الجهاز مفعّلة:</span>
                <span>ستصلك جميع التنبيهات المباشرة للشحنات والرسائل على هذا الجهاز تلقائياً.</span>
              </p>
            ) : permission === 'denied' ? (
              <p className="font-bold text-slate-300">
                <span className="text-rose-400 font-extrabold">⚠️ الإشعارات محظورة حالياً:</span>
                <span> يمكنك تفعيلها من إعدادات المتصفح، أو الاعتماد على التنبيهات الصوتية داخل التطبيق.</span>
              </p>
            ) : permission === 'unsupported' ? (
              <p className="font-bold text-slate-300">
                <span className="text-indigo-300 font-extrabold">📱 نظام الإشعارات والصوت مفعّل:</span>
                <span> لتفعيل الإشعارات المنبثقة على أجهزة iPhone، أضف الموقع إلى الشاشة الرئيسية (Add to Home Screen).</span>
              </p>
            ) : (
              <p className="font-extrabold text-slate-100">
                <span className="text-amber-300">🔔 احصل على التنبيهات المباشرة للشحنات:</span>
                <span className="text-slate-300 font-medium mr-1">قم بتفعيل إشعارات الجهاز ليصلك كل جديد فوراً على ماك وآيفون.</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallPWA}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-cyan-500/40 shadow-xs"
            title="تثبيت التطبيق على الشاشة الرئيسية للهاتف"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            تثبيت التطبيق على الهاتف 📲
          </button>

          {permission === 'default' && (
            <button
              type="button"
              onClick={handleEnable}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/40 hover:scale-105"
            >
              <BellRing className="w-3.5 h-3.5" />
              تفعيل إشعارات الجهاز الآن
            </button>
          )}

          {permission === 'denied' && (
            <>
              <button
                type="button"
                onClick={handleEnable}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/50 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
                طلب التفعيل مجدداً 🔔
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-amber-500/40 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                طريقة السماح بالإشعارات
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSendTestNotification}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-400/50 shadow-xs"
            title="اختبار الصوت والتنبيه"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-200" />
            تجربة التنبيه الصوتي 🔊
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="إخفاء الشريط"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Active Floating In-App Notification Card (iOS / Chrome / Universal) */}
      {activeInAppNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-slate-900/95 backdrop-blur-md border border-amber-500/60 text-white p-4 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-300 ring-2 ring-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-extrabold text-xs text-amber-300 truncate">
                  {activeInAppNotification.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono bg-black/40 px-2 py-0.5 rounded-full">
                  {activeInAppNotification.timestamp}
                </span>
              </div>

              {activeInAppNotification.body && (
                <p className="text-xs text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                  {activeInAppNotification.body}
                </p>
              )}
            </div>

            <button
              onClick={() => setActiveInAppNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Help Modal for Mac & iPhone Chrome / Safari Settings */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white p-5 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                طريقة استلام الإشعارات أثناء إغلاق الموقع أو قفل الشاشة
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-800/80 space-y-1.5">
                <p className="font-black text-indigo-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>📲 لضمان وصول الإشعار والشاشة مغلقة (Android & iPhone):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-indigo-100 font-medium leading-relaxed">
                  <li>اضغط زر <strong>"تثبيت التطبيق على الهاتف 📲"</strong> بالشريط العلوي (أو اختار "إضافة إلى الشاشة الرئيسية Add to Home Screen" من قائمة المتصفح ⎋).</li>
                  <li>افتح التطبيق من أيقونة الشاشة الرئيسية كـ <strong>PWA App</strong> مستقل.</li>
                  <li>وافق على إذن الإشعارات عند ظهور النافذة المنبثقة.</li>
                  <li>تأكد من عدم تفعيل وضع "عدم الإزعاج" (Do Not Disturb) في هاتفك لكي يرن الصوت مع الإشعار.</li>
                </ol>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1.5">
                <p className="font-black text-white flex items-center gap-1.5">
                  <span>💻 على الكمبيوتر أو الماك (Chrome / Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 font-medium leading-relaxed">
                  <li>اضغط على أيقونة القفل 🔒 أو الإعدادات بجانب رابط الموقع.</li>
                  <li>اختر السماح بالإشعارات (Allow Notifications).</li>
                  <li>سيعمل ملف الـ Service Worker في خلفية النظام لإرسال الإشعارات.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  handleEnable();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                فهمت، إعادة المحاولة الآن 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 border border-emerald-500 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-black">تم تشغيل الصوت وإرسال الإشعار التجريبي بنجاح! 🎉</span>
        </div>
      )}
    </div>
  );
};

