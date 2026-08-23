import React from 'react';
import { Shipment } from '../types';
import { Printer, Download, X, PackageCheck, AlertTriangle, ShieldCheck, MapPin, Phone, User, Building } from 'lucide-react';

interface WaybillPrintModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  activeLogo?: string;
}

export const WaybillPrintModal: React.FC<WaybillPrintModalProps> = ({ shipment, onClose, activeLogo = '/dropline-official.jpg' }) => {
  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base">معاينة وطباعة بوليصة الشحن (DropLine)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة البوليصة
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Airbill Area */}
        <div id="printable-airbill" className="p-8 text-slate-900 bg-white space-y-6 select-text">
          {/* Airbill Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border-2 border-slate-900 overflow-hidden shrink-0 bg-white">
                <img
                  src={activeLogo}
                  alt="DropLine Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-red-600 text-white font-black text-xl">D</div>`;
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-900">Drop<span className="text-red-600">Line</span></span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">بوليصة شحن جوي وبري رسمية - شبكة DropLine مصر</p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs text-slate-500 block">رقم البوليصة (AWB Track No.):</span>
              <span className="text-2xl font-mono font-black text-slate-900 tracking-wider">{shipment.trackingNumber}</span>
              <span className="text-[10px] text-slate-500 block">التاريخ: {new Date(shipment.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>

          {/* Barcode & QR Display Box */}
          <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-right">
              <span className="text-xs font-bold text-slate-600 block mb-1">رمز المتابعة والمسح السريع (Barcode):</span>
              
              {/* CSS-based Barcode Simulation */}
              <div className="bg-white p-3 border border-slate-300 rounded-lg inline-block w-full max-w-[280px]">
                <div className="h-14 flex items-center justify-center gap-1 overflow-hidden px-2">
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-0.5 h-full bg-slate-900"></div>
                  <div className="w-2 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                  <div className="w-3 h-full bg-slate-900"></div>
                  <div className="w-0.5 h-full bg-slate-900"></div>
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-2.5 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                  <div className="w-2 h-full bg-slate-900"></div>
                  <div className="w-0.5 h-full bg-slate-900"></div>
                  <div className="w-3 h-full bg-slate-900"></div>
                  <div className="w-1.5 h-full bg-slate-900"></div>
                  <div className="w-2 h-full bg-slate-900"></div>
                  <div className="w-1 h-full bg-slate-900"></div>
                </div>
                <span className="font-mono text-sm font-bold tracking-widest text-slate-800 block text-center mt-1">
                  *{shipment.trackingNumber}*
                </span>
              </div>
            </div>

            {/* COD Amount Big Highlight */}
            <div className="bg-red-50 border-2 border-red-600 rounded-xl p-4 text-center min-w-[200px] shadow-sm">
              <span className="text-xs font-bold text-red-700 block">المبلغ المطلوب تحصيله (COD):</span>
              <span className="text-3xl font-black text-red-600 block my-1">
                {shipment.financials.codAmount.toLocaleString()} <span className="text-base font-bold">ج.م</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-red-200 inline-block">
                {shipment.packageDetails.allowOpening ? '🟢 مسموح بفتح المعاينة' : '🔴 ممنوع فتح الطرد'}
              </span>
            </div>
          </div>

          {/* Sender & Recipient Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-2">
                <Building className="w-4 h-4 text-slate-700" />
                بيانات الراسل (التاجر):
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">{shipment.sender.storeName}</h4>
              <p className="text-xs text-slate-700 font-medium">مسؤول التواصل: {shipment.sender.contactName}</p>
              <p className="text-xs text-slate-700 font-mono mt-0.5" dir="ltr">{shipment.sender.phone}</p>
              <p className="text-xs text-slate-600 mt-2 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                {shipment.sender.governorate} - {shipment.sender.city} - {shipment.sender.pickupAddress}
              </p>
            </div>

            {/* Recipient Box */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase border-b border-slate-200 pb-2 mb-2">
                <User className="w-4 h-4 text-red-600" />
                بيانات المرسل إليه (العميل):
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-1">{shipment.recipient.name}</h4>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-900" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {shipment.recipient.phone} {shipment.recipient.secondaryPhone ? `/ ${shipment.recipient.secondaryPhone}` : ''}
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                <span className="text-amber-800 font-bold block">المحافظة والمنطقة:</span>
                {shipment.recipient.governorate} - {shipment.recipient.city} {shipment.recipient.district ? `- ${shipment.recipient.district}` : ''}
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                {shipment.recipient.streetAddress} {shipment.recipient.buildingNo ? `، مبنى ${shipment.recipient.buildingNo}` : ''} {shipment.recipient.apartmentNo ? `، شقة ${shipment.recipient.apartmentNo}` : ''}
              </p>
              {shipment.recipient.notes && (
                <p className="text-[11px] text-red-600 font-bold mt-1 bg-red-50 p-1 rounded border border-red-100">
                  ملاحظات: {shipment.recipient.notes}
                </p>
              )}
            </div>
          </div>

          {/* Package & Shipping Specifications */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">وصف المحتويات:</span>
              <span className="text-xs font-bold text-slate-900">{shipment.packageDetails.description}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">عدد القطع:</span>
              <span className="text-xs font-bold text-slate-900">{shipment.packageDetails.itemsCount} قطعة</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">الوزن التقديري:</span>
              <span className="text-xs font-bold text-slate-900">{shipment.packageDetails.weightKg} كجم</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">المستودع المخصص:</span>
              <span className="text-xs font-bold text-slate-900">{shipment.assignedHub}</span>
            </div>
          </div>

          {/* Airbill Footnote & Terms */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>هذه البوليصة صادرة إلكترونياً ومحمية بنظام التتبع المباشر من DropLine</span>
            </div>
            <span>الدعم الفني والخدمات: 19001 | dropline.eg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
