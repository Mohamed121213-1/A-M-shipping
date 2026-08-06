import React, { useState } from 'react';
import { MerchantWallet, Shipment, CourierInfo, UserSession } from '../types';
import { BOSTA_COURIERS } from '../data/mockData';
import { ReturnsAccountingView } from './ReturnsAccountingView';
import { 
  Wallet, 
  ArrowDownLeft, 
  Landmark, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  Receipt, 
  UserCheck, 
  CheckCircle2, 
  Building2,
  HandCoins,
  RotateCcw,
  Edit3,
  X,
  Sliders,
  RefreshCw
} from 'lucide-react';

interface WalletViewProps {
  wallet: MerchantWallet;
  shipments: Shipment[];
  onRequestPayout: (amount: number, method: string) => void;
  couriers?: CourierInfo[];
  systemUsers?: UserSession[];
  currentUser?: UserSession | null;
  onSettleCourierCustody?: (courierId: string) => void;
  onUpdateWallet?: (updatedWallet: MerchantWallet) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  shipments,
  onRequestPayout,
  couriers = BOSTA_COURIERS,
  systemUsers = [],
  currentUser = null,
  onSettleCourierCustody,
  onUpdateWallet,
}) => {
  const isAdmin = !currentUser || currentUser.role === 'admin';
  const [activeSubTab, setActiveSubTab] = useState<'merchant' | 'returns' | 'couriers'>('merchant');
  const [payoutAmount, setPayoutAmount] = useState<number>(wallet.availableBalance);
  const [payoutMethod, setPayoutMethod] = useState<'instapay' | 'vodafone' | 'bank'>('instapay');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  // Edit Wallet State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inlineEditingField, setInlineEditingField] = useState<'availableBalance' | 'pendingCod' | 'totalPaidOut' | null>(null);
  const [inlineValue, setInlineValue] = useState<number>(0);

  const [editForm, setEditForm] = useState({
    availableBalance: wallet.availableBalance,
    pendingCod: wallet.pendingCod,
    totalPaidOut: wallet.totalPaidOut,
    merchantName: wallet.merchantName || 'التاجر الرئيسي',
  });

  const handleStartInlineEdit = (field: 'availableBalance' | 'pendingCod' | 'totalPaidOut', currentVal: number) => {
    setInlineEditingField(field);
    setInlineValue(currentVal);
  };

  const handleSaveInlineEdit = () => {
    if (inlineEditingField && onUpdateWallet) {
      onUpdateWallet({
        ...wallet,
        [inlineEditingField]: Math.max(0, Number(inlineValue) || 0),
      });
    }
    setInlineEditingField(null);
  };

  const handleQuickZeroOut = (field: 'pendingCod' | 'totalPaidOut' | 'availableBalance') => {
    if (onUpdateWallet) {
      onUpdateWallet({
        ...wallet,
        [field]: 0,
      });
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({
      availableBalance: wallet.availableBalance,
      pendingCod: wallet.pendingCod,
      totalPaidOut: wallet.totalPaidOut,
      merchantName: wallet.merchantName || 'التاجر الرئيسي',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveWalletEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MerchantWallet = {
      ...wallet,
      availableBalance: Number(editForm.availableBalance) || 0,
      pendingCod: Number(editForm.pendingCod) || 0,
      totalPaidOut: Number(editForm.totalPaidOut) || 0,
      merchantName: editForm.merchantName,
    };
    if (onUpdateWallet) {
      onUpdateWallet(updated);
    }
    setIsEditModalOpen(false);
  };

  // All collected shipments (for merchant ledger)
  const collectedShipments = shipments.filter(
    (s) => s.status === 'delivered' || s.status === 'partial_delivery' || ((s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid)
  );

  // Unsettled collected shipments for courier custody
  const unsettledCollectedShipments = shipments.filter(
    (s) => !s.isCourierSettled && (s.status === 'delivered' || s.status === 'partial_delivery' || ((s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid))
  );

  // Combine passed couriers + system Users with role 'courier' + any couriers assigned on shipments
  const courierMap = new Map<string, CourierInfo>();
  
  (couriers && couriers.length > 0 ? couriers : BOSTA_COURIERS).forEach((c) => {
    const key = c.id || c.phone || c.name;
    if (key) courierMap.set(key, c);
  });

  (systemUsers || []).filter((u) => u.role === 'courier').forEach((u) => {
    const exists = Array.from(courierMap.values()).some(
      (c) => (u.id && c.id === u.id) || (u.phone && c.phone === u.phone) || (u.name && c.name === u.name)
    );
    if (!exists) {
      const newC: CourierInfo = {
        id: u.id || `cour-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: u.name,
        phone: u.phone,
        vehicle: u.courierVehicle === 'سيارة فان' ? 'van' : 'motocycle',
        assignedHub: u.hubName || 'المستودع الرئيسي',
        rating: 5.0,
        activeShipmentsCount: 0,
        codCollectedToday: 0,
        photoUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=ffffff`,
      };
      courierMap.set(newC.id, newC);
    }
  });

  shipments.forEach((s) => {
    if (s.assignedCourier) {
      const exists = Array.from(courierMap.values()).some(
        (c) => (s.assignedCourier?.id && c.id === s.assignedCourier.id) ||
               (s.assignedCourier?.phone && c.phone === s.assignedCourier.phone) ||
               (s.assignedCourier?.name && c.name === s.assignedCourier.name)
      );
      if (!exists) {
        const key = s.assignedCourier.id || s.assignedCourier.phone || s.assignedCourier.name;
        if (key) courierMap.set(key, s.assignedCourier);
      }
    }
  });

  const effectiveCouriers = Array.from(courierMap.values());

  // Compute COD collected per courier dynamically (from unsettled shipments)
  const courierFinancials = effectiveCouriers.map((courier) => {
    const courierCollected = unsettledCollectedShipments.filter((s) => {
      if (!s.assignedCourier) return false;
      const matchId = Boolean(s.assignedCourier.id && courier.id && s.assignedCourier.id === courier.id);
      const matchPhone = Boolean(s.assignedCourier.phone && courier.phone && s.assignedCourier.phone === courier.phone);
      const matchName = Boolean(s.assignedCourier.name && courier.name && s.assignedCourier.name === courier.name);
      return matchId || matchPhone || matchName;
    });

    const totalCollected = courierCollected.reduce((sum, s) => {
      if ((s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid) {
        return sum + (s.refusedDetails.amountCollected || s.financials.shippingFee);
      }
      if (s.status === 'partial_delivery') {
        return sum + (s.partialDetails?.partialCodAmount ?? s.financials.codAmount);
      }
      return sum + s.financials.codAmount;
    }, 0);

    const isSettled = totalCollected === 0;

    return {
      courier,
      deliveredCount: courierCollected.length,
      totalCollected,
      isSettled,
      deliveredShipments: courierCollected
    };
  });

  const totalCouriersCashHeld = courierFinancials
    .reduce((sum, cf) => sum + cf.totalCollected, 0);

  // Calculate total net payouts earned by merchant across all completed/refused shipments
  const totalEarnedMerchantNetPayout = shipments.reduce((sum, s) => {
    if (s.status === 'delivered') {
      return sum + (s.financials.netPayout ?? (s.financials.codAmount - s.financials.shippingFee));
    }
    if (s.status === 'partial_delivery') {
      const collected = s.partialDetails?.partialCodAmount ?? s.financials.codAmount;
      return sum + (s.financials.netPayout ?? Math.max(0, collected - s.financials.shippingFee));
    }
    if ((s.status === 'refused' || s.status === 'returned') && (s.refusedDetails?.shippingFeePaid === false || s.financials.netPayout < 0)) {
      return sum - s.financials.shippingFee;
    }
    return sum;
  }, 0);

  const expectedAvailableBalance = Math.max(0, totalEarnedMerchantNetPayout - wallet.totalPaidOut);

  const handleSyncPendingCodWithCouriers = () => {
    if (onUpdateWallet) {
      onUpdateWallet({
        ...wallet,
        pendingCod: totalCouriersCashHeld,
      });
      setSettlementSuccessMsg(`تمت مزامنة مبالغ قيد التحصيل بنجاح لتصبح (${totalCouriersCashHeld.toLocaleString()} ج.م) بناءً على عهدة المناديب الفعلية الحالية.`);
      setTimeout(() => setSettlementSuccessMsg(null), 5000);
    }
  };

  const handleSyncAvailableBalance = () => {
    if (onUpdateWallet) {
      onUpdateWallet({
        ...wallet,
        availableBalance: expectedAvailableBalance,
      });
      setSettlementSuccessMsg(`تمت مزامنة الرصيد المتاح للسحب بنجاح ليصبح (${expectedAvailableBalance.toLocaleString()} ج.م) بناءً على صافي أرباح الشحنات المكتملة بعد خصم السحوبات.`);
      setTimeout(() => setSettlementSuccessMsg(null), 5000);
    }
  };

  const handleSyncAllWallet = () => {
    if (onUpdateWallet) {
      onUpdateWallet({
        ...wallet,
        pendingCod: totalCouriersCashHeld,
        availableBalance: expectedAvailableBalance,
      });
      setSettlementSuccessMsg(`تمت المزامنة الشاملة للمحفظة بنجاح (العهدة: ${totalCouriersCashHeld.toLocaleString()} ج.م | الرصيد المتاح: ${expectedAvailableBalance.toLocaleString()} ج.م).`);
      setTimeout(() => setSettlementSuccessMsg(null), 5000);
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0 || payoutAmount > wallet.availableBalance) {
      alert('الرجاء إدخال مبلغ صحيح ضمن الرصيد المتاح للسحب');
      return;
    }

    onRequestPayout(payoutAmount, payoutMethod);
    setPayoutSuccessMsg(`تم إرسال طلب السحب بنجاح بمبلغ ${payoutAmount.toLocaleString()} ج.م عبر ${payoutMethod.toUpperCase()}`);
    setTimeout(() => setPayoutSuccessMsg(''), 5000);
  };

  const handleConfirmCourierSettlement = (courierId: string, courierName: string, amount: number) => {
    if (onSettleCourierCustody) {
      onSettleCourierCustody(courierId);
    }
    setSettlementSuccessMsg(`تم استلام وتوريد العهدة النقدية بمبلغ ${amount.toLocaleString()} ج.م من ${courierName} بنجاح، وتصفير حسابه وحذف الشحنات المسواة من عهدته!`);
    setTimeout(() => setSettlementSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top View Selector Sub-Tabs */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 w-full`}>
          <button
            onClick={() => setActiveSubTab('merchant')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'merchant'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>محفظة ومستحقات التاجر</span>
          </button>

          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'returns'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-red-300" />
            <span>حساب المرتجعات (بدون شحن)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveSubTab('couriers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSubTab === 'couriers'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>حسابات وعُهد المناديب</span>
              {totalCouriersCashHeld > 0 && (
                <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {totalCouriersCashHeld.toLocaleString()} ج.م
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'merchant' ? (
        <>
          {/* Action Bar for Freedom of Control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-amber-950">التحكم الحر والمزامنة المباشرة للمحفظة</h4>
                <p className="text-[11px] font-bold text-amber-800">يمكنك تعديل مبالغ قيد التحصيل (Pending COD) والرصيد المتاح (Available Balance) يدويًا أو مزامنتها بضغطة زر واحدة</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleSyncAllWallet}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                title="مزامنة شاملة للعهدة والرصيد المتاح من واقع الشحنات الفعلية"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>مزامنة المحفظة تلقائياً ⚡</span>
              </button>
              <button
                onClick={handleOpenEditModal}
                className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>تعديل يدوي</span>
              </button>
            </div>
          </div>

          {/* Wallet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Balance Box */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group transition-all">
              <div className="absolute right-0 bottom-0 opacity-10 p-4 pointer-events-none">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">الرصيد المتاح للسحب المباشر (Available Balance):</span>
                {inlineEditingField !== 'availableBalance' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleSyncAvailableBalance}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[11px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="مزامنة الرصيد المتاح مع صافي أرباح الشحنات الفعلية المكتملة"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-950" />
                      <span>زامن ({expectedAvailableBalance.toLocaleString()} ج.م)</span>
                    </button>
                    <button
                      onClick={() => handleStartInlineEdit('availableBalance', wallet.availableBalance)}
                      className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="تعديل الرصيد المتاح"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  </div>
                )}
              </div>

              {inlineEditingField === 'availableBalance' ? (
                <div className="mt-3 space-y-2 bg-emerald-900/40 p-3 rounded-xl border border-emerald-400/30">
                  <div className="relative">
                    <input
                      type="number"
                      value={inlineValue}
                      onChange={(e) => setInlineValue(Number(e.target.value))}
                      className="w-full text-xl font-black p-2 bg-white text-emerald-950 rounded-lg focus:outline-none"
                      placeholder="0"
                      autoFocus
                    />
                    <span className="absolute left-2 top-2.5 text-xs font-black text-slate-500">ج.م</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setInlineEditingField(null)}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-md cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveInlineEdit}
                      className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black rounded-md shadow-xs cursor-pointer"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black mt-2">{wallet.availableBalance.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
                  {wallet.availableBalance !== expectedAvailableBalance ? (
                    <div className="mt-2 text-[11px] font-black text-amber-950 bg-amber-300/90 border border-amber-400 p-2 rounded-xl flex items-center justify-between gap-2">
                      <span>💡 صافي أرباح الشحنات المكتملة الآن: {expectedAvailableBalance.toLocaleString()} ج.م</span>
                      <button
                        onClick={handleSyncAvailableBalance}
                        className="underline text-emerald-950 font-black hover:text-black cursor-pointer shrink-0"
                      >
                        مزامنة الآن ⚡
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 inline shrink-0" />
                      مطابقة 100% مع صافي أرباح الشحنات المكتملة ({expectedAvailableBalance.toLocaleString()} ج.م)
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Pending COD Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs relative group transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 block">مبالغ قيد التحصيل مع المندوبين (Pending COD):</span>
                {inlineEditingField !== 'pendingCod' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleSyncPendingCodWithCouriers}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="مزامنة مبالغ قيد التحصيل مع إجمالي عهدة الكباتن الفعلية"
                    >
                      <RefreshCw className="w-3 h-3 text-white" />
                      <span>زامن ({totalCouriersCashHeld.toLocaleString()} ج.م)</span>
                    </button>
                    <button
                      onClick={() => handleQuickZeroOut('pendingCod')}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="تصفير العهدة وتحديد قيمتها كـ 0 ج.م"
                    >
                      <span>تصفير (0 ج.م)</span>
                    </button>
                    <button
                      onClick={() => handleStartInlineEdit('pendingCod', wallet.pendingCod)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                      title="تعديل مبالغ قيد التحصيل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {inlineEditingField === 'pendingCod' ? (
                <div className="mt-3 space-y-2 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div className="relative">
                    <input
                      type="number"
                      value={inlineValue}
                      onChange={(e) => setInlineValue(Number(e.target.value))}
                      className="w-full text-xl font-black p-2 bg-white text-amber-700 border border-amber-300 rounded-lg focus:outline-none"
                      placeholder="0"
                      autoFocus
                    />
                    <span className="absolute left-2 top-2.5 text-xs font-black text-amber-500">ج.م</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <button
                      onClick={() => setInlineValue(0)}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-bold rounded-md cursor-pointer"
                    >
                      جعله 0
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInlineEditingField(null)}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-md cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSaveInlineEdit}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-md shadow-xs cursor-pointer"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black text-amber-600 mt-2">{wallet.pendingCod.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
                  {wallet.pendingCod !== totalCouriersCashHeld ? (
                    <div className="mt-2 text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center justify-between gap-2">
                      <span>💡 عهدة المناديب الفعلية الآن: {totalCouriersCashHeld.toLocaleString()} ج.م</span>
                      <button
                        onClick={handleSyncPendingCodWithCouriers}
                        className="underline text-amber-950 font-black hover:text-amber-900 cursor-pointer shrink-0"
                      >
                        مزامنة الآن ⚡
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                      مزامنة مطابقة 100% مع عهدة المناديب الحالية ({totalCouriersCashHeld.toLocaleString()} ج.م)
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Total Paid Out Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs relative group transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 block">إجمالي التحويلات السابقة (Total Paid Out):</span>
                {inlineEditingField !== 'totalPaidOut' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickZeroOut('totalPaidOut')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="تصفير إجمالي التحويلات السابقة وتحديد قيمته كـ 0 ج.م"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-600" />
                      <span>تصفير (0 ج.م)</span>
                    </button>
                    <button
                      onClick={() => handleStartInlineEdit('totalPaidOut', wallet.totalPaidOut)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                      title="تعديل إجمالي التحويلات السابقة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {inlineEditingField === 'totalPaidOut' ? (
                <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="relative">
                    <input
                      type="number"
                      value={inlineValue}
                      onChange={(e) => setInlineValue(Number(e.target.value))}
                      className="w-full text-xl font-black p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none"
                      placeholder="0"
                      autoFocus
                    />
                    <span className="absolute left-2 top-2.5 text-xs font-black text-slate-400">ج.م</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <button
                      onClick={() => setInlineValue(0)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-md cursor-pointer"
                    >
                      جعله 0
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInlineEditingField(null)}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-md cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSaveInlineEdit}
                        className="px-3 py-1 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-md shadow-xs cursor-pointer"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black text-slate-900 mt-2">{wallet.totalPaidOut.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
                  <p className="text-xs text-emerald-600 font-bold mt-2">تسويات مالية ناجحة 100%</p>
                </>
              )}
            </div>
          </div>

          {/* Instant Payout Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              طلب سحب وتسوية مالية فورية (Request COD Payout)
            </h3>

            {payoutSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {payoutSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المراد سحبه (ج.م):</label>
                <input
                  type="number"
                  max={wallet.availableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-extrabold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة التحويل المفضلة:</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                >
                  <option value="instapay">InstaPay ({wallet.instaPayHandle})</option>
                  <option value="vodafone">Vodafone Cash ({wallet.vodafoneCashNumber})</option>
                  <option value="bank">حساب بنكي ({wallet.bankAccount?.bankName})</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                تأكيد طلب التحويل الفوري
              </button>
            </form>
          </div>

          {/* Delivered COD Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-extrabold text-sm text-slate-900 flex items-center justify-between">
              <span>سجل تحويلات الشحنات المسلمة (Delivered COD Ledger):</span>
              <span className="text-xs font-bold text-slate-500">{collectedShipments.length} شحنة مكتملة</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">رقم البوليصة</th>
                    <th className="p-3">المستلم</th>
                    <th className="p-3">مبلغ التحصيل (COD)</th>
                    <th className="p-3">قيمة الشحن</th>
                    <th className="p-3">مستحقات التاجر (المبلغ - الشحن)</th>
                    <th className="p-3">حالة التسوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collectedShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-black text-slate-900">{s.trackingNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{s.recipient.name}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {(s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid
                          ? `${s.refusedDetails.amountCollected || s.financials.shippingFee} ج.م (شحن)`
                          : `${s.financials.codAmount.toLocaleString()} ج.م`}
                      </td>
                      <td className="p-3 text-red-600 font-bold">
                        -{s.financials.shippingFee} ج.م
                      </td>
                      <td className="p-3 font-black text-emerald-600">{(s.financials.codAmount - s.financials.shippingFee).toLocaleString()} ج.م</td>
                      <td className="p-3">
                        {s.status === 'partial_delivery' ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
                            استلام جزئي ({s.financials.codAmount} ج.م)
                          </span>
                        ) : (s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
                            دفع الشحن ورجع ({s.refusedDetails?.amountCollected || s.financials.shippingFee} ج.م)
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
                            جاهز للسحب
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeSubTab === 'returns' ? (
        <ReturnsAccountingView shipments={shipments} systemUsers={systemUsers} />
      ) : (
        /* COURIERS COD ACCOUNTS & CASH HANDOVER SECTION */
        <div className="space-y-6">
          {settlementSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{settlementSuccessMsg}</span>
            </div>
          )}

          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-100 block">إجمالي العُهد الكاش لدى المناديب الآن:</span>
                <p className="text-3xl font-black mt-2">{totalCouriersCashHeld.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
                <p className="text-xs text-amber-100 mt-2">مبالغ كاش محصلة من العملاء وفي طريقها للخزينة</p>
              </div>
              <button
                onClick={handleSyncPendingCodWithCouriers}
                className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/30 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>مزامنة العهدة مع المحفظة المباشرة ({totalCouriersCashHeld.toLocaleString()} ج.م)</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block">عدد المناديب النشطين بالفرع:</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{effectiveCouriers.length} <span className="text-base font-bold">مناديب</span></p>
              <p className="text-xs text-slate-500 mt-2">مغطيين كافة المحافظات والمناطق</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي الشحنات المحصلة اليوم:</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">{collectedShipments.length} <span className="text-base font-bold">شحنة</span></p>
              <p className="text-xs text-emerald-600 font-bold mt-2">مكتملة مع إيصالات الاستلام</p>
            </div>
          </div>

          {/* Courier Accounts Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 font-extrabold text-sm text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                سجل حسابات وعُهد كاش الكباتن (Couriers Cash Accounts):
              </span>
              <span className="text-xs text-slate-500">محدّث لحظياً</span>
            </div>

            <div className="divide-y divide-slate-100">
              {courierFinancials.map(({ courier, deliveredCount, totalCollected, isSettled, deliveredShipments: courierDelivered }) => (
                <div key={courier.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={courier.photoUrl}
                        alt={courier.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{courier.name}</h4>
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {courier.assignedHub}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                          تليفون: <span className="font-mono text-slate-800 dir-ltr">{courier.phone}</span> • المركبة: {courier.vehicle === 'motocycle' ? 'دراجة نارية' : courier.vehicle === 'van' ? 'فان مغلقة' : 'سيارة'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-bold">العهدة المباشرة المحصلة:</span>
                        <span className="text-lg font-black text-amber-600">
                          {totalCollected.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] text-slate-400 block font-bold">({deliveredCount} شحنة تسليم)</span>
                      </div>

                      {isSettled ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>تم توريد العهدة للخزينة</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirmCourierSettlement(courier.id, courier.name, totalCollected)}
                          disabled={totalCollected <= 0}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <HandCoins className="w-4 h-4" />
                          <span>استلام العهدة توريد للخزينة</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivered Orders Details for this courier */}
                  {courierDelivered.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-700">تفاصيل شحنات العهدة للكابتن:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {courierDelivered.map((ship) => (
                          <div key={ship.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-mono font-extrabold text-red-600 block">#{ship.trackingNumber}</span>
                              <span className="text-[11px] font-bold text-slate-800">{ship.recipient.name}</span>
                            </div>
                            <span className="font-black text-emerald-600">
                              {(ship.status === 'refused' || ship.status === 'returned') && ship.refusedDetails?.shippingFeePaid
                                ? `${ship.refusedDetails.amountCollected || ship.financials.shippingFee} ج.م (شحن)`
                                : ship.status === 'partial_delivery'
                                ? `${ship.partialDetails?.partialCodAmount ?? ship.financials.codAmount} ج.م (جزئي)`
                                : `${ship.financials.codAmount} ج.م`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Freedom of Control - Edit Wallet Balances Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base">تعديل مبالغ وأرصدة المحفظة (Freedom of Control)</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWalletEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الحساب / التاجر:</label>
                <input
                  type="text"
                  value={editForm.merchantName}
                  onChange={(e) => setEditForm({ ...editForm, merchantName: e.target.value })}
                  className="w-full text-xs font-extrabold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-950">
                    مبالغ قيد التحصيل مع المندوبين (Pending COD):
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, pendingCod: 0 })}
                    className="text-[11px] font-black text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    تحديد كـ 0 (صفر)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={editForm.pendingCod}
                    onChange={(e) => setEditForm({ ...editForm, pendingCod: Number(e.target.value) })}
                    className="w-full text-lg font-black p-2.5 bg-white border border-amber-300 rounded-xl text-amber-700 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute left-3 top-3 text-xs font-black text-amber-500">ج.م</span>
                </div>
                <p className="text-[10px] font-bold text-amber-800">يمكنك كتابة أي رقم يدوياً أو جعلها صفر فور استلام العهدة أو التسوية</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-900">
                    إجمالي التحويلات السابقة (Total Paid Out):
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, totalPaidOut: 0 })}
                    className="text-[11px] font-black text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    تحديد كـ 0 (صفر)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={editForm.totalPaidOut}
                    onChange={(e) => setEditForm({ ...editForm, totalPaidOut: Number(e.target.value) })}
                    className="w-full text-lg font-black p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-slate-500"
                  />
                  <span className="absolute left-3 top-3 text-xs font-black text-slate-400">ج.م</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500">مجموع المبالغ المسحوبة والمحولة سابقاً لحسابك</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <label className="block text-xs font-black text-emerald-950">
                  الرصيد المتاح للسحب المباشر (Available Balance):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editForm.availableBalance}
                    onChange={(e) => setEditForm({ ...editForm, availableBalance: Number(e.target.value) })}
                    className="w-full text-lg font-black p-2.5 bg-white border border-emerald-300 rounded-xl text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-3 text-xs font-black text-emerald-500">ج.م</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>حفظ تعديلات الأرصدة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
