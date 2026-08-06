import React, { useState, useMemo } from 'react';
import { Shipment, UserSession } from '../types';
import { exportReturnsToExcel } from '../utils/excelExport';
import { 
  RotateCcw, 
  Store, 
  Search, 
  FileSpreadsheet, 
  PackageX, 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  Filter, 
  AlertTriangle, 
  User, 
  MapPin, 
  Truck, 
  ArrowUpRight, 
  CheckCircle2,
  PieChart
} from 'lucide-react';

interface ReturnsAccountingViewProps {
  shipments: Shipment[];
  systemUsers?: UserSession[];
  currentUser?: UserSession | null;
}

export const ReturnsAccountingView: React.FC<ReturnsAccountingViewProps> = ({
  shipments,
  systemUsers = [],
  currentUser
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const initialMerchant = !isAdmin && currentUser?.role === 'merchant'
    ? (currentUser.storeName || currentUser.name || 'all')
    : 'all';
  const [selectedMerchant, setSelectedMerchant] = useState<string>(initialMerchant);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'returned' | 'refused' | 'failed_attempt'>('all');

  // Extract all unique merchants/stores from shipments and system users
  const merchantList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; phone?: string; returnsCount: number }>();

    // Seed from system users with role 'merchant'
    systemUsers.filter(u => u.role === 'merchant').forEach(u => {
      const storeName = u.storeName || u.name;
      if (storeName) {
        map.set(storeName, { id: u.id || storeName, name: storeName, phone: u.phone, returnsCount: 0 });
      }
    });

    // Seed/update from shipments sender
    shipments.forEach(s => {
      const storeName = s.sender?.storeName || s.sender?.contactName;
      if (storeName) {
        if (!map.has(storeName)) {
          map.set(storeName, { id: storeName, name: storeName, phone: s.sender?.phone, returnsCount: 0 });
        }
      }
    });

    // Calculate returns count per merchant
    shipments.forEach(s => {
      const isReturn = s.status === 'returned' || s.status === 'refused' || s.status === 'failed_attempt' || s.status === 'partial_delivery';
      if (isReturn) {
        const storeName = s.sender?.storeName || s.sender?.contactName;
        if (storeName && map.has(storeName)) {
          const m = map.get(storeName)!;
          m.returnsCount += 1;
        }
      }
    });

    return Array.from(map.values());
  }, [shipments, systemUsers]);

  // All returned & partial delivery shipments in the system
  const allReturnShipments = useMemo(() => {
    return shipments.filter(s => 
      s.status === 'returned' || s.status === 'refused' || s.status === 'failed_attempt' || s.status === 'partial_delivery'
    );
  }, [shipments]);

  // Filter returned shipments by selected merchant
  const merchantReturns = useMemo(() => {
    return allReturnShipments.filter(s => {
      if (selectedMerchant === 'all') return true;
      const storeName = s.sender?.storeName || s.sender?.contactName;
      return storeName === selectedMerchant;
    });
  }, [allReturnShipments, selectedMerchant]);

  // Apply search & status sub-filter
  const filteredReturns = useMemo(() => {
    return merchantReturns.filter(s => {
      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      // Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchAwb = s.trackingNumber.toLowerCase().includes(term);
      const matchRecipient = s.recipient.name.toLowerCase().includes(term);
      const matchPhone = s.recipient.phone.includes(term);
      const matchGov = s.recipient.governorate.toLowerCase().includes(term);
      const matchStore = (s.sender?.storeName || s.sender?.contactName || '').toLowerCase().includes(term);

      return matchAwb || matchRecipient || matchPhone || matchGov || matchStore;
    });
  }, [merchantReturns, statusFilter, searchTerm]);

  // Total shipments for selected merchant (for return rate calculation)
  const totalMerchantShipmentsCount = useMemo(() => {
    if (selectedMerchant === 'all') return shipments.length;
    return shipments.filter(s => (s.sender?.storeName || s.sender?.contactName) === selectedMerchant).length;
  }, [shipments, selectedMerchant]);

  // Financial Metrics (WITHOUT SHIPPING FEES)
  const totalReturnsCount = merchantReturns.length;
  
  // Total Product Value of Returns (COD Amount without deducting shipping)
  const totalProductValue = useMemo(() => {
    return merchantReturns.reduce((sum, s) => {
      if (s.status === 'partial_delivery') {
        const collected = s.partialDetails?.partialCodAmount ?? s.financials.codAmount;
        const total = s.partialDetails?.originalCodAmount ?? s.financials.codAmount;
        return sum + (s.partialDetails?.remainingCodAmount ?? Math.max(0, total - collected));
      }
      return sum + s.financials.codAmount;
    }, 0);
  }, [merchantReturns]);

  // Total Returned Items / Pieces Count
  const totalReturnedPiecesCount = useMemo(() => {
    return merchantReturns.reduce((sum, s) => {
      if (s.status === 'partial_delivery') {
        const totalItems = s.packageDetails?.itemsCount || 1;
        const accepted = s.partialDetails?.acceptedItemsCount || 0;
        return sum + (s.partialDetails?.returnedItemsCount ?? Math.max(0, totalItems - accepted));
      }
      return sum + (s.packageDetails?.itemsCount || 1);
    }, 0);
  }, [merchantReturns]);

  // Total Shipping Fees Excluded / Zeroed
  const totalShippingFeesExcluded = useMemo(() => {
    return merchantReturns.reduce((sum, s) => sum + s.financials.shippingFee, 0);
  }, [merchantReturns]);

  // Net Return Value to Merchant (equals product value since shipping fee is zeroed)
  const netReturnPayout = totalProductValue;

  // Return Rate Percentage
  const returnRatePercent = totalMerchantShipmentsCount > 0 
    ? ((totalReturnsCount / totalMerchantShipmentsCount) * 100).toFixed(1) 
    : '0.0';

  const handleExportExcel = () => {
    const merchantNameLabel = selectedMerchant === 'all' ? 'جميع_التجار' : selectedMerchant;
    exportReturnsToExcel(filteredReturns, merchantNameLabel);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 bottom-0 opacity-10 p-6 pointer-events-none">
          <RotateCcw className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
                <RotateCcw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  كشف حساب المرتجعات (بدون مصاريف شحن)
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  حساب صافي قيمة بضائع المرتجعات لكل تاجر بالكامل بدون خصم رسوم الشحن
                </p>
              </div>
            </div>

            {/* Export Excel CTA */}
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير شيت المرتجعات إكسيل ({filteredReturns.length})</span>
            </button>
          </div>

          {/* Merchant Switcher Cards / Pills (Admin Only) */}
          {isAdmin && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Store className="w-4 h-4 text-red-400" />
                التبديل بين التجار والبحث عن متجر:
              </label>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedMerchant('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedMerchant === 'all'
                      ? 'bg-red-600 text-white shadow-md border border-red-500'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>جميع التجار ({allReturnShipments.length})</span>
                </button>

                {merchantList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMerchant(m.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      selectedMerchant === m.name
                        ? 'bg-red-600 text-white shadow-md border border-red-500'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.name}</span>
                    {m.returnsCount > 0 && (
                      <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {m.returnsCount} مرتجع
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Metrics Summary (No Shipping Fees Included) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Returns Count & Pieces */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي شحنات وقطع المرتجعات</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalReturnsCount} <span className="text-xs font-extrabold text-slate-500">شحنة</span>
          </p>
          <p className="text-xs text-amber-700 font-extrabold mt-1">
            📦 إجمالي القطع المرتجعة: {totalReturnedPiecesCount} قطعة
          </p>
        </div>

        {/* Total Product Value (COD without Shipping Deduction) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100">إجمالي قيمة بضائع المرتجعات</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2">
            {totalProductValue.toLocaleString()} <span className="text-xs font-bold text-emerald-100">ج.م</span>
          </p>
          <p className="text-[11px] text-emerald-100 font-extrabold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> شاملة باقي مبالغ التسليم الجزئي و المرتجعات
          </p>
        </div>

        {/* Excluded Shipping Fee Notice */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رسوم الشحن المستبعدة</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-400 line-through mt-2">
            {totalShippingFeesExcluded.toLocaleString()} <span className="text-xs font-bold">ج.م</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-black mt-1">
            ✓ تم صفر/استبعاد مصاريف الشحن
          </p>
        </div>

        {/* Return Rate Percentage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة المرتجعات للتاجر</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {returnRatePercent}%
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            من إجمالي {totalMerchantShipmentsCount} شحنة صادرة
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="ابحث برقم البوليصة، اسم العميل، رقم الهاتف أو المتجر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        {/* Status Sub-filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">تصفية حسب الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">جميع المرتجعات ({merchantReturns.length})</option>
            <option value="returned">مرتجع تم الاستلام</option>
            <option value="partial_delivery">استلام جزئي (تسليم جزء وارتجاع الباقي)</option>
            <option value="refused">مرفوض من العميل</option>
            <option value="failed_attempt">محاولة تسليم فاشلة</option>
          </select>
        </div>
      </div>

      {/* Returns Ledger Detailed Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              جدول المرتجعات والتسليم الجزئي — {selectedMerchant === 'all' ? 'جميع التجار' : selectedMerchant}
            </h3>
          </div>
          <span className="text-xs font-black text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl">
            {filteredReturns.length} شحنة
          </span>
        </div>

        {filteredReturns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <PackageX className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-600">
              لا توجد مرتجعات مسجلة لهذا التاجر أو لا تطابق خيارات البحث الحالية
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-black uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">م</th>
                  <th className="p-3.5">رقم البوليصة (AWB)</th>
                  <th className="p-3.5">تاريخ الطلب</th>
                  <th className="p-3.5">التاجر / المتجر</th>
                  <th className="p-3.5">المستلم والمحافظة</th>
                  <th className="p-3.5">إجمالي الطلب / الواصل</th>
                  <th className="p-3.5">رسوم الشحن</th>
                  <th className="p-3.5">قيمة المرتجع لكشف الحساب</th>
                  <th className="p-3.5">حالة المرتجع وتفاصيل القطع</th>
                  <th className="p-3.5">المندوب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map((s, idx) => {
                  const isPartial = s.status === 'partial_delivery';
                  const totalItems = s.packageDetails?.itemsCount || 1;
                  const acceptedItems = s.partialDetails?.acceptedItemsCount || 0;
                  const returnedItems = s.partialDetails?.returnedItemsCount ?? Math.max(0, totalItems - acceptedItems);

                  const collectedAmt = s.partialDetails?.partialCodAmount ?? s.financials.codAmount;
                  const totalOrigCod = s.partialDetails?.originalCodAmount ?? s.financials.codAmount;
                  const returnedCodVal = isPartial
                    ? (s.partialDetails?.remainingCodAmount ?? Math.max(0, totalOrigCod - collectedAmt))
                    : s.financials.codAmount;

                  let statusBadge = (
                    <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                      مرتجع ({totalItems} قطعة)
                    </span>
                  );

                  if (isPartial) {
                    statusBadge = (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-black">
                        استلام جزئي (مرتجع {returnedItems} من {totalItems} قطعة)
                      </span>
                    );
                  } else if (s.status === 'refused') {
                    statusBadge = (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                        {s.refusedDetails?.shippingFeePaid ? 'مرفوض (دفع الشحن)' : 'مرفوض من العميل'}
                      </span>
                    );
                  } else if (s.status === 'failed_attempt') {
                    statusBadge = (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                        محاولة فاشلة
                      </span>
                    );
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {s.trackingNumber}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900">
                        {s.sender?.storeName || s.sender?.contactName || 'غير محدد'}
                      </td>
                      <td className="p-3.5">
                        <p className="font-extrabold text-slate-900">{s.recipient.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {s.recipient.governorate} {s.recipient.city ? `- ${s.recipient.city}` : ''}
                        </p>
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        {isPartial ? (
                          <div>
                            <span className="block text-xs font-black text-slate-900">{totalOrigCod.toLocaleString()} ج.م</span>
                            <span className="block text-[10px] font-extrabold text-emerald-700">واصل عادي: {collectedAmt.toLocaleString()} ج.م</span>
                          </div>
                        ) : (
                          <span>{totalOrigCod.toLocaleString()} ج.م</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                          0 ج.م (مستبعد)
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-emerald-600 text-sm">
                        {returnedCodVal.toLocaleString()} ج.م
                      </td>
                      <td className="p-3.5 space-y-1">
                        <div>{statusBadge}</div>
                        {isPartial ? (
                          <p className="text-[11px] text-slate-600 font-bold">
                            تسليم {acceptedItems} قطعة ({collectedAmt} ج.م) — مرتجع {returnedItems} قطعة ({returnedCodVal} ج.م)
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                            {s.refusedDetails?.reason || s.recipient.notes || 'طلب التاجر / عدم استلام العميل'}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">
                        {s.assignedCourier?.name || 'غير مخصص'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
