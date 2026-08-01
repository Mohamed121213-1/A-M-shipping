import React, { useEffect } from 'react';
import { CourierNotification } from '../types';
import { Bell, Truck, MapPin, DollarSign, X, ExternalLink, ShieldCheck, ArrowLeft } from 'lucide-react';

interface CourierNotificationToastProps {
  notification: CourierNotification | null;
  onClose: () => void;
  onOpenCourierApp: (courierId: string, shipmentId: string) => void;
}

export const CourierNotificationToast: React.FC<CourierNotificationToastProps> = ({
  notification,
  onClose,
  onOpenCourierApp,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto dismiss after 8 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100] max-w-md w-[92vw] sm:w-[420px] bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden animate-in slide-in-from-top-5 duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 px-4 py-2 flex items-center justify-between text-xs font-bold text-white">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <Bell className="w-4 h-4 animate-bounce" />
          <span>إشعار تكليف شحنة جديدة للمندوب</span>
        </div>
        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">{notification.timestamp}</span>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-3">
        {/* Courier Name & AWB */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">المندوب المخصص:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-sm text-white">{notification.courierName}</p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-semibold">رقم الشحنة (AWB):</span>
            <span className="font-mono font-black text-xs text-red-400 bg-red-950/80 px-2 py-1 rounded border border-red-800/80 block mt-0.5">
              {notification.trackingNumber}
            </span>
          </div>
        </div>

        {/* Recipient details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 text-[11px]">العميل المستلم:</span>
            <span className="font-bold text-white">{notification.recipientName}</span>
          </div>

          <div className="flex items-start justify-between text-slate-300">
            <span className="text-slate-400 text-[11px]">العنوان والمركز:</span>
            <span className="font-medium text-slate-200 text-left max-w-[220px] truncate flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              {notification.governorate} - {notification.city}
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-800/90 p-2 rounded-xl border border-slate-700/80 mt-2">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold">المطلوب تحصيله كاش:</span>
            </div>
            <span className="font-black text-sm text-emerald-400">
              {notification.codAmount.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onOpenCourierApp(notification.courierId, notification.shipmentId);
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
          >
            <span>فتح تطبيق المندوب فوراً</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
            title="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Countdown bar */}
      <div className="w-full bg-slate-800 h-1 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full w-full animate-shrink-width" style={{ animationDuration: '8s' }} />
      </div>
    </div>
  );
};
