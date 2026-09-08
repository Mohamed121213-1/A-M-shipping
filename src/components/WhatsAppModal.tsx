import React, { useState } from 'react';
import { MessageSquare, Send, Copy, Check, X, ExternalLink, Sparkles, MapPin, Package } from 'lucide-react';
import { Shipment } from '../types';
import { 
  generateWhatsAppLink, 
  WHATSAPP_TEMPLATES, 
  formatPhoneNumberForWhatsApp,
  formatFullAddress,
  formatProductDetails,
  WhatsAppTemplateData 
} from '../utils/whatsapp';

interface WhatsAppModalProps {
  shipment: Shipment;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ shipment, onClose }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(WHATSAPP_TEMPLATES[0].id);

  const fullAddress = formatFullAddress(shipment.recipient);
  const productDesc = formatProductDetails(shipment.packageDetails);

  const templateData: WhatsAppTemplateData = {
    recipientName: shipment.recipient.name,
    recipientPhone: shipment.recipient.phone,
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

  const initialMsg = WHATSAPP_TEMPLATES[0].getMessage(templateData);
  const [customMessage, setCustomMessage] = useState<string>(initialMsg);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setCustomMessage(tmpl.getMessage(templateData));
    }
  };

  const formattedPhone = formatPhoneNumberForWhatsApp(shipment.recipient.phone);
  const whatsappUrl = generateWhatsAppLink(shipment.recipient.phone, customMessage);

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                إرسال رسالة واتساب للعميل
              </h3>
              <p className="text-xs text-emerald-100 font-medium dir-ltr text-right">
                {shipment.recipient.name} ({shipment.recipient.phone})
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

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Customer & Shipment summary card with full address & product */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-emerald-900 text-sm block">{shipment.recipient.name}</span>
                <span className="text-[11px] text-emerald-700 font-mono">الرقم المفعل: +{formattedPhone}</span>
              </div>
              <div className="text-left">
                <span className="bg-emerald-200/90 text-emerald-950 font-mono font-black text-[11px] px-2.5 py-1 rounded-full border border-emerald-300 block">
                  #{shipment.trackingNumber}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold mt-0.5 block">
                  {shipment.financials.codAmount} ج.م كاش
                </span>
              </div>
            </div>

            {/* Complete Address & Product Details preview */}
            <div className="pt-2 border-t border-emerald-200/70 space-y-1.5 text-[11px]">
              <div className="flex items-start gap-1.5 text-emerald-950 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-emerald-900 font-extrabold">العنوان الكامل:</strong>{' '}
                  {fullAddress}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-950 flex-wrap">
                <Package className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  <strong className="text-emerald-900 font-extrabold">نوع المنتج:</strong>{' '}
                  {productDesc}
                </span>
                {shipment.packageDetails?.allowOpening && (
                  <span className="bg-emerald-200/80 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded-md border border-emerald-300">
                    مسموح بالمعاينة قبل الدفع ✨
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              اختر قالب الرسالة الجاهزة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة (يمكنك تعديله قبل الإرسال):</label>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs font-medium p-3 border border-slate-300 rounded-2xl bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleCopyText}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'تم نسخ النص!' : 'نسخ النص'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(onClose, 500)}
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>فتح وتراسل عبر الواتساب</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
