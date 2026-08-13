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
  onMarkReturnedToMerchant?: (shipmentId: string) => void;
}

export const ReturnsAccountingView: React.FC<ReturnsAccountingViewProps> = ({
  shipments,
  systemUsers = [],
  currentUser,
  onMarkReturnedToMerchant
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const initialMerchant = !isAdmin && currentUser?.role === 'merchant'
    ? (currentUser.storeName || currentUser.name || 'all')
    : 'all';
  const [selectedMerchant, setSelectedMerchant] = useState<string>(initialMerchant);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'returned' | 'refused' | 'failed_attempt'>('all');
  const [handoverFilter, setHandoverFilter] = useState<'active' | 'handed_over' | 'all'>('active');

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

    // Calculate active returns count per merchant
    shipments.forEach(s => {
      const isReturn = s.status === 'returned' || s.status === 'refused' || s.status === 'failed_attempt' || s.status === 'partial_delivery';
      if (isReturn && !s.isReturnedToMerchant) {
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

  // Filter returned shipments by selected merchant (or current merchant user)
  const merchantReturns = useMemo(() => {
    if (!isAdmin && currentUser?.role === 'merchant') {
      // Merchant logged in: show all shipments that match merchant store name/contact/phone or are already passed in
      const uStore = currentUser.storeName || currentUser.name || '';
      const uPhone = currentUser.phone || '';
      return allReturnShipments.filter(s => {
        if (!uStore && !uPhone) return true;
        const sStore = s.sender?.storeName || s.sender?.contactName || '';
        const sPhone = s.sender?.phone || '';
        return sStore === uStore || sStore.includes(uStore) || uStore.includes(sStore) || (uPhone && sPhone === uPhone);
      });
    }

    return allReturnShipments.filter(s => {
      if (selectedMerchant === 'all') return true;
      const storeName = s.sender?.storeName || s.sender?.contactName;
      return storeName === selectedMerchant;
    });
  }, [allReturnShipments, selectedMerchant, isAdmin, currentUser]);

  // Apply search, status sub-filter, and handover status filter
  const filteredReturns = useMemo(() => {
    return merchantReturns.filter(s => {
      // Handover status filter (Active vs Handed Over to merchant)
      if (handoverFilter === 'active' && s.isReturnedToMerchant) return false;
      if (handoverFilter === 'handed_over' && !s.isReturnedToMerchant) return false;

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
  }, [merchantReturns, handoverFilter, statusFilter, searchTerm]);

  // Counts for tabs
  const activeReturnsCount = useMemo(() => merchantReturns.filter(s => !s.isReturnedToMerchant).length, [merchantReturns]);
  const handedOverReturnsCount = useMemo(() => merchantReturns.filter(s => s.isReturnedToMerchant).length, [merchantReturns]);

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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Merchant banner if logged in as merchant */}
        {!isAdmin && currentUser && (
          <div className="bg-gradient-to-r from-slate-900 to-red-950 text-white p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="font-black text-xs text-white">كشف مرتجعات متجرك: {currentUser.storeName || currentUser.name}</h4>
                <p className="text-[11px] font-bold text-slate-300">يتم عرض جميع شحنات المرتجعات والتسليم الجزئي لمتجرك بالتفصيل بدون خصم مصاريف الشحن</p>
              </div>
            </div>
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black shrink-0">
              {merchantReturns.length} مرتجع
            </span>
          </div>
        )}

        {/* Handover Tabs (Active vs Handed Over to Merchant) */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setHandoverFilter('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              handoverFilter === 'active'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>المرتجعات بالمستودع (قيد التسليم)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${handoverFilter === 'active' ? 'bg-red-950 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {activeReturnsCount}
            </span>
          </button>

          <button
            onClick={() => setHandoverFilter('handed_over')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              handoverFilter === 'handed_over'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>سجل المرتجعات المسلمة للتاجر</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${handoverFilter === 'handed_over' ? 'bg-emerald-950 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {handedOverReturnsCount}
            </span>
          </button>

          <button
            onClick={() => setHandoverFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              handoverFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>جميع المرتجعات</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${handoverFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {merchantReturns.length}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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
              <option value="all">جميع الحالات ({merchantReturns.length})</option>
              <option value="returned">مرتجع تم الاستلام</option>
              <option value="partial_delivery">استلام جزئي (تسليم جزء وارتجاع الباقي)</option>
              <option value="refused">مرفوض من العميل</option>
              <option value="failed_attempt">محاولة تسليم فاشلة</option>
            </select>
          </div>
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
              {handoverFilter === 'active' 
                ? 'لا توجد مرتجعات نشطة قيد الإرجاع بالمستودع حالياً'
                : handoverFilter === 'handed_over'
                ? 'لا توجد مرتجعات سابقة تم تسليمها للتاجر حتى الآن'
                : 'لا توجد مرتجعات مسجلة لهذا التاجر أو لا تطابق خيارات البحث الحالية'}
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (Visible on screens < md) */}
            <div className="block md:hidden divide-y divide-slate-100">
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
                  <span className="bg-red-50 text-red-800 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 leading-snug">
                    <RotateCcw className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>مرتجع كامل ({totalItems} قطعة)</span>
                  </span>
                );

                if (isPartial) {
                  statusBadge = (
                    <span className="bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 leading-snug">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>استلام جزئي (مرتجع {returnedItems} من {totalItems} قطعة)</span>
                    </span>
                  );
                } else if (s.status === 'refused' || s.status === 'returned') {
                  const collected = s.refusedDetails?.amountCollected || 0;
                  statusBadge = (
                    <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 leading-snug">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        {s.refusedDetails?.shippingFeePaid
                          ? 'مرفوض (دفع كامل الشحن)'
                          : s.refusedDetails?.partialShippingFeePaid || collected > 0
                          ? `مرفوض (دفع جزء من الشحن ${collected} ج.م)`
                          : 'مرفوض من العميل (خصم الشحن من التاجر)'}
                      </span>
                    </span>
                  );
                } else if (s.status === 'failed_attempt') {
                  statusBadge = (
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 leading-snug">
                      <PackageX className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>محاولة تسليم فاشلة</span>
                    </span>
                  );
                }

                return (
                  <div key={s.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/80 transition-colors">
                    {/* Header: AWB + Date + Merchant */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          #{s.trackingNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-800 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
                        {s.sender?.storeName || s.sender?.contactName || 'متجر التاجر'}
                      </span>
                    </div>

                    {/* Status Badge & Reason */}
                    <div className="space-y-1.5">
                      <div>{statusBadge}</div>
                      {isPartial ? (
                        <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl text-xs text-amber-950 font-bold leading-relaxed">
                          <p>📦 تم تسليم {acceptedItems} قطعة بقيمة ({collectedAmt.toLocaleString()} ج.م)</p>
                          <p className="text-rose-700">↩️ ارتجاع {returnedItems} قطعة بقيمة ({returnedCodVal.toLocaleString()} ج.م)</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-200/60 leading-relaxed">
                          <span className="font-bold text-slate-800">سبب الحالة: </span>
                          {s.refusedDetails?.reason || s.recipient.notes || 'طلب التاجر / عدم استلام العميل'}
                        </p>
                      )}
                    </div>

                    {/* Recipient & Financials */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">المستلم والمحافظة:</span>
                        <p className="font-black text-slate-900">{s.recipient.name}</p>
                        <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          {s.recipient.governorate}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">قيمة المرتجع لكشف الحساب:</span>
                        <p className="font-black text-emerald-600 text-sm">{returnedCodVal.toLocaleString()} ج.م</p>
                        <span className="text-[10px] font-bold text-slate-500">
                          {isPartial ? `من أصل ${totalOrigCod.toLocaleString()} ج.م` : 'كامل قيمة البضاعة'}
                        </span>
                      </div>
                    </div>

                    {/* Courier & Handover Action */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-xs font-bold text-slate-600">
                        المندوب: <span className="text-slate-900">{s.assignedCourier?.name || 'غير مخصص'}</span>
                      </div>

                      <div>
                        {isAdmin ? (
                          !s.isReturnedToMerchant ? (
                            <button
                              onClick={() => onMarkReturnedToMerchant && onMarkReturnedToMerchant(s.id)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>تم الارتجاع للتاجر</span>
                            </button>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>تم التسليم للتاجر</span>
                            </span>
                          )
                        ) : (
                          s.isReturnedToMerchant ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>تم تسليم المرتجع إليك</span>
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1">
                              <RotateCcw className="w-4 h-4 text-amber-700" />
                              <span>بالمستودع الرئيسي</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
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
                    <th className="p-3.5">تسليم المرتجع للتاجر</th>
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
                      <span className="bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg text-[10px] font-black inline-block leading-snug">
                        مرتجع ({totalItems} قطعة)
                      </span>
                    );

                    if (isPartial) {
                      statusBadge = (
                        <span className="bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-black inline-block leading-snug">
                          استلام جزئي (مرتجع {returnedItems} من {totalItems} قطعة)
                        </span>
                      );
                    } else if (s.status === 'refused' || s.status === 'returned') {
                      const collected = s.refusedDetails?.amountCollected || 0;
                      statusBadge = (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black inline-block leading-snug">
                          {s.refusedDetails?.shippingFeePaid
                            ? 'مرفوض (دفع كامل الشحن)'
                            : s.refusedDetails?.partialShippingFeePaid || collected > 0
                            ? `مرفوض (دفع جزء من الشحن ${collected} ج.م)`
                            : 'مرفوض من العميل (خصم الشحن من التاجر)'}
                        </span>
                      );
                    } else if (s.status === 'failed_attempt') {
                      statusBadge = (
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black inline-block leading-snug">
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
                        <td className="p-3.5 space-y-1 max-w-[260px]">
                          <div>{statusBadge}</div>
                          {isPartial ? (
                            <p className="text-[11px] text-slate-600 font-bold leading-snug">
                              تسليم {acceptedItems} قطعة ({collectedAmt} ج.م) — مرتجع {returnedItems} قطعة ({returnedCodVal} ج.م)
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 font-medium leading-snug break-words">
                              {s.refusedDetails?.reason || s.recipient.notes || 'طلب التاجر / عدم استلام العميل'}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">
                          {s.assignedCourier?.name || 'غير مخصص'}
                        </td>
                        <td className="p-3.5">
                          {isAdmin ? (
                            !s.isReturnedToMerchant ? (
                              <button
                                onClick={() => onMarkReturnedToMerchant && onMarkReturnedToMerchant(s.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                title="تأكيد تسليم المرتجع للتاجر وإخفائه فورياً من المرتجعات النشطة"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                <span>تم الارتجاع للتاجر</span>
                              </button>
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>تم التسليم للتاجر</span>
                                </span>
                                {s.returnedToMerchantAt && (
                                  <span className="text-[9px] text-slate-500 font-medium">
                                    {new Date(s.returnedToMerchantAt).toLocaleDateString('ar-EG')}
                                  </span>
                                )}
                              </div>
                            )
                          ) : (
                            s.isReturnedToMerchant ? (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>تم تسليم المرتجع إليك</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 whitespace-nowrap">
                                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                <span>بالمستودع الرئيسي</span>
                              </span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
