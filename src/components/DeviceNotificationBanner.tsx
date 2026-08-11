import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, Sparkles, X, Volume2 } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendDeviceNotification,
  NotificationPermissionState,
} from '../utils/deviceNotifications';

export const DeviceNotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTestToast, setShowTestToast] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const handleSendTestNotification = () => {
    sendDeviceNotification('🔔 إشعار تجريبي ناجح!', {
      body: 'نظام إشعارات الأجهزة مفعّل ويعمل بنجاح على جهازك (A&M Shipping).',
      sound: true,
      tag: 'test-notification',
    });
    setShowTestToast(true);
    setTimeout(() => setShowTestToast(false), 4000);
  };

  if (permission === 'unsupported' || isDismissed) {
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
                <span className="text-rose-400 font-extrabold">⚠️ الإشعارات محظورة في متصفحك:</span>
                <span> يرجى تفعيل إذن الإشعارات من إعدادات الموقع فوق بجانب العنوان لكي تصلك التنبيهات.</span>
              </p>
            ) : (
              <p className="font-extrabold text-slate-100">
                <span className="text-amber-300">🔔 احصل على التنبيهات المباشرة للشحنات:</span>
                <span className="text-slate-300 font-medium mr-1">قم بتفعيل إشعارات الجهاز ليصلك كل جديد فوراً.</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
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

          {permission === 'granted' && (
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-400/50 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-200" />
              تجربة إشعار ع الجهاز 🔔
            </button>
          )}

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

      {showTestToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 border border-emerald-500 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-black">تم إرسال الإشعار التجريبي إلى جهازك بنجاح! 🎉</span>
        </div>
      )}
    </div>
  );
};
