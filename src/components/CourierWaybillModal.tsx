import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  X, 
  Phone, 
  MapPin, 
  Package, 
  Store, 
  ShieldCheck, 
  Ban, 
  ExternalLink,
  Printer,
  Sparkles
} from 'lucide-react';
import { Shipment } from '../types';
import { 
  generateWhatsAppLink, 
  formatPhoneNumberForWhatsApp, 
  formatFullAddress, 
  formatProductDetails, 
  generateWaybillMessage,
  WhatsAppTemplateData 
} from '../utils/whatsapp';
import JsBarcode from 'jsbarcode';

interface CourierWaybillModalProps {
  shipment: Shipment;
  onClose: () => void;
  onOpenPrintModal?: (shipment: Shipment) => void;
}

export const CourierWaybillModal: React.FC<CourierWaybillModalProps> = ({ 
  shipment, 
  onClose,
  onOpenPrintModal 
}) => {
  const [selectedPhone, setSelectedPhone] = useState<string>(shipment.recipient.phone);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const fullAddress = formatFullAddress(shipment.recipient);
  const productDesc = formatProductDetails(shipment.packageDetails);

  const templateData: WhatsAppTemplateData = {
    recipientName: shipment.recipient.name,
    recipientPhone: selectedPhone,
    secondaryPhone: shipment.recipient.secondaryPhone,
    recipientAddress: fullAddress,
    productType: productDesc,
    itemsCount: shipment.packageDetails?.itemsCount,
    allowOpening: shipment.packageDetails?.allowOpening,
    trackingNumber: shipment.trackingNumber,
    storeName: shipment.sender.storeName,
    codAmount: shipment.financials.codAmount,
    courierName: shipment.assignedCourier?.name,
    courierPhone: shipment.assignedCourier?.phone,
  };

  const waybillText = generateWaybillMessage(templateData);
  const formattedPhone = formatPhoneNumberForWhatsApp(selectedPhone);
  const whatsappUrl = generateWhatsAppLink(selectedPhone, waybillText);
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/?tracking=${shipment.trackingNumber}` : '';

  useEffect(() => {
    if (shipment.trackingNumber && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, shipment.trackingNumber, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 1.6,
          height: 36,
          displayValue: false,
          margin: 0,
        });
      } catch (e) {
        console.error('Barcode render error:', e);
      }
    }
  }, [shipment.trackingNumber]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(waybillText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTrackingLink = () => {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shadow-inner">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  بوليصة الشحن الرسمية
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  شاملة وموجزة
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                إرسال بيانات البوليصة كاملة للعميل بدون نصوص طويلة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto bg-slate-50/50">
          {/* Phone Selector if Secondary Phone exists */}
          {shipment.recipient.secondaryPhone && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
              <span className="text-xs font-black text-slate-800 block mb-2">
                📱 إرسال البوليصة إلى:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhone(shipment.recipient.phone)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    selectedPhone === shipment.recipient.phone
                      ? 'bg-blue-700 text-white border-blue-800 shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px]">الرقم الأساسي</span>
                  <span className="font-mono text-xs font-black dir-ltr">{shipment.recipient.phone}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPhone(shipment.recipient.secondaryPhone || '')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    selectedPhone === shipment.recipient.secondaryPhone
                      ? 'bg-blue-700 text-white border-blue-800 shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px]">الرقم الثاني ⭐</span>
                  <span className="font-mono text-xs font-black dir-ltr">{shipment.recipient.secondaryPhone}</span>
                </button>
              </div>
            </div>
          )}

          {/* Visual Digital Waybill Card (Receipt Format) */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
            {/* Top decorative receipt line */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                  #{shipment.trackingNumber}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {new Date(shipment.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="flex items-center">
                <svg ref={barcodeRef} className="h-8 w-28 block opacity-80" />
              </div>
            </div>

            {/* Recipient & Amount Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">المستلم:</span>
                <span className="text-sm font-black text-slate-900 block">{shipment.recipient.name}</span>
                <span className="text-xs font-mono font-bold text-blue-700 block dir-ltr text-right mt-0.5">
                  {selectedPhone}
                </span>
              </div>

              <div className="sm:text-left border-t sm:border-t-0 sm:border-r border-slate-200 pt-2 sm:pt-0 sm:pr-3">
                <span className="text-[11px] font-bold text-slate-500 block">المبلغ المطلوب كاش:</span>
                <div className="text-xl font-black text-emerald-600 font-mono leading-tight">
                  {shipment.financials.codAmount.toLocaleString()}{' '}
                  <span className="text-xs font-bold font-sans">ج.م</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${
                  shipment.packageDetails.allowOpening 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {shipment.packageDetails.allowOpening ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      مسموح بالفحص والمعاينة
                    </>
                  ) : (
                    <>
                      <Ban className="w-3 h-3" />
                      غير مسموح بالفتح
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Address & Store Info */}
            <div className="space-y-2 text-xs text-slate-700 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900">العنوان: </span>
                  <span>{fullAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900">المتجر / الراسل: </span>
                  <span className="font-bold text-slate-800">{shipment.sender.storeName || 'متجر معتمد'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900">محتوى الطرد: </span>
                  <span className="font-bold text-slate-800">{productDesc}</span>
                </div>
              </div>

              {shipment.assignedCourier?.name && (
                <div className="flex items-center gap-2 text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-lg text-[11px]">
                  <span>🚚 كابتن التوصيل:</span>
                  <span className="font-black text-slate-800">{shipment.assignedCourier.name}</span>
                  {shipment.assignedCourier.phone && (
                    <span className="font-mono text-slate-600 dir-ltr">({shipment.assignedCourier.phone})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actual WhatsApp text preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                نص الرسالة التي ستصل للعميل:
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-800 shadow-inner dir-rtl">
              {waybillText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Primary Action: Send via WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>إرسال البوليصة عبر واتساب الآن ({selectedPhone})</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </a>

            {/* Secondary actions grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'تم نسخ البوليصة' : 'نسخ نص البوليصة'}</span>
              </button>

              {onOpenPrintModal ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrintModal(shipment);
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>معاينة / طباعة البوليصة</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyTrackingLink}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-slate-600" />}
                  <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط التتبع'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
