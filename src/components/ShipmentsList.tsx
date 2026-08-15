import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Shipment, ShipmentStatus, CourierInfo, AppUserRole, UserSession } from '../types';
import { EGYPT_GOVERNORATES } from '../data/mockData';
import { exportShipmentsToExcel } from '../utils/excelExport';
import { 
  Package, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  DollarSign, 
  MoreHorizontal, 
  TrendingUp, 
  FileSpreadsheet, 
  RotateCcw,
  Plus,
  Trash2,
  MessageSquare,
  Check,
  Store,
  PhoneCall,
  PhoneOff,
  Calendar,
  X
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface ShipmentsListProps {
  shipments: Shipment[];
  onOpenDetailModal: (shipment: Shipment) => void;
  onOpenPrintModal: (shipment: Shipment) => void;
  onOpenCreateModal: () => void;
  onUpdateStatus: (shipmentId: string, newStatus: ShipmentStatus) => void;
  onDeleteShipment?: (shipmentId: string) => void;
  onDeleteMultipleShipments?: (shipmentIds: string[]) => void;
  onMerchantRespondNoResponse?: (shipmentId: string, merchantNote: string) => void;
  onAssignCourier?: (shipmentId: string, courier: CourierInfo) => void;
  onClearAllData?: () => void;
  onRestoreDemoData?: () => void;
  onApproveShipment?: (shipmentId: string) => void;
  onApproveAllPending?: () => void;
  currentRole?: AppUserRole;
  couriers?: CourierInfo[];
  systemUsers?: UserSession[];
  highlightedShipmentId?: string | null;
}

export const ShipmentsList: React.FC<ShipmentsListProps> = ({
  shipments,
  onOpenDetailModal,
  onOpenPrintModal,
  onOpenCreateModal,
  onUpdateStatus,
  onDeleteShipment,
  onDeleteMultipleShipments,
  onMerchantRespondNoResponse,
  onAssignCourier,
  onClearAllData,
  onRestoreDemoData,
  onApproveShipment,
  onApproveAllPending,
  currentRole,
  couriers = [],
  systemUsers = [],
  highlightedShipmentId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active_main');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'specific'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [whatsappShipment, setWhatsappShipment] = useState<Shipment | null>(null);

  // Merchant respond to "No Response" state
  const [isMerchantRespondModalOpen, setIsMerchantRespondModalOpen] = useState(false);
  const [selectedShipmentForRespond, setSelectedShipmentForRespond] = useState<Shipment | null>(null);
  const [merchantResponseNote, setMerchantResponseNote] = useState('تواصلت مع العميل، أكد لي جاهزيته للاستلام اليوم');

  // Extract list of available merchants from shipments and system users in Admin Panel
  const availableMerchants = useMemo(() => {
    const merchants = new Map<string, string>();
    systemUsers.forEach((u) => {
      if (u.role === 'merchant' && (u.storeName || u.name)) {
        const name = u.storeName || `متجر ${u.name}`;
        merchants.set(name, name);
      }
    });
    shipments.forEach((s) => {
      if (s.sender?.storeName) {
        merchants.set(s.sender.storeName, s.sender.storeName);
      }
    });
    return Array.from(merchants.values()).sort();
  }, [shipments, systemUsers]);

  // Filtered List
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // Unconfirmed shipments (pending_approval) appear for Admin and Merchant
      if (currentRole !== 'admin' && currentRole !== 'merchant' && s.status === 'pending_approval') {
        return false;
      }

      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        s.trackingNumber.toLowerCase().includes(searchLower) ||
        s.recipient.name.toLowerCase().includes(searchLower) ||
        s.recipient.phone.includes(searchLower) ||
        s.recipient.streetAddress.toLowerCase().includes(searchLower) ||
        (s.recipient.governorate && s.recipient.governorate.toLowerCase().includes(searchLower)) ||
        (s.recipient.city && s.recipient.city.toLowerCase().includes(searchLower)) ||
        (s.sender?.storeName && s.sender.storeName.toLowerCase().includes(searchLower)) ||
        (s.sender?.contactName && s.sender.contactName.toLowerCase().includes(searchLower));

      // Status Filter
      let matchesStatus = true;
      if (statusFilter === 'active_main') {
        // Keep active, pending, delayed, no response, or failed attempt orders on Main View
        // Hide finalized delivered, partial_delivery, refused, and returned orders from Main View
        const isCompleted =
          s.status === 'delivered' ||
          s.status === 'partial_delivery' ||
          s.status === 'refused' ||
          s.status === 'returned';
        matchesStatus = !isCompleted;
      } else if (statusFilter === 'active') {
        matchesStatus = ['created', 'pickup_requested', 'picked_up', 'in_hub', 'out_for_delivery', 'pending_approval'].includes(s.status);
      } else if (statusFilter === 'delivered') {
        matchesStatus = s.status === 'delivered' || s.status === 'partial_delivery';
      } else if (statusFilter === 'paid_returns') {
        matchesStatus = (s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid === true;
      } else if (statusFilter === 'unpaid_returns') {
        matchesStatus = (s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid === false;
      } else if (statusFilter === 'refused') {
        matchesStatus = s.status === 'refused' || s.status === 'returned';
      } else if (statusFilter === 'failed') {
        matchesStatus = s.status === 'failed_attempt';
      } else if (statusFilter === 'all') {
        matchesStatus = true;
      } else {
        matchesStatus = s.status === statusFilter;
      }

      // Date Filter & Sync
      let matchesDate = true;
      if (dateFilter === 'today' || dateFilter === 'specific') {
        const targetDate = dateFilter === 'today' ? new Date().toISOString().split('T')[0] : selectedDate;
        if (targetDate) {
          const createdDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
          const updatedDate = s.updatedAt ? s.updatedAt.substring(0, 10) : '';
          const timelineHasDate = s.timeline?.some((t) => t.timestamp && t.timestamp.includes(targetDate));
          matchesDate = createdDate === targetDate || updatedDate === targetDate || Boolean(timelineHasDate);
        }
      }

      // Governorate
      const matchesGov =
        governorateFilter === 'all' ? true : s.recipient.governorate.includes(governorateFilter);

      // Merchant
      const matchesMerchant =
        merchantFilter === 'all' ? true : s.sender?.storeName === merchantFilter;

      return matchesSearch && matchesStatus && matchesDate && matchesGov && matchesMerchant;
    });
  }, [shipments, searchTerm, statusFilter, dateFilter, selectedDate, governorateFilter, merchantFilter, currentRole]);

  // Key KPI Metrics
  const totalCount = shipments.length;
  const pendingCount = shipments.filter((s) => s.status === 'pending_approval').length;
  const activeMainCount = shipments.filter((s) => !['delivered', 'partial_delivery', 'refused', 'returned'].includes(s.status)).length;
  const deliveredCount = shipments.filter((s) => s.status === 'delivered' || s.status === 'partial_delivery').length;
  const paidReturnsCount = shipments.filter((s) => (s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid === true).length;
  const unpaidReturnsCount = shipments.filter((s) => (s.status === 'refused' || s.status === 'returned') && s.refusedDetails?.shippingFeePaid === false).length;
  const activeCount = shipments.filter((s) =>
    ['created', 'pickup_requested', 'picked_up', 'in_hub', 'out_for_delivery'].includes(s.status)
  ).length;

  const totalCodCollected = shipments
    .filter((s) => s.status === 'delivered' || s.status === 'partial_delivery')
    .reduce((sum, s) => sum + s.financials.codAmount, 0);

  const successRate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShipments.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (s: Shipment) => {
    switch (s.status) {
      case 'pending_approval':
        return (
          <div className="space-y-1">
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>⏳ بانتظار موافقة الأدمن</span>
            </span>
            <span className="block text-[10px] text-amber-800 font-bold">بانتظار الاعتماد للبدء</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="space-y-1">
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>✅ تم التسليم بنجاح</span>
            </span>
            <span className="block text-[10px] text-emerald-700 font-black">
              تم تحصيل {s.financials.codAmount.toLocaleString()} ج.م
            </span>
          </div>
        );
      case 'partial_delivery': {
        const totalItems = s.packageDetails?.itemsCount || 1;
        const acceptedItems = s.partialDetails?.acceptedItemsCount || 0;
        const returnedItems = s.partialDetails?.returnedItemsCount ?? Math.max(0, totalItems - acceptedItems);
        const collectedCod = s.partialDetails?.partialCodAmount ?? s.financials.codAmount;
        const totalOrigCod = s.partialDetails?.originalCodAmount ?? s.financials.codAmount;
        const remainingCod = s.partialDetails?.remainingCodAmount ?? Math.max(0, totalOrigCod - collectedCod);
        return (
          <div className="space-y-1">
            <span className="bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>🧩 استلام جزئي</span>
            </span>
            <div className="text-[10px] bg-amber-50 border border-amber-200 rounded-md p-1 font-bold text-amber-900 space-y-0.5">
              <p>📦 تسليم {acceptedItems} قطعة ({collectedCod.toLocaleString()} ج.م)</p>
              <p className="text-rose-700">↩️ ارتجاع {returnedItems} قطعة ({remainingCod.toLocaleString()} ج.م)</p>
            </div>
          </div>
        );
      }
      case 'out_for_delivery':
        return (
          <div className="space-y-1">
            <span className="bg-teal-100 text-teal-900 border border-teal-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-teal-700 shrink-0 animate-bounce" />
              <span>🚚 مع المندوب (جاري التوصيل)</span>
            </span>
            {s.assignedCourier && (
              <span className="block text-[10px] text-teal-800 font-bold truncate max-w-[150px]">
                المندوب: {s.assignedCourier.name}
              </span>
            )}
          </div>
        );
      case 'in_hub':
        return (
          <div className="space-y-1">
            <span className="bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <Store className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>🏬 في المستودع الرئيسي</span>
            </span>
            <span className="block text-[10px] text-blue-800 font-bold">جاهزة للتخصيص للمندوب</span>
          </div>
        );
      case 'picked_up':
        return (
          <div className="space-y-1">
            <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <Package className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>📦 تم الاستلام من التاجر</span>
            </span>
            <span className="block text-[10px] text-indigo-800 font-bold">في الطريق للمستودع</span>
          </div>
        );
      case 'refused':
      case 'returned':
        if (s.refusedDetails?.partialShippingFeePaid || ((s.refusedDetails?.amountCollected || 0) > 0 && (s.refusedDetails?.amountCollected || 0) < s.financials.shippingFee)) {
          const collected = s.refusedDetails?.amountCollected || 0;
          const deducted = s.refusedDetails?.merchantDeductedAmount ?? Math.max(0, s.financials.shippingFee - collected);
          return (
            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
                <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>🚚 دفع جزء من الشحن ({collected} ج.م)</span>
              </span>
              <span className="block text-[10px] text-amber-900 font-bold">
                خصم المتبقي ({deducted} ج.م) من التاجر
              </span>
            </div>
          );
        } else if (s.refusedDetails?.shippingFeePaid === true) {
          return (
            <div className="space-y-1">
              <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>🚚 دفع الشحن ورجع (مرتجع)</span>
              </span>
              <span className="block text-[10px] text-emerald-800 font-bold">
                تحصيل كامل الشحن ({s.refusedDetails.amountCollected || s.financials.shippingFee} ج.م)
              </span>
            </div>
          );
        } else if (s.refusedDetails?.shippingFeePaid === false || s.financials.netPayout < 0) {
          return (
            <div className="space-y-1">
              <span className="bg-rose-100 text-rose-950 border border-rose-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>❌ لم يدفع شحن (خصم من التاجر)</span>
              </span>
              <span className="block text-[10px] text-rose-800 font-bold">
                خصم رسوم الشحن ({s.financials.shippingFee} ج.م)
              </span>
            </div>
          );
        }
        return (
          <div className="space-y-1">
            <span className="bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>🔄 مرتجع كامل (مستحقات 0)</span>
            </span>
          </div>
        );
      case 'failed_attempt':
        return (
          <div className="space-y-1">
            <span className="bg-orange-100 text-orange-950 border border-orange-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit shadow-2xs">
              <PhoneOff className="w-3.5 h-3.5 text-orange-700 shrink-0" />
              <span>⚠️ محاولة فاشلة / لا يرد</span>
            </span>
            <span className="block text-[10px] text-orange-900 font-bold">بانتظار إعادة التنسيق</span>
          </div>
        );
      case 'cancelled':
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
            <X className="w-3.5 h-3.5 text-slate-500" />
            <span>🚫 ملغاة</span>
          </span>
        );
      default:
        return (
          <div className="space-y-1">
            <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
              <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>📝 جديدة (قيد المعالجة)</span>
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500">إجمالي الشحنات</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 relative z-10">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 relative z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            شحنة مسجلة في النظام
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500">قيد التسليم اليوم</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 relative z-10">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 relative z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            طرد مع المندوبين/المستودعات
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500">إجمالي تحصيل COD</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 relative z-10">{totalCodCollected.toLocaleString()} ج.م</p>
          <p className="text-[11px] text-slate-500 mt-1 relative z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            مبالغ تم استلامها كاش
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-500">نسبة نجاح التسليم</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2 relative z-10">{successRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1 relative z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            معدل الإنجاز العالي
          </p>
        </motion.div>
      </div>

      {/* Pending Approval Banner - Admin Only */}
      {currentRole === 'admin' && pendingCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              ⏳
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm">
                تنبيه: يوجد {pendingCount} أوردرات جديدة أضافها التجار (يدوياً أو عبر ملفات إكسيل) بانتظار موافقة الأدمن!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                تتطلب هذه الأوردرات مراجعة وتأكيد أدمن النظام للبدء في إجراءات الشحن والتسليم المباشر.
              </p>
            </div>
          </div>

          {onApproveAllPending && (
            <button
              onClick={onApproveAllPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأكيد وموافقة الجميع ({pendingCount})
            </button>
          )}
        </div>
      )}

      {/* Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('active_main')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'active_main'
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600/30'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <span>📌 الرئيسية (الأوردرات النشطة والمؤجلة)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusFilter === 'active_main' ? 'bg-white text-red-700 font-extrabold' : 'bg-slate-200 text-slate-800'}`}>
                {activeMainCount}
              </span>
            </button>

            {currentRole === 'admin' && pendingCount > 0 && (
              <button
                onClick={() => setStatusFilter('pending_approval')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'pending_approval'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200'
                }`}
              >
                ⏳ بانتظار موافقة الأدمن ({pendingCount})
              </button>
            )}

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✅ تم التسليم ({deliveredCount})
            </button>

            <button
              onClick={() => setStatusFilter('paid_returns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'paid_returns'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🚚 دفع الشحن ورجع ({paidReturnsCount})
            </button>

            <button
              onClick={() => setStatusFilter('unpaid_returns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'unpaid_returns'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ❌ لم يدفع شحن ({unpaidReturnsCount})
            </button>

            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📞 مؤجل / لا يرد
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📂 أرشيف كافة التواريخ ({totalCount})
            </button>
          </div>

          {/* Create CTA Button & Data Management & Excel Export */}
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportShipmentsToExcel(filteredShipments, 'اوردرات_الشحن')}
              title="تصدير الأوردرات المفلترة إلى ملف إكسيل XLSX"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسيل ({filteredShipments.length})</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إنشاء شحنة جديدة
            </button>
          </div>
        </div>

        {/* Search, Date Sync & Governorate Filters Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="ابحث برقم البوليصة، المستلم، المدينة، المنطقة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Date Sync / Filter Control */}
          <div className="w-full sm:w-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <Calendar className="w-4 h-4 text-red-600 shrink-0 mr-1" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer p-1"
            >
              <option value="all">🗓️ مزامنة كافة التواريخ</option>
              <option value="today">📅 تاريخ اليوم ({new Date().toISOString().split('T')[0]})</option>
              <option value="specific">🔍 اختيار تاريخ محدد...</option>
            </select>

            {dateFilter === 'specific' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs p-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none"
              />
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={governorateFilter}
              onChange={(e) => setGovernorateFilter(e.target.value)}
              className="w-full sm:w-44 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white"
            >
              <option value="all">جميع المحافظات</option>
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g.code} value={g.nameAr}>
                  {g.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Merchant Filter (Admin Only) */}
          {currentRole === 'admin' && (
            <div className="w-full sm:w-auto flex items-center gap-2">
              <Store className="w-4 h-4 text-red-600 shrink-0" />
              <select
                value={merchantFilter}
                onChange={(e) => setMerchantFilter(e.target.value)}
                className="w-full sm:w-52 text-xs p-2 bg-red-50/60 border border-red-200 rounded-xl font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20"
              >
                <option value="all">جميع التجار والمتاجر ({availableMerchants.length})</option>
                {availableMerchants.map((merchantName) => (
                  <option key={merchantName} value={merchantName}>
                    التاجر: {merchantName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bulk Selection Actions */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
              <span>تم تحديد {selectedIds.length} شحنات</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const selectedShipments = shipments.filter((s) => selectedIds.includes(s.id));
                    exportShipmentsToExcel(selectedShipments, 'اوردرات_محددة');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  تصدير المحدد ({selectedIds.length})
                </button>
                <button
                  onClick={() => {
                    const firstSelected = shipments.find((s) => s.id === selectedIds[0]);
                    if (firstSelected) onOpenPrintModal(firstSelected);
                  }}
                  className="text-red-700 hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> طباعة البوالص
                </button>
                {onDeleteMultipleShipments && (
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت تأكد من حذف ${selectedIds.length} أوردر محدد نهائياً؟`)) {
                        onDeleteMultipleShipments(selectedIds);
                        setSelectedIds([]);
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف الأوردرات المحدد ({selectedIds.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipments List: Mobile Cards (< lg) + Desktop Table (>= lg) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {filteredShipments.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 shadow-xs">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">
                {shipments.length === 0 ? 'لا توجد شحنات مسجلة حالياً' : 'لم نجد شحنات تضاهي البحث والتصفية'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                {shipments.length === 0
                  ? 'تم مسح كافة البيانات. يمكنك الآن البدء بإضافة شحنات جديدة أو استعادة عينة تجريبية.'
                  : 'جرّب تغيير عبارات البحث، أو تصفية المحافظات والتجار لاستعراض الشحنات.'}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onOpenCreateModal}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء شحنة جديدة
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< lg) */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {filteredShipments.map((s) => {
                const isHighlighted = s.id === highlightedShipmentId;
                return (
                  <div
                    key={s.id}
                    className={`p-4 space-y-3 transition-all ${
                      isHighlighted
                        ? 'bg-amber-100/90 border-y-2 border-amber-500 ring-4 ring-amber-400/60 animate-pulse font-bold shadow-lg scale-[1.002] z-10'
                        : 'bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Header: AWB + Date + Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleSelectOne(s.id)}
                          className="w-4 h-4 text-red-600 rounded border-slate-300 shrink-0"
                        />
                        <div>
                          <span
                            onClick={() => onOpenDetailModal(s)}
                            className="font-mono font-black text-sm text-slate-900 hover:text-red-600 transition-colors block cursor-pointer"
                          >
                            #{s.trackingNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                            {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        {getStatusBadge(s)}
                      </div>
                    </div>

                    {/* Merchant & Recipient */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 font-extrabold text-slate-800 bg-red-50/60 border border-red-200/80 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[170px]">
                          <Store className="w-3 h-3 text-red-600 shrink-0" />
                          <span className="truncate">{s.sender?.storeName || 'تاجر عام'}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          {s.recipient.governorate}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{s.recipient.name}</span>
                          <span className="font-mono text-slate-600 text-[11px] dir-ltr font-bold">{s.recipient.phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{s.recipient.streetAddress}</p>
                      </div>
                    </div>

                    {/* Courier Assignment */}
                    <div className="flex items-center justify-between gap-2 text-xs bg-slate-50/50 p-2 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-700 truncate">
                          المندوب: <span className="text-slate-900 font-black">{s.assignedCourier?.name || 'غير مسند'}</span>
                        </span>
                      </div>

                      {onAssignCourier && (currentRole === 'admin' || currentRole === 'hub_manager') && (
                        <select
                          value={s.assignedCourier?.id || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const found = couriers.find((c) => c.id === val || (c.phone && c.phone === val));
                            if (found) onAssignCourier(s.id, found);
                          }}
                          className="text-[10px] p-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold max-w-[130px] shrink-0 cursor-pointer"
                        >
                          <option value="">تعيين...</option>
                          {couriers.map((c, idx) => {
                            const optVal = c.id || c.phone || `cour-opt-m-${idx}`;
                            return (
                              <option key={optVal} value={optVal}>
                                {c.name}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-red-50/60 border border-red-200/70 p-2 rounded-xl text-right">
                        <span className="text-[10px] text-red-900 font-bold block">مبلغ التحصيل (COD):</span>
                        <span className="font-black text-sm text-red-600 font-mono block mt-0.5">
                          {s.financials.codAmount.toLocaleString()} ج.م
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-right">
                        <span className="text-[10px] text-slate-500 font-bold block">صافي التاجر:</span>
                        <span className={`font-black text-sm font-mono block mt-0.5 ${s.financials.netPayout < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {s.financials.netPayout < 0 ? `${s.financials.netPayout.toLocaleString()}` : `+${s.financials.netPayout.toLocaleString()}`} ج.م
                        </span>
                      </div>
                    </div>

                    {/* Failed Attempt Warning Banner */}
                    {s.noResponseDetails?.isNoResponse && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-amber-950 text-xs font-black">
                          <span className="flex items-center gap-1">
                            <PhoneOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            تنبيه: العميل لا يرد على المندوب
                          </span>
                        </div>
                        {!s.noResponseDetails.merchantResponse && (
                          <button
                            onClick={() => {
                              setSelectedShipmentForRespond(s);
                              setMerchantResponseNote('تواصلت مع العميل، وأكد لي جاهزيته للاستلام اليوم');
                              setIsMerchantRespondModalOpen(true);
                            }}
                            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>اضغط هنا لتأكيد التواصل مع العميل</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        {s.status === 'pending_approval' && onApproveShipment && currentRole === 'admin' && (
                          <button
                            onClick={() => onApproveShipment(s.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            قبول
                          </button>
                        )}

                        <button
                          onClick={() => setWhatsappShipment(s)}
                          title="واتساب للعميل"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenPrintModal(s)}
                          title="طباعة البوليصة"
                          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenDetailModal(s)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          التفاصيل
                        </button>

                        {onDeleteShipment && (currentRole === 'admin' || s.status === 'pending_approval' || s.status === 'created') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الأوردر رقم (${s.trackingNumber}) نهائياً؟`)) {
                                onDeleteShipment(s.id);
                              }
                            }}
                            title="حذف الأوردر"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= lg) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[850px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase whitespace-nowrap">
                  <tr>
                    <th className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredShipments.length && filteredShipments.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-red-600 rounded border-slate-300"
                      />
                    </th>
                    <th className="p-3">رقم البوليصة (AWB)</th>
                    <th className="p-3 bg-red-50/50 text-red-900 border-x border-red-100">
                      <span className="flex items-center gap-1 font-black">
                        <Store className="w-3.5 h-3.5 text-red-600" />
                        التاجر (المرسل)
                      </span>
                    </th>
                    <th className="p-3">المستلم والعنوان</th>
                    <th className="p-3">المحافظة والمستودع</th>
                    <th className="p-3">المندوب المخصص</th>
                    <th className="p-3">المبلغ (COD)</th>
                    <th className="p-3">المعاينة والنوع</th>
                    <th className="p-3">حالة الشحنة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.map((s) => {
                    const isHighlighted = s.id === highlightedShipmentId;
                    return (
                      <tr
                        key={s.id}
                        className={`transition-all ${
                          isHighlighted
                            ? 'bg-amber-100/90 border-y-2 border-amber-500 ring-4 ring-amber-400/60 animate-pulse font-bold shadow-lg scale-[1.002] z-10'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelectOne(s.id)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300"
                          />
                        </td>
                        <td className="p-3 font-mono font-black text-slate-900 whitespace-nowrap">
                          <span 
                            onClick={() => onOpenDetailModal(s)}
                            className="cursor-pointer hover:text-red-600 transition-colors block text-sm"
                          >
                            {s.trackingNumber}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </td>
                        <td className="p-3 bg-red-50/20 border-x border-red-100/60">
                          <div className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 text-xs bg-white border border-red-200 px-2.5 py-1 rounded-lg shadow-2xs">
                            <Store className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>{s.sender?.storeName || 'تاجر عام'}</span>
                          </div>
                          {s.sender?.contactName && (
                            <span className="block text-[10px] text-slate-500 mt-0.5 font-bold">
                              المسؤول: {s.sender.contactName} ({s.sender.phone})
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{s.recipient.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{s.recipient.phone}</p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[200px]">{s.recipient.streetAddress}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block">{s.recipient.governorate}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">{s.assignedHub}</span>
                        </td>
                        <td className="p-3">
                          {s.assignedCourier ? (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                <Truck className="w-3 h-3" />
                              </span>
                              <span className="font-bold text-slate-800 text-xs truncate max-w-[110px]">{s.assignedCourier.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium block mb-1">غير مسند</span>
                          )}
                          {onAssignCourier && (currentRole === 'admin' || currentRole === 'hub_manager') && (
                            <select
                              value={s.assignedCourier?.id || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const found = couriers.find((c) => c.id === val || (c.phone && c.phone === val));
                                if (found) onAssignCourier(s.id, found);
                              }}
                              className="text-[10px] p-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold block w-full focus:bg-white cursor-pointer"
                            >
                              <option value="">-- تعيين مندوب --</option>
                              {couriers.map((c, idx) => {
                                const optVal = c.id || c.phone || `cour-opt-${idx}`;
                                return (
                                  <option key={optVal} value={optVal}>
                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                          {currentRole === 'merchant' && !s.assignedCourier && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium block text-center mt-1">
                              بانتظار التعيين
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-red-600 block text-sm">
                            {s.financials.codAmount.toLocaleString()} ج.م
                          </span>
                          <span className={`text-[10px] font-extrabold block ${s.financials.netPayout < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                            {s.financials.netPayout < 0 
                              ? `الصافي: خصم ${Math.abs(s.financials.netPayout).toLocaleString()} ج.م` 
                              : `الصافي: ${s.financials.netPayout.toLocaleString()} ج.م`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                            s.packageDetails.allowOpening
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {s.packageDetails.allowOpening ? 'معاينة مسموحة' : 'ممنوع الفتح'}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {s.packageDetails.weightKg} كجم ({s.packageDetails.itemsCount} قطعة)
                          </span>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(s)}
                          {s.noResponseDetails?.isNoResponse && (
                            <div className="mt-1.5">
                              {s.noResponseDetails.merchantResponse ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>تم رد التاجر للمندوب: "{s.noResponseDetails.merchantResponse.responseNote}"</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedShipmentForRespond(s);
                                    setMerchantResponseNote('تواصلت مع العميل، وأكد لي جاهزيته للاستلام اليوم');
                                    setIsMerchantRespondModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-2.5 py-1 rounded-lg shadow-xs transition-all animate-pulse cursor-pointer"
                                  title="المندوب أبلغ أن العميل لا يرد، انقر لإبلاغ المندوب بأنك تواصلت مع العميل"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>تنبيه: العميل مبيردش (اضغط للرد)</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {s.noResponseDetails?.isNoResponse && !s.noResponseDetails.merchantResponse && (
                              <button
                                onClick={() => {
                                  setSelectedShipmentForRespond(s);
                                  setMerchantResponseNote('تواصلت مع العميل، وأكد لي جاهزيته للاستلام اليوم');
                                  setIsMerchantRespondModalOpen(true);
                                }}
                                title="رد على المندوب"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>كلمته (رد)</span>
                              </button>
                            )}

                            {s.status === 'pending_approval' && onApproveShipment && currentRole === 'admin' && (
                              <button
                                onClick={() => onApproveShipment(s.id)}
                                title="تأكيد وموافقة الأوردر"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                قبول الأوردر
                              </button>
                            )}

                            <button
                              onClick={() => setWhatsappShipment(s)}
                              title="إرسال رسالة واتساب للعميل"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenPrintModal(s)}
                              title="طباعة البوليصة"
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenDetailModal(s)}
                              title="عرض التفاصيل والتاريخ"
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {onDeleteShipment && (currentRole === 'admin' || s.status === 'pending_approval' || s.status === 'created') && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنت تأكد من حذف الأوردر رقم (${s.trackingNumber}) نهائياً؟`)) {
                                    onDeleteShipment(s.id);
                                  }
                                }}
                                title="حذف الأوردر"
                                className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* WhatsApp Modal */}
      {whatsappShipment && (
        <WhatsAppModal
          shipment={whatsappShipment}
          onClose={() => setWhatsappShipment(null)}
        />
      )}

      {/* Merchant Respond to Courier Modal */}
      {isMerchantRespondModalOpen && selectedShipmentForRespond && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-800 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-red-600">
                <PhoneCall className="w-5 h-5 text-red-600" />
                رد التاجر للمندوب (إرسال إشعار للكابتن)
              </h3>
              <button
                onClick={() => setIsMerchantRespondModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <p className="font-black text-slate-900">
                بوليصة رقم: <span className="font-mono text-red-600">{selectedShipmentForRespond.trackingNumber}</span>
              </p>
              <p className="text-slate-700">
                المندوب المسند: <span className="font-bold text-slate-900">{selectedShipmentForRespond.assignedCourier?.name || 'كابتن الشحن'}</span>
              </p>
              <p className="text-amber-800 font-bold">
                تنبيه المندوب: {selectedShipmentForRespond.noResponseDetails?.courierNote || 'العميل لا يرد على الاتصال'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">اختر رد التاجر أو اكتب رسالة مخصصة للمندوب:</label>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  'تواصلت مع العميل، وأكد لي جاهزيته للاستلام اليوم',
                  'العميل طلب التأجيل إلى الغد ويرجى محاولة الاتصال به مساءً',
                  'العميل بانتظارك، يرجى إعادة الاتصال به الآن',
                  'تم تغيير رقم الهاتف / العميل متواجد بالعنوان',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMerchantResponseNote(preset)}
                    className={`p-2 rounded-lg text-right font-bold transition-all cursor-pointer ${
                      merchantResponseNote === preset
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={merchantResponseNote}
                onChange={(e) => setMerchantResponseNote(e.target.value)}
                placeholder="اكتب ردك وملاحظتك للمندوب..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMerchantRespondModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onMerchantRespondNoResponse) {
                    onMerchantRespondNoResponse(selectedShipmentForRespond.id, merchantResponseNote);
                  }
                  setIsMerchantRespondModalOpen(false);
                  setSelectedShipmentForRespond(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                إرسال الرد للمندوب فوراً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
