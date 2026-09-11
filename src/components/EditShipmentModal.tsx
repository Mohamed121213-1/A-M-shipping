import React, { useState, useEffect } from 'react';
import { Shipment, GovernorateRate } from '../types';
import { EGYPT_GOVERNORATES } from '../data/mockData';
import { 
  X, Save, User, Phone, MapPin, Package, DollarSign, 
  AlertCircle, CheckCircle2, Building, ShieldCheck 
} from 'lucide-react';

interface EditShipmentModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  onClose: () => void;
  onSave: (shipmentId: string, updatedData: Partial<Shipment>) => void;
  governorates?: GovernorateRate[];
}

export const EditShipmentModal: React.FC<EditShipmentModalProps> = ({
  isOpen,
  shipment,
  onClose,
  onSave,
  governorates = EGYPT_GOVERNORATES,
}) => {
  if (!isOpen || !shipment) return null;

  // Recipient form state
  const [recipientName, setRecipientName] = useState(shipment.recipient.name || '');
  const [phone, setPhone] = useState(shipment.recipient.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(shipment.recipient.secondaryPhone || '');
  const [governorate, setGovernorate] = useState(shipment.recipient.governorate || 'القاهرة');
  const [city, setCity] = useState(shipment.recipient.city || '');
  const [district, setDistrict] = useState(shipment.recipient.district || '');
  const [streetAddress, setStreetAddress] = useState(shipment.recipient.streetAddress || '');
  const [buildingNo, setBuildingNo] = useState(shipment.recipient.buildingNo || '');
  const [apartmentNo, setApartmentNo] = useState(shipment.recipient.apartmentNo || '');
  const [notes, setNotes] = useState(shipment.recipient.notes || '');

  // Package form state
  const [packageDesc, setPackageDesc] = useState(shipment.packageDetails?.description || 'طرد مغلف');
  const [itemsCount, setItemsCount] = useState<number>(shipment.packageDetails?.itemsCount || 1);
  const [weightKg, setWeightKg] = useState<number>(shipment.packageDetails?.weightKg || 1);
  const [allowOpening, setAllowOpening] = useState<boolean>(shipment.packageDetails?.allowOpening ?? true);

  // Financials form state
  const [codAmount, setCodAmount] = useState<number>(shipment.financials.codAmount || 0);
  const [shippingFee, setShippingFee] = useState<number>(shipment.financials.shippingFee || 50);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever shipment changes
  useEffect(() => {
    if (shipment) {
      setRecipientName(shipment.recipient.name || '');
      setPhone(shipment.recipient.phone || '');
      setSecondaryPhone(shipment.recipient.secondaryPhone || '');
      setGovernorate(shipment.recipient.governorate || 'القاهرة');
      setCity(shipment.recipient.city || '');
      setDistrict(shipment.recipient.district || '');
      setStreetAddress(shipment.recipient.streetAddress || '');
      setBuildingNo(shipment.recipient.buildingNo || '');
      setApartmentNo(shipment.recipient.apartmentNo || '');
      setNotes(shipment.recipient.notes || '');

      setPackageDesc(shipment.packageDetails?.description || 'طرد مغلف');
      setItemsCount(shipment.packageDetails?.itemsCount || 1);
      setWeightKg(shipment.packageDetails?.weightKg || 1);
      setAllowOpening(shipment.packageDetails?.allowOpening ?? true);

      setCodAmount(shipment.financials.codAmount || 0);
      setShippingFee(shipment.financials.shippingFee || 50);
      setError(null);
    }
  }, [shipment]);

  // Handle governorate change
  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGovName = e.target.value;
    setGovernorate(selectedGovName);
    const foundGov = governorates.find((g) => g.nameAr === selectedGovName);
    if (foundGov) {
      setCity(foundGov.nameAr);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!recipientName.trim()) {
      setError('يرجى كتابة اسم المستلم / العميل.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('يرجى إدخال رقم هاتف أساسي صحيح (11 رقماً على الأقل).');
      return;
    }

    if (!streetAddress.trim()) {
      setError('يرجى إدخال تفاصيل العنوان أو اسم الشارع.');
      return;
    }

    if (codAmount < 0) {
      setError('مبلغ التحصيل لا يمكن أن يكون سالباً.');
      return;
    }

    const netPayout = Math.max(0, codAmount - shippingFee);

    const updatedData: Partial<Shipment> = {
      recipient: {
        ...shipment.recipient,
        name: recipientName.trim(),
        phone: phone.trim(),
        secondaryPhone: secondaryPhone.trim() || undefined,
        governorate: governorate.trim(),
        city: city.trim() || governorate.trim(),
        district: district.trim() || city.trim(),
        streetAddress: streetAddress.trim(),
        buildingNo: buildingNo.trim() || undefined,
        apartmentNo: apartmentNo.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      packageDetails: {
        ...shipment.packageDetails,
        description: packageDesc.trim() || 'طرد مغلف',
        itemsCount: Math.max(1, Number(itemsCount) || 1),
        weightKg: Math.max(0.5, Number(weightKg) || 1),
        allowOpening: Boolean(allowOpening),
      },
      financials: {
        ...shipment.financials,
        codAmount: Number(codAmount) || 0,
        shippingFee: Number(shippingFee) || 0,
        netPayout: (shipment.status === 'returned' || shipment.status === 'refused') ? 0 : netPayout,
      },
    };

    onSave(shipment.id, updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
              ✏️
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">تعديل بيانات الأوردر</h3>
              <p className="text-xs text-slate-400 font-mono">
                بوليصة رقم #{shipment.trackingNumber} {shipment.sender.storeName ? `• ${shipment.sender.storeName}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Recipient Information */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-200/80 pb-2">
              <User className="w-4 h-4 text-red-600" />
              <span>1. بيانات المستلم وأرقام الهواتف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold mb-1">اسم العميل / المستلم *</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="الاسم ثلاثي أو ثنائي"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  رقم الهاتف الأساسي * <span className="text-[10px] text-slate-400">(المفعل للاتصال والواتساب)</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-mono font-bold text-slate-900 text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-800 font-extrabold mb-1">
                  الرقم الإضافي / البديل <span className="text-[10px] text-emerald-600 font-bold">(يظهر للمندوب احتياطياً 📱)</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="01xxxxxxxxx (اختياري)"
                  className="w-full p-2.5 bg-emerald-50/60 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-950 text-right"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-200/80 pb-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>2. تفاصيل العنوان وموقع التسليم</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">المحافظة *</label>
                <select
                  value={governorate}
                  onChange={handleGovChange}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900 cursor-pointer"
                >
                  {governorates.map((g) => (
                    <option key={g.code || g.nameAr} value={g.nameAr}>
                      {g.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">المركز / المدينة / المنطقة *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: المعادي / مدينة نصر / المنصورة"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold mb-1">العنوان التفصيلي واسم الشارع *</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="مثال: شارع النصر، متفرع من شارع 9"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم العمارة / المبنى (اختياري)</label>
                <input
                  type="text"
                  value={buildingNo}
                  onChange={(e) => setBuildingNo(e.target.value)}
                  placeholder="مثال: عمارة 14"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الدور / الشقة (اختياري)</label>
                <input
                  type="text"
                  value={apartmentNo}
                  onChange={(e) => setApartmentNo(e.target.value)}
                  placeholder="مثال: الدور 3، شقة 5"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">علامة مميزة / ملاحظات المندوب</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بجوار صيدلية العزبي أو أمام المسجد الكبير"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Package & Products */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-200/80 pb-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>3. تفاصيل ونوع المنتج</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-extrabold mb-1">
                  نوع ومحتوى المنتج * <span className="text-[10px] text-slate-500">(يظهر في رسائل الواتساب والبوليصة)</span>
                </label>
                <input
                  type="text"
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  placeholder="مثال: طرد ملابس / ساعة يد / إكسسوارات"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">عدد القطع</label>
                <input
                  type="number"
                  min={1}
                  value={itemsCount}
                  onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">الوزن التقديري (كجم)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-center"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 w-full hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={allowOpening}
                    onChange={(e) => setAllowOpening(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">السماح للعميل بفتح ومعاينة الطرد قبل الدفع ✨</span>
                    <span className="text-[10px] text-slate-500 block">تظهر في رسالة الواتساب وتنبيه المندوب</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Financials */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 border-b border-slate-200/80 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>4. المبالغ والماليات (COD ومصاريف الشحن)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-800 font-black mb-1">
                  المبلغ المطلوب تحصيله كاش (COD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 font-mono font-black text-red-600 text-sm text-center"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">ج.م</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-black mb-1">مصاريف الشحن</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={shippingFee}
                    onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 text-sm text-center"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">ج.م</span>
                </div>
              </div>

              {/* Net Payout preview */}
              <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-900 block">صافي مستحقات التاجر المحسوبة:</span>
                  <span className="text-[10px] text-emerald-700">(مبلغ التحصيل المطلوب - مصاريف الشحن)</span>
                </div>
                <span className="text-base font-black font-mono text-emerald-700">
                  {Math.max(0, codAmount - shippingFee).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
