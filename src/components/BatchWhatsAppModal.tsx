import React, { useState } from 'react';
import { MessageSquare, Send, X, ExternalLink, Phone, AlertTriangle, CheckCircle2, RefreshCw, MapPin, Sparkles, UserX, PhoneCall } from 'lucide-react';
import { Shipment, CourierInfo } from '../types';
import { generateWhatsAppLink, formatPhoneNumberForWhatsApp } from '../utils/whatsapp';

interface BatchWhatsAppModalProps {
  shipments: Shipment[];
  activeCourier: CourierInfo;
  onClose: () => void;
}

export const BatchWhatsAppModal: React.FC<BatchWhatsAppModalProps> = ({
  shipments,
  activeCourier,
  onClose,
}) => {
  // Filter active/relevant shipments assigned to courier for tomorrow's delivery
  const activeShipments = shipments.filter(
    (s) => s.status !== 'delivered' && s.status !== 'returned' && s.status !== 'cancelled'
  );

  // Track status for each shipment: 'pending' | 'sent' | 'no_whatsapp'
  const [statusMap, setStatusMap] = useState<Record<string, 'pending' | 'sent' | 'no_whatsapp'>>(() => {
    const initial: Record<string, 'pending' | 'sent' | 'no_whatsapp'> = {};
    activeShipments.forEach((s) => {
      const cleanPhone = s.recipient.phone ? s.recipient.phone.replace(/\D/g, '') : '';
      if (!cleanPhone || cleanPhone.length < 10) {
        initial[s.id] = 'no_whatsapp';
      } else {
        initial[s.id] = 'pending';
      }
    });
    return initial;
  });

  // Custom base message template text
  const [templateMessage, setTemplateMessage] = useState<string>(
    `أهلاً بك أ/ {اسم_العميل} 👋\nمعاك كابتن {اسم_المندوب} من شركة الشحن 🚚\nنود إفادتك بأن شحنتك رقم #{رقم_البوليصة} {اسم_المتجر} ستكون معك للتسليم غداً بإذن الله 📦.\n💵 المطلوب عند الاستلام: {المبلغ} ج.م.\n📍 يرجى إرسال موقعك (اللوكيشن) هنا عبر الواتساب لتأكيد العنوان وسرعة الوصول إليك.\nشكراً لك!`
  );

  // Build individualized message for a shipment
  const buildIndividualMessage = (shipment: Shipment): string => {
    return templateMessage
      .replace(/{اسم_العميل}/g, shipment.recipient.name)
      .replace(/{اسم_المندوب}/g, activeCourier.name || 'التوصيل')
      .replace(/{رقم_البوليصة}/g, shipment.trackingNumber)
      .replace(/{اسم_المتجر}/g, shipment.sender.storeName ? `من (${shipment.sender.storeName})` : '')
      .replace(/{المبلغ}/g, (shipment.financials.codAmount || 0).toString());
  };

  const totalCount = activeShipments.length;
  const sentCount = Object.values(statusMap).filter((v) => v === 'sent').length;
  const noWhatsappCount = Object.values(statusMap).filter((v) => v === 'no_whatsapp').length;
  const pendingCount = totalCount - sentCount - noWhatsappCount;

  // Open WhatsApp for a single shipment
  const handleSendSingleWhatsApp = (shipment: Shipment) => {
    const msg = buildIndividualMessage(shipment);
    const link = generateWhatsAppLink(shipment.recipient.phone, msg);
    window.open(link, '_blank', 'noopener,noreferrer');
    setStatusMap((prev) => ({ ...prev, [shipment.id]: 'sent' }));
  };

  // Toggle "No WhatsApp" state
  const handleToggleNoWhatsApp = (shipmentId: string) => {
    setStatusMap((prev) => {
      const current = prev[shipmentId];
      const next = current === 'no_whatsapp' ? 'pending' : 'no_whatsapp';
      return { ...prev, [shipmentId]: next };
    });
  };

  // Find first pending shipment and send
  const handleSendNextPending = () => {
    const nextShipment = activeShipments.find((s) => statusMap[s.id] === 'pending');
    if (nextShipment) {
      handleSendSingleWhatsApp(nextShipment);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                إشعار الوصول غداً + طلب اللوكيشن عبر الواتساب
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                كابتن {activeCourier.name} • {totalCount} شحنة قائمة للعملاء
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Summary Stats Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي العملاء</span>
              <span className="text-sm sm:text-base font-black text-white">{totalCount}</span>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-700/80 p-2.5 rounded-2xl">
              <span className="text-[10px] text-emerald-300 block font-bold">تم الإرسال ✓</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">{sentCount}</span>
            </div>
            <div className="bg-amber-950/80 border border-amber-700/80 p-2.5 rounded-2xl">
              <span className="text-[10px] text-amber-300 block font-bold">ليس لديه واتساب ⚠️</span>
              <span className="text-sm sm:text-base font-black text-amber-400">{noWhatsappCount}</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-300 block font-bold">في الانتظار</span>
              <span className="text-sm sm:text-base font-black text-slate-200">{pendingCount}</span>
            </div>
          </div>

          {/* Quick Action Button & Auto Next */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-800/90 border border-slate-700 p-3 rounded-2xl">
            <div className="text-xs text-slate-300 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>قم بإرسال الرسالة لكل عميل بنقرة واحدة وتأكيد موعد وصول الغد</span>
            </div>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleSendNextPending}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                إرسال للعميل التالي تلقائياً
              </button>
            )}
          </div>

          {/* Template Customizer Drawer */}
          <details className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden group">
            <summary className="p-3 text-xs font-bold text-slate-300 cursor-pointer flex items-center justify-between hover:bg-slate-800">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                تعديل نص الرسالة الافتراضية للجميع
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">تخصيص النص ✎</span>
            </summary>
            <div className="p-3 pt-0 border-t border-slate-700/60 mt-2 space-y-2">
              <textarea
                rows={4}
                value={templateMessage}
                onChange={(e) => setTemplateMessage(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">
                المتغيرات التلقائية: {'{اسم_العميل}'} ، {'{اسم_المندوب}'} ، {'{رقم_البوليصة}'} ، {'{اسم_المتجر}'} ، {'{المبلغ}'}
              </p>
            </div>
          </details>

          {/* Active Shipments List */}
          {activeShipments.length === 0 ? (
            <div className="text-center p-8 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">لا توجد شحنات نشطة مسندة حالياً لإرسال التنبيهات!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                قائمة شحنات العملاء ({activeShipments.length}):
              </h4>

              {activeShipments.map((shipment) => {
                const currentStatus = statusMap[shipment.id] || 'pending';
                const cleanPhone = shipment.recipient.phone ? shipment.recipient.phone.replace(/\D/g, '') : '';
                const isPhoneInvalid = !cleanPhone || cleanPhone.length < 10;

                return (
                  <div
                    key={shipment.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      currentStatus === 'sent'
                        ? 'bg-emerald-950/30 border-emerald-800/80'
                        : currentStatus === 'no_whatsapp'
                        ? 'bg-amber-950/30 border-amber-800/80'
                        : 'bg-slate-800/70 border-slate-700'
                    }`}
                  >
                    {/* Customer Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{shipment.recipient.name}</span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold dir-ltr">
                            {shipment.recipient.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{shipment.recipient.city} - {shipment.recipient.address}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {currentStatus === 'sent' && (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            تم الإرسال ✓
                          </span>
                        )}
                        {currentStatus === 'no_whatsapp' && (
                          <span className="bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            معندوش وتس ⚠️
                          </span>
                        )}
                        {currentStatus === 'pending' && (
                          <span className="bg-slate-800 text-slate-300 border border-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            في الانتظار
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Details Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-slate-300 font-medium">
                      <span>بوليصة: <strong className="text-white font-mono">#{shipment.trackingNumber}</strong></span>
                      {shipment.sender.storeName && <span>التاجر: <strong className="text-amber-300">{shipment.sender.storeName}</strong></span>}
                      <span>الكاش: <strong className="text-emerald-400 font-extrabold">{shipment.financials.codAmount} ج.م</strong></span>
                    </div>

                    {/* Alert for No WhatsApp / Phone Invalid */}
                    {currentStatus === 'no_whatsapp' && (
                      <div className="bg-amber-950/70 border border-amber-700/80 p-2.5 rounded-xl text-xs text-amber-200 font-bold flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            {isPhoneInvalid
                              ? '⚠️ رقم الهاتف غير مكتمل أو غير دقيق - يرجى الاتصال هاتفياً بالعميل مباشرة'
                              : '⚠️ العميل لا يملك حساب واتساب - يرجى التواصل معه عبر الاتصال الهاتفي 📞'}
                          </span>
                        </div>
                        <a
                          href={`tel:${shipment.recipient.phone}`}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg font-black text-[11px] flex items-center gap-1 shrink-0 transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          اتصال هاتفياً
                        </a>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {/* Direct WhatsApp Send Button */}
                        <button
                          type="button"
                          onClick={() => handleSendSingleWhatsApp(shipment)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          إرسال واتساب (تأكيد + لوكيشن)
                        </button>

                        {/* Phone Call button */}
                        <a
                          href={`tel:${shipment.recipient.phone}`}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 border border-slate-700 transition-colors"
                          title="اتصال تلفوني مباشر"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Toggle "No WhatsApp" button */}
                      <button
                        type="button"
                        onClick={() => handleToggleNoWhatsApp(shipment.id)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                          currentStatus === 'no_whatsapp'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {currentStatus === 'no_whatsapp' ? 'إلغاء تنبيه معندوش وتس' : 'الرقم معندوش وتس ⚠️'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>💡 يتم فتح الواتساب تلقائياً برقم العميل ونص التنبيه وطلب اللوكيشن</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
