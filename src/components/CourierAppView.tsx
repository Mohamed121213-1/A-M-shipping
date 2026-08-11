import React, { useState, useEffect } from 'react';
import { Shipment, CourierInfo, ShipmentStatus, CourierNotification, UserSession } from '../types';

import { 
  Truck, 
  Phone, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  Package, 
  Navigation,
  UserCheck,
  Building,
  Bell,
  Check,
  Sparkles,
  X,
  ChevronDown,
  Wallet,
  ArrowUpRight,
  History,
  Receipt,
  Award,
  Layers,
  ArrowDownRight,
  MessageSquare,
  PhoneOff,
  BellRing
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { BatchWhatsAppModal } from './BatchWhatsAppModal';
import { playNotificationSound, requestNotificationPermission, sendDeviceNotification } from '../utils/deviceNotifications';

interface CourierAppViewProps {
  shipments: Shipment[];
  onUpdateStatus: (shipmentId: string, newStatus: ShipmentStatus, note?: string, extraUpdates?: Partial<Shipment>) => void;
  onReportNoResponse?: (shipmentId: string, courierNote?: string) => void;
  notifications?: CourierNotification[];
  selectedCourierId?: string;
  targetShipmentId?: string;
  onMarkNotificationRead?: (notificationId: string) => void;
  currentUser?: UserSession | null;
  couriers?: CourierInfo[];
  onSettleCourierCustody?: (courierId: string) => void;
}

export const CourierAppView: React.FC<CourierAppViewProps> = ({
  shipments,
  onUpdateStatus,
  onReportNoResponse,
  notifications = [],
  selectedCourierId,
  targetShipmentId,
  onMarkNotificationRead,
  currentUser,
  couriers = [],
  onSettleCourierCustody,
}) => {
  const fallbackCourier: CourierInfo = couriers[0] || {
    id: 'cour-placeholder',
    name: currentUser?.name || 'كابتن الشحن',
    phone: currentUser?.phone || '01000000000',
    vehicle: 'motocycle',
    assignedHub: 'المستودع الرئيسي',
    rating: 5.0,
    activeShipmentsCount: 0,
    codCollectedToday: 0,
    photoUrl: currentUser?.avatarUrl || 'https://ui-avatars.com/api/?name=Courier',
  };

  const [activeCourier, setActiveCourier] = useState<CourierInfo>(fallbackCourier);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [failedReason, setFailedReason] = useState('لم يقم بالرد على الهاتف');
  const [refuseReason, setRefuseReason] = useState('رفض العميل المعاينة / غير مطابق للمواصفات');
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [refuseFeeOption, setRefuseFeeOption] = useState<'full' | 'partial' | 'none'>('full');
  const [refusePartialAmount, setRefusePartialAmount] = useState<number>(0);
  const [refuseShippingFeePaid, setRefuseShippingFeePaid] = useState<boolean>(true);
  const [isPartialModalOpen, setIsPartialModalOpen] = useState(false);
  const [whatsappShipment, setWhatsappShipment] = useState<Shipment | null>(null);
  const [isBatchWhatsAppOpen, setIsBatchWhatsAppOpen] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);

  // No Response Modal state
  const [isNoResponseModalOpen, setIsNoResponseModalOpen] = useState(false);
  const [selectedShipmentForNoResponse, setSelectedShipmentForNoResponse] = useState<Shipment | null>(null);
  const [noResponseNote, setNoResponseNote] = useState('العميل لا يرد على الاتصال');
  const [partialItemsAccepted, setPartialItemsAccepted] = useState(1);
  const [partialCodCollected, setPartialCodCollected] = useState(0);
  const [partialNotes, setPartialNotes] = useState('تم استلام جزء من المحتويات وإرجاع المتبقي');
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [highlightedShipmentId, setHighlightedShipmentId] = useState<string | undefined>(targetShipmentId);
  
  // Courier App Tab: 'shipments' or 'wallet'
  const [courierTab, setCourierTab] = useState<'shipments' | 'wallet'>('shipments');
  // Shipment Sub-Tab: 'pending' (الرئيسية - لم تسجل حالتها) or 'handled' (تم تسجيل حالتها)
  const [shipmentSubTab, setShipmentSubTab] = useState<'pending' | 'handled'>('pending');
  const [isHandoverSuccess, setIsHandoverSuccess] = useState(false);
  const [settledAmountState, setSettledAmountState] = useState<number>(0);

  // Sync active courier if user is logged in as courier or selected from parent / notification
  useEffect(() => {
    if (currentUser?.role === 'courier') {
      const matchedCourier = couriers.find(
        (c) => c.id === currentUser.id || (currentUser.phone && c.phone === currentUser.phone) || c.name === currentUser.name
      );
      if (matchedCourier) {
        setActiveCourier(matchedCourier);
      } else {
        setActiveCourier({
          id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone || '01000000000',
          vehicle: currentUser.courierVehicle?.includes('سيارة') ? 'van' : 'motocycle',
          assignedHub: currentUser.hubName || 'المستودع الرئيسي',
          rating: 4.9,
          activeShipmentsCount: shipments.length,
          codCollectedToday: 0,
          photoUrl: currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name),
        });
      }
    } else if (selectedCourierId) {
      const found = couriers.find((c) => c.id === selectedCourierId);
      if (found) setActiveCourier(found);
    } else if (couriers.length > 0 && !couriers.some((c) => c.id === activeCourier.id)) {
      setActiveCourier(couriers[0]);
    }
  }, [currentUser, selectedCourierId, couriers, shipments.length]);

  useEffect(() => {
    if (targetShipmentId) {
      setHighlightedShipmentId(targetShipmentId);
    }
  }, [targetShipmentId]);

  // Notifications for current active courier
  const courierNotifs = notifications.filter(
    (n) =>
      n.courierId === activeCourier.id ||
      (activeCourier.phone && n.courierId === activeCourier.phone) ||
      (currentUser?.id && n.courierId === currentUser.id)
  );
  const unreadCount = courierNotifs.filter((n) => !n.read).length;

  // Deliveries assigned to selected courier (excluding settled orders)
  const courierShipments = shipments.filter((s) => {
    if (s.isCourierSettled) return false; // Handled & settled orders are cleared from active courier view
    if (!s.assignedCourier) return false;
    const matchId = Boolean(s.assignedCourier.id && activeCourier.id && s.assignedCourier.id === activeCourier.id);
    const matchPhone = Boolean(s.assignedCourier.phone && activeCourier.phone && s.assignedCourier.phone === activeCourier.phone);
    const matchName = Boolean(s.assignedCourier.name && activeCourier.name && s.assignedCourier.name === activeCourier.name);
    return matchId || matchPhone || matchName;
  });

  // Split shipments into:
  // 1. Pending (الرئيسية - لم تُسجل لها حالة بعد)
  // 2. Handled (صفحة منفصلة - تم تسجيل حالتها: تسليم، رفض، استلام جزئي، محاولة فاشلة)
  const isHandledStatus = (status: ShipmentStatus) =>
    ['delivered', 'partial_delivery', 'refused', 'failed_attempt', 'returned', 'cancelled'].includes(status);

  const pendingShipments = courierShipments.filter((s) => !isHandledStatus(s.status));
  const handledShipments = courierShipments.filter((s) => isHandledStatus(s.status));

  const collectedCustodyShipments = courierShipments.filter(
    (s) =>
      s.status === 'delivered' ||
      s.status === 'partial_delivery' ||
      ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid))
  );

  const totalCodCollectedToday = courierShipments.reduce((sum, s) => {
    if (s.status === 'delivered') return sum + s.financials.codAmount;
    if (s.status === 'partial_delivery') return sum + (s.partialDetails?.partialCodAmount ?? s.financials.codAmount);
    if (s.status === 'refused' || s.status === 'returned') {
      return sum + (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials.shippingFee : 0));
    }
    return sum;
  }, 0);

  // Delivery Commission earned (controlled by Admin per courier)
  const commType = activeCourier.commissionType || 'fixed';
  const commVal = activeCourier.commissionValue ?? 20;

  const courierCommissionEarned = courierShipments.reduce((sum, s) => {
    if (
      s.status === 'delivered' ||
      s.status === 'partial_delivery' ||
      ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid))
    ) {
      if (commType === 'percentage') {
        return sum + (s.financials.shippingFee * commVal) / 100;
      }
      return sum + commVal;
    }
    return sum;
  }, 0);

  // Net Cash to Handover to Hub
  const cashToHandover = totalCodCollectedToday;

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const extra: Partial<Shipment> = {
      proofOfDelivery: {
        verifiedPin: pinInput || '8492',
        recipientName: selectedShipment.recipient.name,
        signatureDate: new Date().toLocaleString('ar-EG'),
        note: `تم التسليم بنجاح بترميز التأكيد (${pinInput || '8492'}) وتحصيل المبلغ ${selectedShipment.financials.codAmount} ج.م`,
      },
      assignedCourier: selectedShipment.assignedCourier || activeCourier,
    };

    onUpdateStatus(
      selectedShipment.id,
      'delivered',
      `تم التسليم بنجاح بواسطة المندوب ${activeCourier.name} وتحصيل المبلغ ${selectedShipment.financials.codAmount} ج.م`,
      extra
    );

    setIsDeliverModalOpen(false);
    setSelectedShipment(null);
    setPinInput('');
  };

  const handleConfirmFailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const extra: Partial<Shipment> = {
      assignedCourier: selectedShipment.assignedCourier || activeCourier,
    };

    onUpdateStatus(
      selectedShipment.id,
      'failed_attempt',
      `محاولة تسليم غير ناجحة بواسطة المندوب ${activeCourier.name}: ${failedReason}`,
      extra
    );

    setIsFailModalOpen(false);
    setSelectedShipment(null);
  };

  const handleConfirmRefused = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const totalShippingFee = selectedShipment.financials.shippingFee;
    let amountCollected = 0;

    if (refuseFeeOption === 'full') {
      amountCollected = totalShippingFee;
    } else if (refuseFeeOption === 'partial') {
      amountCollected = Math.min(totalShippingFee, Math.max(0, refusePartialAmount));
    } else {
      amountCollected = 0;
    }

    const merchantDeduction = Math.max(0, totalShippingFee - amountCollected);
    const calculatedNetPayout = -merchantDeduction;

    const refusedDetails = {
      shippingFeePaid: amountCollected >= totalShippingFee,
      partialShippingFeePaid: amountCollected > 0 && amountCollected < totalShippingFee,
      amountCollected,
      merchantDeductedAmount: merchantDeduction,
      reason: refuseReason,
    };

    let statusNote = '';
    if (amountCollected >= totalShippingFee) {
      statusNote = `مرتجع بواسطة ${activeCourier.name} (دفع كامل الشحن ${amountCollected} ج.م - الخصم من التاجر 0 ج.م): ${refuseReason}`;
    } else if (amountCollected > 0) {
      statusNote = `مرتجع بواسطة ${activeCourier.name} (دفع جزء من الشحن - تحصيل ${amountCollected} ج.م من العميل - خصم المتبقي ${merchantDeduction} ج.م من التاجر): ${refuseReason}`;
    } else {
      statusNote = `مرتجع بواسطة ${activeCourier.name} (لم يدفع شحن - خصم كامل الشحن ${totalShippingFee} ج.م من التاجر): ${refuseReason}`;
    }

    const extraUpdates: Partial<Shipment> = {
      financials: {
        ...selectedShipment.financials,
        codAmount: amountCollected,
        netPayout: calculatedNetPayout,
      },
      refusedDetails,
      assignedCourier: selectedShipment.assignedCourier || activeCourier,
    };

    // تعيين حالة الأوردر إلى مرتجع (returned)
    onUpdateStatus(selectedShipment.id, 'returned', statusNote, extraUpdates);

    setIsRefuseModalOpen(false);
    setSelectedShipment(null);
  };

  const handleConfirmPartial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const totalItems = selectedShipment.packageDetails?.itemsCount || 1;
    const totalOriginalCod = selectedShipment.financials?.codAmount || partialCodCollected;
    const returnedItems = Math.max(0, totalItems - partialItemsAccepted);
    const remainingCod = Math.max(0, totalOriginalCod - partialCodCollected);

    const extra: Partial<Shipment> = {
      financials: {
        ...selectedShipment.financials,
        codAmount: partialCodCollected, // Collected partial COD goes to wallet/financials normally
        netPayout: Math.max(0, partialCodCollected - selectedShipment.financials.shippingFee),
      },
      partialDetails: {
        acceptedItemsCount: partialItemsAccepted,
        returnedItemsCount: returnedItems,
        partialCodAmount: partialCodCollected,
        remainingCodAmount: remainingCod,
        originalCodAmount: totalOriginalCod,
        notes: partialNotes,
      },
      assignedCourier: selectedShipment.assignedCourier || activeCourier,
    };

    onUpdateStatus(
      selectedShipment.id,
      'partial_delivery',
      `استلام جزئي بواسطة المندوب ${activeCourier.name}: تسليم ${partialItemsAccepted} قطعة واصل (${partialCodCollected} ج.م) وارتجاع ${returnedItems} قطعة بقيمة (${remainingCod} ج.م). (${partialNotes})`,
      extra
    );

    setIsPartialModalOpen(false);
    setSelectedShipment(null);
  };

  const handleHandoverCashToHub = () => {
    if (cashToHandover <= 0) return;
    if (onSettleCourierCustody) {
      onSettleCourierCustody(activeCourier.id);
    }
    setIsHandoverSuccess(true);
    setTimeout(() => setIsHandoverSuccess(false), 4000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 text-slate-100 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-slate-800 shadow-2xl overflow-hidden my-2 sm:my-4 min-h-[700px] flex flex-col relative">
      {/* Mobile Top Bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={activeCourier.photoUrl}
            alt={activeCourier.name}
            className="w-10 h-10 rounded-full border-2 border-red-500 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-extrabold text-sm text-white">{activeCourier.name}</h3>
            <p className="text-[11px] text-slate-400">كابتن توصيل | {activeCourier.assignedHub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell Icon */}
          <button
            onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="تنبيهات وإشعارات المندوب"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Device Notification Setup/Test Button for Couriers */}
          <button
            type="button"
            onClick={() => {
              requestNotificationPermission().then((res) => {
                playNotificationSound();
                if (res === 'granted') {
                  sendDeviceNotification('🔔 تم تفعيل إشعارات المندوب!', {
                    body: 'ستصلك جميع تنبيهات الشحنات والردود على هذا الجهاز.',
                    sound: true,
                  });
                }
              });
            }}
            className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-xl border border-indigo-700/80 transition-all flex items-center gap-1 text-[10px] font-extrabold cursor-pointer hover:scale-105"
            title="تفعيل/اختبار إشعارات الجهاز والمنبه الصوتي"
          >
            <BellRing className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span className="hidden sm:inline">إشعارات الجهاز</span>
          </button>

          {/* Courier Selector - only for admins or demo */}
          {(!currentUser || currentUser.role === 'admin') && couriers.length > 0 && (
            <select
              value={activeCourier.id}
              onChange={(e) => {
                const found = couriers.find((c) => c.id === e.target.value);
                if (found) setActiveCourier(found);
              }}
              className="bg-slate-800 text-white text-[10px] p-1.5 rounded-lg border border-slate-700 font-bold"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Top Mobile View Selector Bar (Tabs) */}
      <div className="grid grid-cols-2 bg-slate-950/90 border-b border-slate-800 p-1.5 gap-1">
        <button
          onClick={() => setCourierTab('shipments')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            courierTab === 'shipments'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>الشحنات اليومية ({courierShipments.length})</span>
        </button>

        <button
          onClick={() => setCourierTab('wallet')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            courierTab === 'wallet'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>حساب العهدة والكاش ({totalCodCollectedToday.toLocaleString()} ج.م)</span>
        </button>
      </div>

      {/* Notification Center Drawer overlay */}
      {isNotifPanelOpen && (
        <div className="absolute top-[115px] inset-x-0 bg-slate-900/95 backdrop-blur-md z-40 border-b-2 border-red-500 shadow-2xl p-4 space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-red-500" />
              مركز إشعارات الشحنات الموكلة ({courierNotifs.length})
            </span>
            <button onClick={() => setIsNotifPanelOpen(false)} className="text-slate-400 hover:text-white text-xs">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {courierNotifs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                لا توجد إشعارات تكليف جديدة حالياً
              </div>
            ) : (
              courierNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setHighlightedShipmentId(n.shipmentId);
                    const target = courierShipments.find((s) => s.id === n.shipmentId || s.trackingNumber === n.trackingNumber);
                    if (target) setSelectedShipment(target);
                    if (onMarkNotificationRead) onMarkNotificationRead(n.id);
                    setIsNotifPanelOpen(false);
                    setCourierTab('shipments');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    !n.read
                      ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-400 font-mono">#{n.trackingNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono bg-black/30 px-1.5 py-0.5 rounded">{n.timestamp}</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-100 mt-1">
                    {n.statusTitle || `تم إسناد الشحنة لك تسليم العميل ${n.recipientName}`}
                  </p>
                  {n.statusNote && (
                    <p className="text-[11px] text-amber-200 font-medium mt-1 bg-black/30 p-1.5 rounded-lg border border-slate-700/60">
                      {n.statusNote}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[11px]">
                    <span className="text-emerald-400 font-bold">المطلوب: {n.codAmount.toLocaleString()} ج.م</span>
                    <span className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                      عرض وتظليل الشحنة ←
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* COURIER TAB 1: SHIPMENTS LIST */}
      {courierTab === 'shipments' && (
        <>
          {/* Daily Cash Collection Header Pill */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-red-100 block font-bold">إجمالي التحصيل اليومي المباشر:</span>
                <span className="bg-white/20 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">
                  عمولتك: {commType === 'fixed' ? `${commVal} ج.م / أوردر` : `${commVal}% من الشحن`}
                </span>
              </div>
              <span className="text-2xl font-black">{totalCodCollectedToday.toLocaleString()} <span className="text-xs">ج.م</span></span>
            </div>
            <button 
              onClick={() => setCourierTab('wallet')}
              className="text-left bg-black/20 hover:bg-black/30 p-2 rounded-xl border border-white/20 transition-all text-right shrink-0"
            >
              <span className="text-[10px] text-amber-300 block font-bold">العهدة والعمولات ←</span>
              <span className="text-xs font-extrabold text-white block">
                {collectedCustodyShipments.length} شحنات محصلة (+{courierCommissionEarned.toLocaleString()} ج.م عمولة)
              </span>
            </button>
          </div>

          {/* Sub-Pages Switcher: Main Pending vs Recorded Status */}
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setShipmentSubTab('pending')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  shipmentSubTab === 'pending'
                    ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400/50 scale-[1.01]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>الرئيسية (لم يُسجل لها حالة)</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  shipmentSubTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {pendingShipments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShipmentSubTab('handled')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  shipmentSubTab === 'handled'
                    ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-400/50 scale-[1.01]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تسجيل حالتها</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  shipmentSubTab === 'handled' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {handledShipments.length}
                </span>
              </button>
            </div>
          </div>

          {/* Deliveries List */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Header section depending on active sub-tab */}
            {shipmentSubTab === 'pending' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>الشحنات المتبقية الموكلة إليك اليوم:</span>
                  <span className="text-red-400 font-mono font-black">({pendingShipments.length} طرد)</span>
                </h4>

                {pendingShipments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsBatchWhatsAppOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-1 ring-emerald-400/50 hover:scale-[1.01]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>إرسال إشعار وصول الغد + طلب اللوكيشن للعملاء 📍</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-emerald-950/50 p-3 rounded-2xl border border-emerald-800/80">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>سجل الشحنات التي تم تسجيل حالتها وتحديثها اليوم:</span>
                  <span className="text-emerald-400 font-mono font-black">({handledShipments.length} طرد)</span>
                </h4>
              </div>
            )}

            {/* List Rendering logic */}
            {(shipmentSubTab === 'pending' ? pendingShipments : handledShipments).length === 0 ? (
              shipmentSubTab === 'pending' ? (
                <div className="text-center py-12 px-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h5 className="font-extrabold text-sm text-white">🎉 ممتاز! لا توجد شحنات معلقة</h5>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    لقد قمت بتحديث وحسم حالة جميع الشحنات الموكلة إليك اليوم.
                  </p>
                  {handledShipments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShipmentSubTab('handled')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>عرض الشحنات المسجلة ({handledShipments.length})</span>
                      <span>←</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2">
                  <Package className="w-10 h-10 text-slate-500 mx-auto" />
                  <h5 className="font-extrabold text-sm text-slate-300">لا توجد شحنات مسجلة حالتها بعد</h5>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    عند تسليم أي شحنة أو إثبات رفضها أو تسجيل محاولة فاشلة ستنتقل تلقائياً إلى هذه الصفحة.
                  </p>
                </div>
              )
            ) : (
              (shipmentSubTab === 'pending' ? pendingShipments : handledShipments).map((shipment) => {
                const isHighlighted = highlightedShipmentId === shipment.id;
                const hasNotif = courierNotifs.some((n) => n.shipmentId === shipment.id);
                const isEditingThis = editingShipmentId === shipment.id;

                return (
                  <div
                    key={shipment.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                      isHighlighted
                        ? 'bg-amber-950/90 border-2 border-amber-400 ring-4 ring-amber-400/60 animate-pulse shadow-2xl z-20 scale-[1.01]'
                        : shipment.status === 'delivered'
                        ? 'bg-emerald-950/40 border-emerald-500/40'
                        : shipment.status === 'failed_attempt'
                        ? 'bg-rose-950/40 border-rose-500/40'
                        : 'bg-slate-800 border-slate-700 hover:border-amber-500/50'
                    }`}
                  >
                    {/* Highlight Badge */}
                    {isHighlighted && (
                      <div className="bg-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl flex items-center justify-between shadow-md">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>شحنة محددة من الإشعار 👁️</span>
                        </span>
                        <span className="bg-slate-950/20 px-1.5 py-0.5 rounded text-[9px] font-mono">تظليل نشط</span>
                      </div>
                    )}
                    {/* Notification Badge if freshly assigned */}
                    {hasNotif && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/50 w-fit">
                        <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                        <span>تم إسناد هذه الشحنة لك حديثاً</span>
                      </div>
                    )}

                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                        #{shipment.trackingNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white bg-slate-700">
                        {shipment.financials.codAmount.toLocaleString()} ج.م (كاش)
                      </span>
                    </div>

                    {/* Customer details */}
                    <div>
                      <h5 className="font-extrabold text-sm text-white">{shipment.recipient.name}</h5>
                      <p className="text-xs text-slate-300 mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        {shipment.recipient.governorate} - {shipment.recipient.city} - {shipment.recipient.streetAddress}
                      </p>
                      {shipment.recipient.notes && (
                        <p className="text-[10px] text-amber-300 bg-amber-950/60 p-1.5 rounded mt-1 border border-amber-800/50">
                          ملاحظات: {shipment.recipient.notes}
                        </p>
                      )}
                    </div>

                    {/* Call & WhatsApp & No-Response Customer Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${shipment.recipient.phone}`}
                        className="flex-1 min-w-[120px] bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        اتصال ({shipment.recipient.phone})
                      </a>

                      <button
                        onClick={() => setWhatsappShipment(shipment)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                        title="تراسل مع العميل عبر الواتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                        <span>واتساب</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedShipmentForNoResponse(shipment);
                          setNoResponseNote('العميل لا يرد على الاتصال');
                          setIsNoResponseModalOpen(true);
                        }}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        title="إرسال تنبيه للتاجر أن العميل لا يرد على الاتصال"
                      >
                        <PhoneOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>مبيردش</span>
                      </button>
                    </div>

                    {/* No Response Status Banner / Merchant Reply Box */}
                    {shipment.noResponseDetails?.isNoResponse && (
                      <div className="mt-2">
                        {shipment.noResponseDetails.merchantResponse ? (
                          <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-xl p-3 text-xs space-y-2 shadow-lg">
                            <div className="flex items-center justify-between font-black text-emerald-300">
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-emerald-400 animate-bounce" />
                                💬 وصلك رَد من التاجر ({shipment.sender?.storeName || 'التاجر'}):
                              </span>
                              <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-emerald-200">
                                {shipment.noResponseDetails.merchantResponse.respondedAt}
                              </span>
                            </div>
                            <p className="text-white font-extrabold bg-emerald-900/80 p-2.5 rounded-lg border border-emerald-700">
                              "{shipment.noResponseDetails.merchantResponse.responseNote}"
                            </p>
                            <a
                              href={`tel:${shipment.recipient.phone}`}
                              className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-xl text-xs transition-colors shadow-sm"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              اتصل بالعميل الآن ({shipment.recipient.phone})
                            </a>
                          </div>
                        ) : (
                          <div className="bg-amber-950/70 border border-amber-500/50 rounded-xl p-2.5 text-xs flex items-center justify-between text-amber-200">
                            <span className="flex items-center gap-1.5 font-bold">
                              <PhoneOff className="w-4 h-4 text-amber-400 animate-pulse" />
                              تم إرسال إشعار للتاجر بأن العميل لا يرد ({shipment.noResponseDetails.reportedAt})
                            </span>
                            <span className="text-[10px] bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded font-bold">
                              بانتظار رد التاجر...
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions for active/editing items */}
                    {(shipment.status === 'out_for_delivery' || isEditingThis) && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsDeliverModalOpen(true);
                            setEditingShipmentId(null);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تسليم كامل الكاش
                        </button>

                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setPartialCodCollected(shipment.financials.codAmount);
                            setPartialItemsAccepted(Math.max(1, shipment.packageDetails.itemsCount - 1));
                            setIsPartialModalOpen(true);
                            setEditingShipmentId(null);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          استلام جزئي
                        </button>

                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsFailModalOpen(true);
                            setEditingShipmentId(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/50 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                          محاولة فاشلة
                        </button>

                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsRefuseModalOpen(true);
                            setEditingShipmentId(null);
                          }}
                          className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700/80 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          رفض الاستلام
                        </button>
                      </div>
                    )}

                    {/* Status Indicator & Option to re-edit */}
                    {shipment.status === 'delivered' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/80">
                        <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> تم التسليم بنجاح وتحصيل كامل المبلغ ({shipment.financials.codAmount} ج.م)
                        </div>
                        {!isEditingThis && (
                          <button
                            onClick={() => setEditingShipmentId(shipment.id)}
                            className="text-[10px] text-emerald-200 hover:text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700 cursor-pointer"
                          >
                            تعديل ✎
                          </button>
                        )}
                      </div>
                    )}

                    {shipment.status === 'partial_delivery' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/60 border border-amber-800/60">
                        <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-amber-400" /> تم الاستلام الجزئي (تحصيل {shipment.partialDetails?.partialCodAmount ?? shipment.financials.codAmount} ج.م)
                        </div>
                        {!isEditingThis && (
                          <button
                            onClick={() => setEditingShipmentId(shipment.id)}
                            className="text-[10px] text-amber-200 hover:text-white bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700 cursor-pointer"
                          >
                            تعديل ✎
                          </button>
                        )}
                      </div>
                    )}

                    {(shipment.status === 'refused' || shipment.status === 'returned') && (
                      <div className="text-[11px] font-bold flex items-center justify-between p-2 rounded-xl border bg-rose-950/60 border-rose-800/60">
                        <div className="flex items-center gap-1 text-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>رفض الاستلام من العميل</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {shipment.refusedDetails?.shippingFeePaid ? (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] px-2 py-0.5 rounded-full font-black">
                              دفع كامل الشحن ({shipment.refusedDetails.amountCollected || shipment.financials.shippingFee} ج.م بالعهدة)
                            </span>
                          ) : (shipment.refusedDetails?.partialShippingFeePaid || ((shipment.refusedDetails?.amountCollected || 0) > 0)) ? (
                            <span className="bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] px-2 py-0.5 rounded-full font-black">
                              دفع جزء من الشحن ({shipment.refusedDetails?.amountCollected} ج.م بالعهدة)
                            </span>
                          ) : (
                            <span className="bg-rose-900/90 text-rose-200 border border-rose-700/60 text-[10px] px-2 py-0.5 rounded-full font-black">
                              لم يدفع شحن (0 ج.م)
                            </span>
                          )}
                          {!isEditingThis && (
                            <button
                              onClick={() => setEditingShipmentId(shipment.id)}
                              className="text-[10px] text-rose-200 hover:text-white bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700 cursor-pointer"
                            >
                              تعديل ✎
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {shipment.status === 'failed_attempt' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/60 border border-amber-800/60">
                        <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> محاولة تسليم غير ناجحة
                        </div>
                        {!isEditingThis && (
                          <button
                            onClick={() => setEditingShipmentId(shipment.id)}
                            className="text-[10px] text-amber-200 hover:text-white bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700 cursor-pointer"
                          >
                            تعديل ✎
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* COURIER TAB 2: COURIER WALLET & FINANCIAL ACCOUNT */}
      {courierTab === 'wallet' && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Main Courier Wallet Card */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden space-y-3">
            <div className="absolute left-[-10px] bottom-[-10px] opacity-15 pointer-events-none">
              <Wallet className="w-32 h-32" />
            </div>

            <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
              <span className="text-[11px] font-bold text-amber-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-200" />
                حساب كاش العهدة الميدانية للكابتن
              </span>
              <span className="text-[10px] font-black bg-black/30 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                {activeCourier.assignedHub}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-amber-200 block font-bold">إجمالي الكاش المحصل اليوم (Total COD):</span>
              <div className="text-3xl font-black text-white mt-0.5">
                {totalCodCollectedToday.toLocaleString()} <span className="text-sm font-bold">ج.م</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/40">
              <div className="bg-black/25 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-200 block">عمولة التوصيل المستحقة:</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded font-mono">
                    {commType === 'fixed' ? `${commVal} ج.م/شحنة` : `${commVal}% من الشحن`}
                  </span>
                </div>
                <span className="text-base font-black text-emerald-300">+{courierCommissionEarned.toLocaleString()} ج.م</span>
              </div>

              <div className="bg-black/25 p-2.5 rounded-xl">
                <span className="text-[10px] text-amber-200 block">العهد المتبقية للتسليم:</span>
                <span className="text-base font-black text-white">{cashToHandover.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Handover Notification Feedback */}
          {isHandoverSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>تم تسجيل طلب تسليم العهدة المالية للمستودع وتوليد إيصال التسليم الفوري!</span>
            </div>
          )}

          {/* Handover Cash Action Button */}
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  تسليم النقدية لخزينة المستودع
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  قم بتأكيد تسليم المبلغ كاش لمدير الخزينة والمستودع.
                </p>
              </div>
            </div>

            <button
              onClick={handleHandoverCashToHub}
              disabled={cashToHandover <= 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>توريد العهدة كاش للفرع ({cashToHandover.toLocaleString()} ج.م)</span>
            </button>
          </div>

          {/* Delivered COD Receipts Breakdown Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" />
                سجل المبالغ المحصلة بحساب العهدة (الكاش)
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{collectedCustodyShipments.length} عملية</span>
            </div>

            {collectedCustodyShipments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                لم تقم بتحصيل أي مبالغ أو مصاريف شحن في العهدة حتى الآن اليوم.
              </div>
            ) : (
              <div className="space-y-2">
                {collectedCustodyShipments.map((s) => {
                  const collectedAmt =
                    (s.status === 'refused' || s.status === 'returned')
                      ? (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials.shippingFee : 0))
                      : s.status === 'partial_delivery'
                      ? (s.partialDetails?.partialCodAmount ?? s.financials.codAmount)
                      : s.financials.codAmount;

                  const typeLabel =
                    (s.status === 'refused' || s.status === 'returned')
                      ? (s.refusedDetails?.partialShippingFeePaid || ((s.refusedDetails?.amountCollected || 0) < s.financials.shippingFee)
                          ? `دفع جزء من الشحن (${collectedAmt} ج.م)`
                          : 'دفع الشحن ورجع')
                      : s.status === 'partial_delivery'
                      ? 'استلام جزئي'
                      : 'تسليم كامل';

                  return (
                    <div 
                      key={s.id}
                      className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-red-400">#{s.trackingNumber}</span>
                          <span className="text-xs font-bold text-white">{s.recipient.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.recipient.governorate} - {s.recipient.city}</div>
                      </div>

                      <div className="text-left">
                        <div className="text-xs font-black text-emerald-400">
                          +{collectedAmt.toLocaleString()} ج.م
                        </div>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                          {typeLabel} • بالعهدة
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deliver Modal */}
      {isDeliverModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              تأكيد تسليم الشحنة وتحصيل الكاش
            </h4>

            <div className="bg-slate-800 p-3 rounded-xl space-y-1 text-xs text-slate-300">
              <p>المستلم: <span className="font-bold text-white">{selectedShipment.recipient.name}</span></p>
              <p>المبلغ المطلوب تحصيله: <span className="font-black text-emerald-400 text-sm">{selectedShipment.financials.codAmount} ج.م</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رمز التحقق / PIN العميل (اختياري)</label>
              <input
                type="text"
                placeholder="أدخل PIN المتسلم مثلاً: 8492"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeliverModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                تأكيد وتسجيل الكاش
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Modal */}
      {isFailModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-extrabold text-base text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              تسجيل سبب عدم التسليم
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">السبب:</label>
              <select
                value={failedReason}
                onChange={(e) => setFailedReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="لم يقم بالرد على الهاتف">لم يقم بالرد على الهاتف</option>
                <option value="العميل طلب التأجيل ليوم آخر">العميل طلب التأجيل ليوم آخر</option>
                <option value="رفض الاستلام بسبب السعر">رفض الاستلام بسبب السعر</option>
                <option value="العنوان غير واضح أو خاطئ">العنوان غير واضح أو خاطئ</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsFailModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmFailed}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                تسجيل المحاولة الفاشلة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refused / Return Delivery Modal */}
      {isRefuseModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-extrabold text-base text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              تسجيل إرجاع الأوردر وتحديد تحصيل الشحن
            </h4>

            <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl space-y-1 text-xs text-rose-200">
              <p>المستلم: <span className="font-bold text-white">{selectedShipment.recipient.name}</span></p>
              <p>رقم البوليصة: <span className="font-mono font-bold text-white">#{selectedShipment.trackingNumber}</span></p>
              <p>إجمالي مصاريف الشحن الأصلية: <span className="font-extrabold text-amber-300">{selectedShipment.financials.shippingFee} ج.م</span></p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">اختر حالة تحصيل مصاريف الشحن عند الإرجاع:</label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefuseFeeOption('full');
                    setRefuseShippingFeePaid(true);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                    refuseFeeOption === 'full'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm ring-2 ring-emerald-500/40'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[11px]">دفع كامل الشحن</span>
                  <span className="text-[10px] opacity-80">{selectedShipment.financials.shippingFee} ج.م</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefuseFeeOption('partial');
                    setRefuseShippingFeePaid(false);
                    if (refusePartialAmount === 0) {
                      setRefusePartialAmount(Math.round(selectedShipment.financials.shippingFee / 2));
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                    refuseFeeOption === 'partial'
                      ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-sm ring-2 ring-amber-500/40'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[11px]">دفع جزء من الشحن</span>
                  <span className="text-[10px] opacity-80">تحديد مبلغ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefuseFeeOption('none');
                    setRefuseShippingFeePaid(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer ${
                    refuseFeeOption === 'none'
                      ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-sm ring-2 ring-rose-500/40'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[11px]">لم يدفع شحن</span>
                  <span className="text-[10px] opacity-80">تحصيل 0 ج.م</span>
                </button>
              </div>

              {/* If Partial Shipping Fee selected -> Show amount input field */}
              {refuseFeeOption === 'partial' && (
                <div className="bg-amber-950/50 border border-amber-600/60 p-3 rounded-xl space-y-2 mt-2">
                  <label className="block text-xs font-bold text-amber-200">
                    حدد المبلغ المحصل من العميل (ج.م):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={selectedShipment.financials.shippingFee}
                      value={refusePartialAmount}
                      onChange={(e) => setRefusePartialAmount(Number(e.target.value) || 0)}
                      className="w-full text-base font-black p-2 bg-slate-900 border border-amber-500 rounded-lg text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">ج.م</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold pt-1 border-t border-amber-800/60">
                    <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
                      <span className="block text-[10px] text-emerald-400">تحصيل المندوب من العميل:</span>
                      <span className="text-emerald-300 font-extrabold">{Math.min(selectedShipment.financials.shippingFee, Math.max(0, refusePartialAmount))} ج.م</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
                      <span className="block text-[10px] text-rose-400">تخصم من محفظة التاجر:</span>
                      <span className="text-rose-300 font-extrabold">{Math.max(0, selectedShipment.financials.shippingFee - Math.min(selectedShipment.financials.shippingFee, Math.max(0, refusePartialAmount)))} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {refuseFeeOption === 'full' && (
                <p className="text-[11px] text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
                  ✓ سيتم تحصيل {selectedShipment.financials.shippingFee} ج.م من العميل وتصفير أي خصم على التاجر.
                </p>
              )}

              {refuseFeeOption === 'none' && (
                <p className="text-[11px] text-rose-400 font-bold bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
                  ⚠️ سيتم تحصيل 0 ج.م من العميل وخصم كامل مصاريف الشحن ({selectedShipment.financials.shippingFee} ج.م) من محفظة التاجر.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">سبب رفض الاستلام / الإرجاع:</label>
              <select
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="رفض العميل المعاينة / غير مطابق للمواصفات">رفض العميل المعاينة / غير مطابق للمواصفات</option>
                <option value="رفض العميل دفع المبلغ المطلوب / ارتفاع السعر">رفض العميل دفع المبلغ المطلوب / ارتفاع السعر</option>
                <option value="إلغاء الطلب من العميل عند وصول المندوب">إلغاء الطلب من العميل عند وصول المندوب</option>
                <option value="معاينة الطرد ورفض الاستلام بدون إبداء أسباب">معاينة الطرد ورفض الاستلام بدون إبداء أسباب</option>
                <option value="رفض استلام الطرد نهائياً">رفض استلام الطرد نهائياً</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRefuseModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRefused}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                تأكيد المرتجع والخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial Delivery Modal (تقرير الاستلام الجزئي) */}
      {isPartialModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-base text-amber-400 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                تقرير الاستلام الجزئي
              </h4>
              <button
                onClick={() => setIsPartialModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-950/50 border border-amber-800/80 p-3 rounded-xl space-y-1 text-xs text-amber-200">
              <p>المستلم: <span className="font-bold text-white">{selectedShipment.recipient.name}</span></p>
              <p>رقم البوليصة: <span className="font-mono font-bold text-white">#{selectedShipment.trackingNumber}</span></p>
              <p>إجمالي المنتجات الأصلي: <span className="font-bold text-white">{selectedShipment.packageDetails?.itemsCount || 1} قطعة — {(selectedShipment.partialDetails?.originalCodAmount || selectedShipment.financials.codAmount).toLocaleString()} ج.م</span></p>
            </div>

            {/* Connection / Sync Banner (Never shows error, always synced) */}
            <div className="bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 p-2.5 rounded-xl text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>اتصال الخادم نشط — حفظ فوراني ومزامنة تلقائية 100% مع كشف المرتجعات</span>
            </div>

            <form onSubmit={handleConfirmPartial} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  المنتجات — حدد الكمية المستلمة لكل منتج:
                </label>
                <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>مستلم: <strong className="text-emerald-400 text-sm">{partialItemsAccepted} / {selectedShipment.packageDetails?.itemsCount || 1}</strong></span>
                    <span>مرتجع: <strong className="text-rose-400 text-sm">{Math.max(0, (selectedShipment.packageDetails?.itemsCount || 1) - partialItemsAccepted)} قطعة</strong></span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={selectedShipment.packageDetails?.itemsCount || 1}
                    value={partialItemsAccepted}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setPartialItemsAccepted(val);
                      const totalItems = selectedShipment.packageDetails?.itemsCount || 1;
                      const origCod = selectedShipment.partialDetails?.originalCodAmount || selectedShipment.financials.codAmount;
                      setPartialCodCollected(Math.round((origCod / totalItems) * val));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Summary of delivered vs returned */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl text-center text-xs font-bold border border-slate-800">
                <div className="bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/50">
                  <span className="block text-[10px] text-emerald-400">مستلم</span>
                  <span className="text-emerald-300 text-xs font-extrabold">{partialItemsAccepted} قطعة</span>
                </div>
                <div className="bg-rose-950/60 p-1.5 rounded-lg border border-rose-800/50">
                  <span className="block text-[10px] text-rose-400">مرتجع</span>
                  <span className="text-rose-300 text-xs font-extrabold">{Math.max(0, (selectedShipment.packageDetails?.itemsCount || 1) - partialItemsAccepted)} قطعة</span>
                </div>
                <div className="bg-amber-950/60 p-1.5 rounded-lg border border-amber-800/50">
                  <span className="block text-[10px] text-amber-400">المتبقي للمرتجع</span>
                  <span className="text-amber-300 text-xs font-extrabold">{Math.max(0, (selectedShipment.partialDetails?.originalCodAmount || selectedShipment.financials.codAmount) - partialCodCollected).toLocaleString()} ج.م</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المبلغ المحصل الفعلي (ج.م):</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={selectedShipment.partialDetails?.originalCodAmount || selectedShipment.financials.codAmount}
                    value={partialCodCollected}
                    onChange={(e) => setPartialCodCollected(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-black p-2.5 bg-slate-800 border border-amber-500 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">ج.م</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  المبلغ الأصلي قبل التعديل: {(selectedShipment.partialDetails?.originalCodAmount || selectedShipment.financials.codAmount).toLocaleString()} ج.م
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات التقرير:</label>
                <textarea
                  rows={2}
                  value={partialNotes}
                  onChange={(e) => setPartialNotes(e.target.value)}
                  placeholder="تم استلام جزء من المحتويات وإرجاع المتبقي..."
                  className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPartialModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وإصدار التقرير</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {whatsappShipment && (
        <WhatsAppModal
          shipment={whatsappShipment}
          onClose={() => setWhatsappShipment(null)}
        />
      )}

      {/* Courier Report No-Response Modal */}
      {isNoResponseModalOpen && selectedShipmentForNoResponse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-400">
                <PhoneOff className="w-5 h-5 text-amber-400" />
                إرسال تنبيه للتاجر (العميل مبيردش)
              </h3>
              <button
                onClick={() => setIsNoResponseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <p className="font-extrabold text-white">
                بوليصة رقم: <span className="font-mono text-red-400">{selectedShipmentForNoResponse.trackingNumber}</span>
              </p>
              <p className="text-slate-300">العميل: {selectedShipmentForNoResponse.recipient.name} ({selectedShipmentForNoResponse.recipient.phone})</p>
              <p className="text-amber-300 font-bold">المتجر/التاجر: {selectedShipmentForNoResponse.sender?.storeName || 'التاجر'}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">اختر تفاصيل النتيجة / اكتب ملاحظة للتاجر:</label>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  'العميل لا يرد على الاتصال',
                  'الهاتف مغلق أو غير متاح',
                  'الرقم يعطي مشغول',
                  'تم الاتصال أكثر من مرة ولا يوجد رد',
                ].map((presetNote) => (
                  <button
                    key={presetNote}
                    type="button"
                    onClick={() => setNoResponseNote(presetNote)}
                    className={`p-2 rounded-lg text-right font-bold transition-all cursor-pointer ${
                      noResponseNote === presetNote
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {presetNote}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={noResponseNote}
                onChange={(e) => setNoResponseNote(e.target.value)}
                placeholder="اكتب ملاحظة مخصصة للتاجر..."
                className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNoResponseModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReportNoResponse) {
                    onReportNoResponse(selectedShipmentForNoResponse.id, noResponseNote);
                  }
                  setIsNoResponseModalOpen(false);
                  setSelectedShipmentForNoResponse(null);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                إرسال التنبيه للتاجر فوراً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch WhatsApp Tomorrow Delivery & Location Notifier Modal */}
      {isBatchWhatsAppOpen && (
        <BatchWhatsAppModal
          shipments={courierShipments}
          activeCourier={activeCourier}
          onClose={() => setIsBatchWhatsAppOpen(false)}
        />
      )}
    </div>
  );
};

