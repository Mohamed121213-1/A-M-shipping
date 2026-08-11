import React, { useEffect } from 'react';
import { CourierNotification } from '../types';
import { Bell, Truck, MapPin, DollarSign, X, ArrowLeft, Phone, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { formatRelativeTimeAr } from '../utils/deviceNotifications';

interface CourierNotificationToastProps {
  notification: CourierNotification | null;
  onClose: () => void;
  onOpenCourierApp: (courierId: string, shipmentId: string) => void;
  onOpenShipmentDetail?: (shipmentId: string) => void;
}

export const CourierNotificationToast: React.FC<CourierNotificationToastProps> = ({
  notification,
  onClose,
  onOpenCourierApp,
  onOpenShipmentDetail,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto dismiss after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const headerTitle = notification.statusTitle || 'إشعار جديد وتكليف شحنة';
  const isDelivered = notification.type === 'status_delivered';
  const isRefused = notification.type === 'status_refused' || notification.type === 'status_returned';
  const isFailed = notification.type === 'status_failed_attempt' || notification.type === 'no_response';
  const relativeTime = formatRelativeTimeAr(notification.createdAt) || notification.timestamp || 'الآن';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100] max-w-md w-[92vw] sm:w-[430px] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border-2 border-amber-500/80 overflow-hidden animate-in slide-in-from-top-5 duration-300">
      {/* Top Banner */}
      <div className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold text-white ${
        isDelivered
          ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
          : isRefused || isFailed
          ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-700'
          : 'bg-gradient-to-r from-red-600 via-amber-600 to-indigo-700'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          {isDelivered ? (
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
          ) : isFailed ? (
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce shrink-0" />
          ) : (
            <Bell className="w-4 h-4 animate-bounce shrink-0" />
          )}
          <span className="truncate">{headerTitle}</span>
        </div>
        <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-bold shrink-0 ml-1 border border-white/10">
          {relativeTime}
        </span>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-3">
        {/* Courier & AWB header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">المندوب المخصص:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-extrabold text-sm text-white">{notification.courierName}</p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-semibold">رقم الشحنة (AWB):</span>
            <span className="font-mono font-black text-xs text-amber-400 bg-amber-950/80 px-2 py-1 rounded-md border border-amber-800/80 block mt-0.5 shadow-inner">
              #{notification.trackingNumber}
            </span>
          </div>
        </div>

        {/* Status Note if present */}
        {notification.statusNote && (
          <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700 text-xs text-amber-200 font-medium leading-relaxed">
            <span className="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
              <MessageSquare className="w-3.5 h-3.5" />
              تفاصيل التنبيه:
            </span>
            {notification.statusNote}
          </div>
        )}

        {/* Recipient details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 text-[11px]">العميل المستلم:</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              {notification.recipientName}
              {notification.recipientPhone && (
                <a
                  href={`tel:${notification.recipientPhone}`}
                  className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all flex items-center gap-1 border border-emerald-500/40"
                  title="اتصل بالعميل"
                >
                  <Phone className="w-3 h-3" />
                  اتصال
                </a>
              )}
            </span>
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
              <span className="text-[11px] font-bold">مبلغ الشحنة (COD):</span>
            </div>
            <span className="font-black text-sm text-emerald-400">
              {notification.codAmount.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onOpenShipmentDetail ? (
            <button
              onClick={() => {
                onOpenShipmentDetail(notification.shipmentId);
                onClose();
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>عرض تفاصيل الشحنة والتظليل 👁️</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenCourierApp(notification.courierId, notification.shipmentId);
                onClose();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <span>فتح تطبيق المندوب فوراً</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0 cursor-pointer"
            title="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Countdown bar */}
      <div className="w-full bg-slate-800 h-1 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 h-full w-full animate-shrink-width" style={{ animationDuration: '10s' }} />
      </div>
    </div>
  );
};
