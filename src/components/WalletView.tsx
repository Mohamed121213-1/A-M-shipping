import React, { useState } from 'react';
import { MerchantWallet, Shipment } from '../types';
import { BOSTA_COURIERS } from '../data/mockData';
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
  HandCoins
} from 'lucide-react';

interface WalletViewProps {
  wallet: MerchantWallet;
  shipments: Shipment[];
  onRequestPayout: (amount: number, method: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet, shipments, onRequestPayout }) => {
  const [activeSubTab, setActiveSubTab] = useState<'merchant' | 'couriers'>('merchant');
  const [payoutAmount, setPayoutAmount] = useState<number>(wallet.availableBalance);
  const [payoutMethod, setPayoutMethod] = useState<'instapay' | 'vodafone' | 'bank'>('instapay');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  // Track courier cash settlement state locally
  const [settledCourierIds, setSettledCourierIds] = useState<string[]>([]);
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  const collectedShipments = shipments.filter(
    (s) => s.status === 'delivered' || s.status === 'partial_delivery' || (s.status === 'refused' && s.refusedDetails?.shippingFeePaid)
  );

  // Compute COD collected per courier dynamically
  const courierFinancials = BOSTA_COURIERS.map((courier) => {
    const courierCollected = collectedShipments.filter(
      (s) => s.assignedCourier?.id === courier.id || (!s.assignedCourier && courier.id === 'c1')
    );
    const totalCollected = courierCollected.reduce((sum, s) => {
      if (s.status === 'refused' && s.refusedDetails?.shippingFeePaid) {
        return sum + (s.refusedDetails.amountCollected || s.financials.shippingFee);
      }
      return sum + s.financials.codAmount;
    }, 0);
    const isSettled = settledCourierIds.includes(courier.id);

    return {
      courier,
      deliveredCount: courierCollected.length,
      totalCollected,
      isSettled,
      deliveredShipments: courierCollected
    };
  });

  const totalCouriersCashHeld = courierFinancials
    .filter((cf) => !cf.isSettled)
    .reduce((sum, cf) => sum + cf.totalCollected, 0);

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
    setSettledCourierIds((prev) => [...prev, courierId]);
    setSettlementSuccessMsg(`تم استلام وتوريد العهدة النقدية بمبلغ ${amount.toLocaleString()} ج.م من ${courierName} بنجاح!`);
    setTimeout(() => setSettlementSuccessMsg(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top View Selector Sub-Tabs */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('merchant')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'merchant'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>محفظة ومستحقات التاجر</span>
          </button>

          <button
            onClick={() => setActiveSubTab('couriers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'couriers'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>حسابات وعُهد المناديب والتحصيلات</span>
            {totalCouriersCashHeld > 0 && (
              <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {totalCouriersCashHeld.toLocaleString()} ج.م
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'merchant' ? (
        <>
          {/* Wallet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Balance Box */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 p-4">
                <Wallet className="w-32 h-32" />
              </div>
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">الرصيد المتاح للسحب المباشر (Available Balance):</span>
              <p className="text-3xl font-black mt-2">{wallet.availableBalance.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
              <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> جاهز للتحويل الفوري لمقرك أو حسابك
              </p>
            </div>

            {/* Pending COD Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block">مبالغ قيد التحصيل مع المندوبين (Pending COD):</span>
              <p className="text-3xl font-black text-amber-600 mt-2">{wallet.pendingCod.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
              <p className="text-xs text-slate-500 mt-2">تتحول للرصيد المتاح فور تسليم الشحنة للعميل</p>
            </div>

            {/* Total Paid Out Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي التحويلات السابقة (Total Paid Out):</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{wallet.totalPaidOut.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
              <p className="text-xs text-emerald-600 font-bold mt-2">تسويات مالية ناجحة 100%</p>
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
                    <th className="p-3">رسوم الشحن والتحصيل</th>
                    <th className="p-3">الصافي للتاجر</th>
                    <th className="p-3">حالة التسوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collectedShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-black text-slate-900">{s.trackingNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{s.recipient.name}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {s.status === 'refused' && s.refusedDetails?.shippingFeePaid
                          ? `${s.refusedDetails.amountCollected || s.financials.shippingFee} ج.م (شحن)`
                          : `${s.financials.codAmount.toLocaleString()} ج.م`}
                      </td>
                      <td className="p-3 text-red-600 font-bold">
                        -{s.financials.shippingFee + s.financials.codFee} ج.م
                      </td>
                      <td className="p-3 font-black text-emerald-600">{s.financials.netPayout.toLocaleString()} ج.م</td>
                      <td className="p-3">
                        {s.status === 'partial_delivery' ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
                            استلام جزئي ({s.financials.codAmount} ج.م)
                          </span>
                        ) : s.status === 'refused' ? (
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
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <span className="text-xs font-bold text-amber-100 block">إجمالي العُهد الكاش لدى المناديب الآن:</span>
              <p className="text-3xl font-black mt-2">{totalCouriersCashHeld.toLocaleString()} <span className="text-base font-bold">ج.م</span></p>
              <p className="text-xs text-amber-100 mt-2">مبالغ كاش محصلة من العملاء وفي طريقها للخزينة</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block">عدد المناديب النشطين بالفرع:</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{BOSTA_COURIERS.length} <span className="text-base font-bold">مناديب</span></p>
              <p className="text-xs text-slate-500 mt-2">مغطيين القاهرة الكبرى والجيزة</p>
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
                            <span className="font-black text-emerald-600">{ship.financials.codAmount} ج.م</span>
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
    </div>
  );
};
