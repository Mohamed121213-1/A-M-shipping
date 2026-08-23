import React, { useState } from 'react';
import { Shipment } from '../types';
import { Search, Package, MapPin, Truck, CheckCircle2, Clock, Phone, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';

interface PublicTrackingViewProps {
  shipments: Shipment[];
  initialTrackingNumber?: string;
}

export const PublicTrackingView: React.FC<PublicTrackingViewProps> = ({
  shipments,
  initialTrackingNumber = '',
}) => {
  const [searchTrackingNum, setSearchTrackingNum] = useState(initialTrackingNumber || 'BST-804101');
  const [searchedShipment, setSearchedShipment] = useState<Shipment | null>(
    shipments.find((s) => s.trackingNumber.toLowerCase() === (initialTrackingNumber || 'BST-804101').toLowerCase()) || shipments[0] || null
  );
  const [searchedError, setSearchedError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedError(false);
    const found = shipments.find(
      (s) => s.trackingNumber.trim().toLowerCase() === searchTrackingNum.trim().toLowerCase()
    );

    if (found) {
      setSearchedShipment(found);
    } else {
      setSearchedShipment(null);
      setSearchedError(true);
    }
  };

  // Helper for Stepper Progress %
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'created':
        return 20;
      case 'picked_up':
        return 40;
      case 'in_hub':
        return 65;
      case 'out_for_delivery':
        return 85;
      case 'delivered':
      case 'partial_delivery':
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Hero Banner Search */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-8 shadow-xl border border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
            <Package className="w-4 h-4" />
            تتبع شحنتك المباشر مع DropLine
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">أين طردك الآن؟</h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            أدخل رقم بوليصة الشحن الخاصة بك لمتابعة موقع الطرد ولحظات التسليم فورياً.
          </p>

          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md">
            <input
              type="text"
              placeholder="مثال: BST-804101..."
              value={searchTrackingNum}
              onChange={(e) => setSearchTrackingNum(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-mono px-3 focus:outline-none font-bold"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              تتبع الآن
            </button>
          </form>
        </div>
      </div>

      {searchedError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          لم نتمكن من العثور على بوليصة شحن بهذا الرقم ({searchTrackingNum}). يرجى التأكد من الرقم والمحاولة مجدداً.
        </div>
      )}

      {!searchedShipment && !searchedError && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs space-y-3">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-xs">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">بوابة تتبع الشحنات للعملاء</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            أدخل رقم بوليصة الشحن الخاصة بك في الحقل أعلاه لمتابعة تحركات شحنتك لحظة بلحظة.
          </p>
        </div>
      )}

      {searchedShipment && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs text-slate-500 font-bold block">رقم البوليصة (AWB Track No.):</span>
              <h3 className="text-2xl font-mono font-black text-slate-900">{searchedShipment.trackingNumber}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                المرسل: <span className="font-bold text-slate-900">{searchedShipment.sender.storeName}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left sm:text-right">
              <span className="text-xs text-slate-500 font-bold block">التاريخ المتوقع للتسليم:</span>
              <span className="text-lg font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-red-600" />
                {searchedShipment.estimatedDeliveryDate}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                {searchedShipment.recipient.governorate} - {searchedShipment.recipient.city}
              </span>
            </div>
          </div>

          {/* Progress Bar Visual Stepper */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>حالة الشحنة:</span>
              <span className="text-red-600 font-extrabold text-sm">
                {searchedShipment.status === 'delivered'
                  ? '✅ تم التسليم بنجاح'
                  : searchedShipment.status === 'partial_delivery'
                  ? '📦 تم الاستلام الجزئي للطرد'
                  : searchedShipment.status === 'refused'
                  ? '🚫 رفض الاستلام من العميل'
                  : searchedShipment.status === 'failed_attempt'
                  ? '⚠️ محاولة تسليم غير ناجحة'
                  : searchedShipment.status === 'out_for_delivery'
                  ? '🚚 الطرد مع المندوب للتسليم الآن'
                  : searchedShipment.status === 'in_hub'
                  ? '🏬 في فرع التوزيع الرئيسي'
                  : '📦 تم استلام الطرد من المتجر'}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(searchedShipment.status)}%` }}
              ></div>
            </div>

            {/* Stepper Labels */}
            <div className="grid grid-cols-4 text-center text-[11px] font-bold text-slate-500 pt-2">
              <div className="text-red-600">تم الإنشاء</div>
              <div className={getProgressPercentage(searchedShipment.status) >= 40 ? 'text-red-600' : ''}>تم الاستلام</div>
              <div className={getProgressPercentage(searchedShipment.status) >= 65 ? 'text-red-600' : ''}>في المستودع</div>
              <div className={getProgressPercentage(searchedShipment.status) >= 100 ? 'text-emerald-600 font-black' : ''}>تم التسليم</div>
            </div>
          </div>

          {/* Timeline Events Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              تاريخ وتحديثات الشحنة التفصيلية
            </h4>

            <div className="space-y-4">
              {searchedShipment.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-xs text-slate-900">{event.title}</h5>
                      <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    {event.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-bold mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
