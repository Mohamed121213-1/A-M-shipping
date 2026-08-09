import React, { useState } from 'react';
import { Shipment, ShipmentStatus, CourierInfo } from '../types';
import { X, CheckCircle2, Clock, MapPin, Truck, AlertTriangle, ShieldCheck, Sparkles, Printer, User, Phone, Package, DollarSign, ArrowRight, KeyRound, MessageSquare, Trash2 } from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface ShipmentDetailModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onUpdateStatus: (shipmentId: string, newStatus: ShipmentStatus, note?: string, extraUpdates?: Partial<Shipment>) => void;
  onDeleteShipment?: (shipmentId: string) => void;
  onAssignCourier: (shipmentId: string, courier: CourierInfo) => void;
  onOpenPrintModal: (shipment: Shipment) => void;
  couriers?: CourierInfo[];
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  onClose,
  onUpdateStatus,
  onDeleteShipment,
  onAssignCourier,
  onOpenPrintModal,
  couriers = [],
}) => {
  if (!shipment) return null;

  const [statusNote, setStatusNote] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState(shipment.assignedCourier?.id || '');
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus>(shipment.status);
  const [refusePaidOption, setRefusePaidOption] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [refusePartialShippingAmount, setRefusePartialShippingAmount] = useState<number>(
    shipment.refusedDetails?.amountCollected || Math.round(shipment.financials.shippingFee / 2)
  );
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Partial Delivery inputs
  const [partialAcceptedCount, setPartialAcceptedCount] = useState<number>(
    shipment.partialDetails?.acceptedItemsCount || 1
  );
  const [partialCodCollected, setPartialCodCollected] = useState<number>(
    shipment.partialDetails?.partialCodAmount || Math.round(shipment.financials.codAmount / 2)
  );

  // AI Risk Check state
  const [isAiRiskChecking, setIsAiRiskChecking] = useState(false);
  const [aiRiskResult, setAiRiskResult] = useState<{ riskScore?: number; riskLevel?: string; recommendations?: string[] } | null>(null);

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let extraUpdates: Partial<Shipment> = {};
    
    if (selectedStatus === 'returned' || selectedStatus === 'refused') {
      let amountCollected = 0;
      if (refusePaidOption === 'paid') {
        amountCollected = shipment.financials.shippingFee;
      } else if (refusePaidOption === 'partial') {
        amountCollected = Math.min(shipment.financials.shippingFee, Math.max(0, refusePartialShippingAmount));
      } else {
        amountCollected = 0;
      }

      const merchantDeduction = Math.max(0, shipment.financials.shippingFee - amountCollected);
      const netPayout = -merchantDeduction;

      extraUpdates = {
        financials: {
          ...shipment.financials,
          codAmount: amountCollected,
          netPayout,
        },
        refusedDetails: {
          shippingFeePaid: amountCollected >= shipment.financials.shippingFee,
          partialShippingFeePaid: amountCollected > 0 && amountCollected < shipment.financials.shippingFee,
          amountCollected,
          merchantDeductedAmount: merchantDeduction,
          reason: statusNote || (amountCollected >= shipment.financials.shippingFee ? 'دفع كامل الشحن ورجع' : (amountCollected > 0 ? `دفع جزء من الشحن (${amountCollected} ج.م)` : 'لم يدفع شحن')),
        },
      };
    } else if (selectedStatus === 'partial_delivery') {
      const totalItems = shipment.packageDetails?.itemsCount || 1;
      const totalOriginalCod = shipment.partialDetails?.originalCodAmount || shipment.financials.codAmount;
      const accepted = Math.min(totalItems, Math.max(1, partialAcceptedCount));
      const returnedItems = Math.max(0, totalItems - accepted);
      const collectedAmt = Math.min(totalOriginalCod, Math.max(0, partialCodCollected));
      const remainingCod = Math.max(0, totalOriginalCod - collectedAmt);

      extraUpdates = {
        financials: {
          ...shipment.financials,
          codAmount: collectedAmt,
          netPayout: Math.max(0, collectedAmt - shipment.financials.shippingFee),
        },
        partialDetails: {
          acceptedItemsCount: accepted,
          returnedItemsCount: returnedItems,
          partialCodAmount: collectedAmt,
          remainingCodAmount: remainingCod,
          originalCodAmount: totalOriginalCod,
          notes: statusNote || 'استلام جزئي من العميل وترحيل المتبقي للمرتجع',
        },
      };
    }

    onUpdateStatus(shipment.id, selectedStatus, statusNote, extraUpdates);
    setStatusNote('');
  };

  const handleCourierAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courierId = e.target.value;
    setSelectedCourierId(courierId);
    if (!courierId) return;
    const found = couriers.find((c) => c.id === courierId || (c.phone && c.phone === courierId));
    if (found) {
      onAssignCourier(shipment.id, found);
    }
  };

  const runAiRiskCheck = async () => {
    setIsAiRiskChecking(true);
    try {
      const res = await fetch('/api/ai-risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipment }),
      });
      const data = await res.json();
      setAiRiskResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiRiskChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-mono font-black text-white text-sm">
              AWB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-extrabold text-lg text-white">{shipment.trackingNumber}</h3>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px] px-2 py-0.5 rounded">
                  {shipment.deliveryType === 'express' ? '⚡ شحن سريع' : '📦 شحن عادي'}
                </span>
              </div>
              <p className="text-xs text-slate-400">تاريخ الإنشاء: {new Date(shipment.createdAt).toLocaleString('ar-EG')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              واتساب للعميل
            </button>
            <button
              onClick={() => onOpenPrintModal(shipment)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-4 h-4 text-red-400" />
              طباعة البوليصة
            </button>
            {onDeleteShipment && (
              <button
                onClick={() => {
                  if (window.confirm(`هل أنت تأكد من حذف هذا الأوردر (${shipment.trackingNumber}) نهائياً؟`)) {
                    onDeleteShipment(shipment.id);
                    onClose();
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-white" />
                حذف الأوردر
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-900">
          {/* Pending Approval Action Banner */}
          {shipment.status === 'pending_approval' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  ⏳
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm">
                    هذا الأوردر تم إضافته بواسطة التاجر وهو بانتظار موافقة الأدمن!
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    قم بمراجعة العنوان والمبلغ التفصيلي ثم انقر على تأكيد اعتماد الأوردر للبدء في إجراءات الشحن والتسليم.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onUpdateStatus(shipment.id, 'created', 'تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام');
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                تأكيد وموافقة الأوردر
              </button>
            </div>
          )}

          {/* Timeline Status Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>مسار وحالة الشحنة الحالية (Shipment Timeline):</span>
              <span className="font-mono font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {shipment.status === 'delivered' ? '✅ تم التسليم' : shipment.status === 'out_for_delivery' ? '🚚 مع المندوب للتسليم' : shipment.status === 'in_hub' ? '🏬 في المستودع' : shipment.status === 'picked_up' ? '📦 تم الاستلام' : '📝 تم إنشاء البوليصة'}
              </span>
            </h4>

            {/* Stepper Display */}
            <div className="relative border-r-2 border-slate-300 mr-4 pr-6 space-y-6">
              {shipment.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div className="absolute -right-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{event.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    {event.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient & Package Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recipient Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h5 className="font-bold text-xs text-slate-500 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-red-600" />
                بيانات المستلم والعنوان
              </h5>
              <p className="font-extrabold text-sm text-slate-900">{shipment.recipient.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs font-mono font-bold text-slate-700" dir="ltr">{shipment.recipient.phone}</p>
                <button
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>تراسل عبر الواتساب</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                📍 {shipment.recipient.governorate} - {shipment.recipient.city} - {shipment.recipient.streetAddress}
              </p>
              {shipment.recipient.notes && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  ملاحظات: {shipment.recipient.notes}
                </div>
              )}
            </div>

            {/* Financials & Courier Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
              <h5 className="font-bold text-xs text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                الماليات والمندوب المخصص
              </h5>

              <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">المبلغ المحصل (COD):</span>
                  <span className="text-sm font-extrabold text-slate-900">{shipment.financials.codAmount.toLocaleString()} ج.م</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">مستحقات التاجر (المبلغ المحصل - الشحن):</span>
                  <span className="text-sm font-extrabold text-emerald-600">{(shipment.financials.codAmount - shipment.financials.shippingFee).toLocaleString()} ج.م</span>
                </div>
              </div>

              {shipment.partialDetails && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
                  <p className="font-extrabold flex items-center gap-1">📦 تفاصيل الاستلام الجزئي:</p>
                  <p>القطع المستلمة: <span className="font-bold">{shipment.partialDetails.acceptedItemsCount}</span> من <span className="font-bold">{shipment.packageDetails.itemsCount}</span></p>
                  <p>المبلغ المحصل: <span className="font-bold text-emerald-700">{shipment.partialDetails.partialCodAmount} ج.م</span></p>
                  {shipment.partialDetails.notes && <p className="text-[11px] text-slate-600">ملاحظات: {shipment.partialDetails.notes}</p>}
                </div>
              )}

              {shipment.refusedDetails && (
                <div className={`border rounded-lg p-2.5 text-xs space-y-1.5 ${
                  shipment.refusedDetails.shippingFeePaid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : shipment.refusedDetails.partialShippingFeePaid || ((shipment.refusedDetails.amountCollected || 0) > 0)
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <p className="font-extrabold flex items-center justify-between">
                    <span>🚫 تفاصيل رفض الاستلام / الإرجاع:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      shipment.refusedDetails.shippingFeePaid
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : shipment.refusedDetails.partialShippingFeePaid || ((shipment.refusedDetails.amountCollected || 0) > 0)
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {shipment.refusedDetails.shippingFeePaid
                        ? 'دفع كامل الشحن ورجع'
                        : (shipment.refusedDetails.partialShippingFeePaid || ((shipment.refusedDetails.amountCollected || 0) > 0))
                        ? `دفع جزء من الشحن (${shipment.refusedDetails.amountCollected} ج.م)`
                        : 'لم يدفع شحن'}
                    </span>
                  </p>
                  <p>المبلغ المحصل من العميل (عهدة المندوب): <span className="font-bold">{shipment.refusedDetails.amountCollected} ج.م</span></p>
                  <p>خصم مصاريف الشحن المقتطعة من التاجر: <span className="font-bold text-rose-700">{shipment.refusedDetails.merchantDeductedAmount ?? Math.max(0, shipment.financials.shippingFee - shipment.refusedDetails.amountCollected)} ج.م</span></p>
                  {shipment.refusedDetails.reason && <p className="text-[11px] opacity-80">السبب: {shipment.refusedDetails.reason}</p>}
                </div>
              )}

              {/* Courier Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">تعيين المندوب المسؤول:</label>
                <select
                  value={selectedCourierId}
                  onChange={handleCourierAssign}
                  className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white"
                >
                  <option value="">-- اختر المندوب --</option>
                  {couriers.map((c, idx) => {
                    const optValue = c.id || c.phone || `cour-opt-${idx}`;
                    return (
                      <option key={optValue} value={optValue}>
                        {c.name} ({c.assignedHub || 'المستودع الرئيسي'})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* AI Risk Check Trigger Box */}
          <div className="border border-purple-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                تحليل مخاطر التسليم بالذكاء الاصطناعي (AI Risk Check)
              </span>
              <button
                type="button"
                onClick={runAiRiskCheck}
                disabled={isAiRiskChecking}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                {isAiRiskChecking ? 'جاري التحليل...' : 'فحص الشحنة'}
              </button>
            </div>

            {aiRiskResult && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">مستوى المخاطرة التقديري:</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${
                    (aiRiskResult.riskScore || 0) > 40 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {aiRiskResult.riskLevel} ({aiRiskResult.riskScore}%)
                  </span>
                </div>
                {aiRiskResult.recommendations && (
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {aiRiskResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Fast Status Updater Control */}
          <form onSubmit={handleStatusChangeSubmit} className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-400" />
              تحديث حالة الشحنة فوراً
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ShipmentStatus)}
                  className="w-full text-xs p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                >
                  <option value="pending_approval">⏳ بانتظار موافقة الأدمن</option>
                  <option value="created">تم مؤكدة / معتمدة</option>
                  <option value="pickup_requested">طلب استلام من التاجر</option>
                  <option value="picked_up">تم الاستلام من التاجر</option>
                  <option value="in_hub">في المستودع الرئيسي</option>
                  <option value="out_for_delivery">خرجت للتسليم مع المندوب</option>
                  <option value="delivered">تم التسليم للعميل وتحصيل المبلغ</option>
                  <option value="partial_delivery">استلام جزئي من العميل</option>
                  <option value="returned">🔄 مرتجع للتاجر</option>
                  <option value="refused">🚫 رفض الاستلام من العميل</option>
                  <option value="failed_attempt">⚠️ محاولة تسليم فاشلة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>

              {(selectedStatus === 'returned' || selectedStatus === 'refused') ? (
                <div className="col-span-2 space-y-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        خيار تحصيل مصاريف الشحن:
                      </label>
                      <select
                        value={refusePaidOption}
                        onChange={(e) => setRefusePaidOption(e.target.value as 'paid' | 'partial' | 'unpaid')}
                        className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-200 font-extrabold"
                      >
                        <option value="paid">دفع كامل الشحن ({shipment.financials.shippingFee} ج.م)</option>
                        <option value="partial">دفع جزء من الشحن (تحديد المبلغ)</option>
                        <option value="unpaid">لم يدفع شحن (خصم {shipment.financials.shippingFee} ج.م من التاجر)</option>
                      </select>
                    </div>

                    {refusePaidOption === 'partial' && (
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">
                          المبلغ المحصل من العميل (ج.م):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={shipment.financials.shippingFee}
                          value={refusePartialShippingAmount}
                          onChange={(e) => setRefusePartialShippingAmount(Number(e.target.value) || 0)}
                          className="w-full text-xs p-2 bg-slate-900 border border-amber-500 rounded-lg text-emerald-400 font-extrabold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-amber-200 flex flex-wrap items-center justify-between pt-1 border-t border-slate-700">
                    {refusePaidOption === 'paid' && <span>المحصل: {shipment.financials.shippingFee} ج.م | خصم التاجر: 0 ج.م</span>}
                    {refusePaidOption === 'partial' && (
                      <span>
                        المحصل: {Math.min(shipment.financials.shippingFee, Math.max(0, refusePartialShippingAmount))} ج.م |
                        خصم التاجر: {Math.max(0, shipment.financials.shippingFee - Math.min(shipment.financials.shippingFee, Math.max(0, refusePartialShippingAmount)))} ج.م
                      </span>
                    )}
                    {refusePaidOption === 'unpaid' && <span>المحصل: 0 ج.م | خصم التاجر: {shipment.financials.shippingFee} ج.م (كامل الشحن)</span>}
                  </div>
                </div>
              ) : selectedStatus === 'partial_delivery' ? (
                <div className="col-span-2 space-y-2 bg-amber-950/80 border border-amber-700/80 p-3 rounded-xl text-amber-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-200 mb-1">
                        عدد القطع المقبولة/المستلمة (من أصل {shipment.packageDetails?.itemsCount || 1}):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={shipment.packageDetails?.itemsCount || 1}
                        value={partialAcceptedCount}
                        onChange={(e) => setPartialAcceptedCount(Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-900 border border-amber-600 rounded-lg text-white font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-200 mb-1">
                        المبلغ المحصل للقطع المقبولة (ج.م):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={shipment.partialDetails?.originalCodAmount || shipment.financials.codAmount}
                        value={partialCodCollected}
                        onChange={(e) => setPartialCodCollected(Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-900 border border-amber-600 rounded-lg text-emerald-400 font-extrabold"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-amber-200 flex flex-wrap items-center justify-between pt-1 border-t border-amber-800/80">
                    <span>
                      ↩️ القطع المرتجعة: <strong className="text-white">{Math.max(0, (shipment.packageDetails?.itemsCount || 1) - partialAcceptedCount)} قطعة</strong>
                    </span>
                    <span>
                      💰 باقي المبلغ المترحل للمرتجع: <strong className="text-white">{Math.max(0, (shipment.partialDetails?.originalCodAmount || shipment.financials.codAmount) - partialCodCollected).toLocaleString()} ج.م</strong>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="سبب/ملاحظات الارتجاع الجزئي..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="ملاحظات الحالة (مثال: تم الاتصال والعميل غير متاح)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs p-2 rounded-lg transition-colors cursor-pointer"
                >
                  حفظ التحديث
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && (
        <WhatsAppModal
          shipment={shipment}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}
    </div>
  );
};
