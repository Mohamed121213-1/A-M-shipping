import React, { useEffect, useRef } from 'react';
import { Shipment } from '../types';
import { Printer, X, ShieldCheck, CheckCircle2, Ban } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface WaybillPrintModalProps {
  shipment: Shipment | null;
  onClose: () => void;
}

export const WaybillPrintModal: React.FC<WaybillPrintModalProps> = ({ shipment, onClose }) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (shipment?.trackingNumber && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, shipment.trackingNumber, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.8,
          height: 40,
          displayValue: false, // We render human-readable text cleanly below
          margin: 0,
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [shipment?.trackingNumber]);

  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-500" />
            <span className="font-black text-xs">معاينة بوليصة الشحن المصغرة</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة البوليصة
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area: Compact Thermal / 100mm Shipping Label */}
        <div className="p-4 bg-slate-100 flex justify-center">
          <div
            id="printable-airbill"
            className="w-full max-w-[390px] bg-white text-black p-2.5 rounded-lg border-2 border-black space-y-2 select-text shadow-sm"
            dir="rtl"
          >
            {/* ROW 1: Barcode & Tracking Number (Side A) + COD Price (Side B) */}
            <div className="grid grid-cols-2 gap-2 border-2 border-black rounded-lg p-2 bg-white items-center">
              {/* Barcode & Tracking Side */}
              <div className="flex flex-col items-center justify-center border-l-2 border-black/25 pl-2">
                <div className="w-full flex justify-center items-center py-0.5 overflow-hidden">
                  <svg ref={barcodeRef} className="max-w-full h-10 block" />
                </div>
                <div className="w-full text-center mt-0.5">
                  <span className="font-mono text-xs font-black tracking-wider text-black block leading-none">
                    *{shipment.trackingNumber}*
                  </span>
                  <span className="text-[10px] font-bold text-black/70 block mt-0.5">
                    {new Date(shipment.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              {/* COD Price & Inspection Side */}
              <div className="flex flex-col items-center justify-center text-center pr-1">
                <span className="text-[10px] font-black text-black block">
                  المبلغ المطلوب تحصيله (COD)
                </span>
                <div className="text-xl font-black text-black font-mono my-0.5 leading-tight">
                  {shipment.financials.codAmount.toLocaleString()}{' '}
                  <span className="text-xs font-bold font-sans">ج.م</span>
                </div>
                <div className="mt-1">
                  {shipment.packageDetails.allowOpening ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border border-black bg-white text-black">
                      <CheckCircle2 className="w-3 h-3 text-black" />
                      مسموح بفتح المعاينة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border border-black bg-black text-white">
                      <Ban className="w-3 h-3 text-white" />
                      ممنوع فتح الطرد
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 2: Sender (Store name only - phone & address removed as requested) */}
            <div className="border border-black rounded-lg px-2.5 py-1.5 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-black/75">الراسل (المتجر):</span>
              <span className="font-black text-xs text-black">
                {shipment.sender.storeName || shipment.sender.contactName || 'تاجر DropLine'}
              </span>
            </div>

            {/* ROW 3: Recipient Information (High Contrast, Bold, Clear) */}
            <div className="border-2 border-black rounded-lg p-2.5 bg-white space-y-1.5">
              <div className="flex items-center justify-between border-b border-black/20 pb-1">
                <span className="text-[11px] font-black text-black">بيانات العميل (المرسل إليه):</span>
                <span className="font-mono text-xs font-black dir-ltr text-black">
                  {shipment.recipient.phone}
                  {shipment.recipient.secondaryPhone ? ` / ${shipment.recipient.secondaryPhone}` : ''}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-black text-sm text-black">{shipment.recipient.name}</h4>
                <span className="text-[11px] font-black bg-black text-white px-2 py-0.5 rounded shrink-0">
                  {shipment.recipient.governorate}
                </span>
              </div>

              <div className="text-xs font-bold text-black leading-snug bg-slate-50 p-1.5 rounded border border-black/20">
                <span className="block font-black text-[11px] text-black/80 mb-0.5">العنوان التفصيلي:</span>
                <span>
                  {shipment.recipient.city}
                  {shipment.recipient.district ? ` - ${shipment.recipient.district}` : ''} -{' '}
                  {shipment.recipient.streetAddress}
                  {shipment.recipient.buildingNo ? `، مبنى ${shipment.recipient.buildingNo}` : ''}
                  {shipment.recipient.apartmentNo ? `، شقة ${shipment.recipient.apartmentNo}` : ''}
                </span>
              </div>

              {shipment.recipient.notes && (
                <div className="text-[10px] font-black text-black bg-amber-100/90 border border-amber-300 p-1 rounded">
                  ملاحظات: {shipment.recipient.notes}
                </div>
              )}
            </div>

            {/* ROW 4: Package Specifications (Compact 1-row grid) */}
            <div className="border border-black rounded-lg p-1.5 grid grid-cols-4 gap-1 text-center text-xs font-bold text-black bg-slate-50">
              <div className="border-l border-black/20 pl-1">
                <span className="text-[9px] text-black/70 block">المحتوى</span>
                <span className="text-[11px] font-black truncate block">
                  {shipment.packageDetails.description || 'طرد'}
                </span>
              </div>
              <div className="border-l border-black/20 pl-1">
                <span className="text-[9px] text-black/70 block">القطع</span>
                <span className="text-[11px] font-black block">
                  {shipment.packageDetails.itemsCount || 1}
                </span>
              </div>
              <div className="border-l border-black/20 pl-1">
                <span className="text-[9px] text-black/70 block">الوزن</span>
                <span className="text-[11px] font-black block">
                  {shipment.packageDetails.weightKg || 1} كجم
                </span>
              </div>
              <div>
                <span className="text-[9px] text-black/70 block">المستودع</span>
                <span className="text-[11px] font-black block truncate">
                  {shipment.assignedHub || 'الرئيسي'}
                </span>
              </div>
            </div>

            {/* ROW 5: Minimal Footnote */}
            <div className="border-t border-black/20 pt-1 flex items-center justify-between text-[9px] font-bold text-black/70">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-black" />
                <span>بوليصة إلكترونية رسمية - شبكة DropLine</span>
              </div>
              <span>خدمة العملاء: 19001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
