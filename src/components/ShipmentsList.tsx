import React, { useState, useMemo } from 'react';
import { Shipment, ShipmentStatus, CourierInfo, AppUserRole, UserSession } from '../types';
import { EGYPT_GOVERNORATES } from '../data/mockData';
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
  Store
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface ShipmentsListProps {
  shipments: Shipment[];
  onOpenDetailModal: (shipment: Shipment) => void;
  onOpenPrintModal: (shipment: Shipment) => void;
  onOpenCreateModal: () => void;
  onUpdateStatus: (shipmentId: string, newStatus: ShipmentStatus) => void;
  onAssignCourier?: (shipmentId: string, courier: CourierInfo) => void;
  onClearAllData?: () => void;
  onRestoreDemoData?: () => void;
  onApproveShipment?: (shipmentId: string) => void;
  onApproveAllPending?: () => void;
  currentRole?: AppUserRole;
  couriers?: CourierInfo[];
  systemUsers?: UserSession[];
}

export const ShipmentsList: React.FC<ShipmentsListProps> = ({
  shipments,
  onOpenDetailModal,
  onOpenPrintModal,
  onOpenCreateModal,
  onUpdateStatus,
  onAssignCourier,
  onClearAllData,
  onRestoreDemoData,
  onApproveShipment,
  onApproveAllPending,
  currentRole,
  couriers = [],
  systemUsers = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [whatsappShipment, setWhatsappShipment] = useState<Shipment | null>(null);

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
      // Unconfirmed shipments (pending_approval) appear ONLY for Admin
      if (currentRole !== 'admin' && s.status === 'pending_approval') {
        return false;
      }

      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        s.trackingNumber.toLowerCase().includes(searchLower) ||
        s.recipient.name.toLowerCase().includes(searchLower) ||
        s.recipient.phone.includes(searchLower) ||
        s.recipient.streetAddress.toLowerCase().includes(searchLower) ||
        (s.sender?.storeName && s.sender.storeName.toLowerCase().includes(searchLower)) ||
        (s.sender?.contactName && s.sender.contactName.toLowerCase().includes(searchLower));

      // Status
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? ['created', 'pickup_requested', 'picked_up', 'in_hub', 'out_for_delivery'].includes(s.status)
          : statusFilter === 'delivered'
          ? s.status === 'delivered'
          : statusFilter === 'partial_delivery'
          ? s.status === 'partial_delivery'
          : statusFilter === 'refused'
          ? s.status === 'refused'
          : statusFilter === 'failed'
          ? s.status === 'failed_attempt'
          : statusFilter === 'returned'
          ? s.status === 'returned'
          : s.status === statusFilter;

      // Governorate
      const matchesGov =
        governorateFilter === 'all' ? true : s.recipient.governorate.includes(governorateFilter);

      // Merchant
      const matchesMerchant =
        merchantFilter === 'all' ? true : s.sender?.storeName === merchantFilter;

      return matchesSearch && matchesStatus && matchesGov && matchesMerchant;
    });
  }, [shipments, searchTerm, statusFilter, governorateFilter, merchantFilter, currentRole]);

  // Key KPI Metrics
  const totalCount = shipments.length;
  const pendingCount = shipments.filter((s) => s.status === 'pending_approval').length;
  const deliveredCount = shipments.filter((s) => s.status === 'delivered').length;
  const partialCount = shipments.filter((s) => s.status === 'partial_delivery').length;
  const refusedCount = shipments.filter((s) => s.status === 'refused').length;
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
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-fit animate-pulse">
            <Clock className="w-3 h-3 text-amber-700" />
            بانتظار موافقة الأدمن
          </span>
        );
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200">تم التسليم</span>;
      case 'partial_delivery':
        return <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-300">استلام جزئي</span>;
      case 'out_for_delivery':
        return <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 w-fit"><Truck className="w-3 h-3 animate-pulse" /> مع المندوب</span>;
      case 'in_hub':
        return <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-200">في المستودع</span>;
      case 'picked_up':
        return <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-2.5 py-1 rounded-full border border-indigo-200">تم الاستلام</span>;
      case 'refused':
        return s.refusedDetails?.shippingFeePaid ? (
          <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-300">دفع الشحن ورجع</span>
        ) : (
          <span className="bg-red-100 text-red-800 font-bold text-xs px-2.5 py-1 rounded-full border border-red-200">لم يدفع شحن</span>
        );
      case 'failed_attempt':
        return <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-200">محاولة فاشلة</span>;
      case 'returned':
        return <span className="bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-1 rounded-full border border-purple-200">مرتجع</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full">ملغاة</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-200">جديدة</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الشحنات</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">شحنة مسجلة في النظام</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">قيد التسليم اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">طرد مع المندوبين/المستودعات</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي تحصيل COD</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{totalCodCollected.toLocaleString()} ج.م</p>
          <p className="text-[11px] text-slate-500 mt-1">مبالغ تم استلامها كاش</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة نجاح التسليم</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{successRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">معدل الإنجاز العالي</p>
        </div>
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
          <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              جميع الشحنات ({totalCount})
            </button>

            {currentRole === 'admin' && pendingCount > 0 && (
              <button
                onClick={() => setStatusFilter('pending_approval')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                  statusFilter === 'pending_approval'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200'
                }`}
              >
                ⏳ بانتظار موافقة الأدمن ({pendingCount})
              </button>
            )}

            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'active'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              قيد الشحن والتوزيع ({activeCount})
            </button>

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              تم التسليم ({deliveredCount})
            </button>

            <button
              onClick={() => setStatusFilter('partial_delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'partial_delivery'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              استلام جزئي ({partialCount})
            </button>

            <button
              onClick={() => setStatusFilter('refused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'refused'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              رفض الاستلام ({refusedCount})
            </button>

            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'failed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              محاولات فاشلة
            </button>

            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                statusFilter === 'returned'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              مرتجعات
            </button>
          </div>

          {/* Create CTA Button & Data Management */}
          <div className="w-full lg:w-auto flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إنشاء شحنة جديدة
            </button>

            {onClearAllData && shipments.length > 0 && (
              <button
                onClick={onClearAllData}
                title="مسح كافة البيانات الشحنات"
                className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                <span className="hidden sm:inline">مسح البيانات</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Governorate Filters Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="ابحث برقم البوليصة، اسم المستلم، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={governorateFilter}
              onChange={(e) => setGovernorateFilter(e.target.value)}
              className="w-full sm:w-48 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white"
            >
              <option value="all">جميع المحافظات</option>
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g.code} value={g.nameAr}>
                  {g.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Merchant Filter */}
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

          {/* Bulk Selection Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
              <span>تم تحديد {selectedIds.length} شحنات</span>
              <button
                onClick={() => {
                  const firstSelected = shipments.find((s) => s.id === selectedIds[0]);
                  if (firstSelected) onOpenPrintModal(firstSelected);
                }}
                className="text-red-700 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> طباعة البوالص
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
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
                <th className="p-3">المعايينة والنوع</th>
                <th className="p-3">حالة الشحنة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center bg-slate-50/50">
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
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelectOne(s.id)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300"
                      />
                    </td>
                    <td className="p-3 font-mono font-black text-slate-900">
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
                      {onAssignCourier && (
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
                    </td>
                    <td className="p-3">
                      <span className="font-extrabold text-red-600 block text-sm">
                        {s.financials.codAmount.toLocaleString()} ج.م
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        الصافي: {s.financials.netPayout.toLocaleString()} ج.م
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
                    <td className="p-3">{getStatusBadge(s)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.status === 'pending_approval' && onApproveShipment && (
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
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsappShipment && (
        <WhatsAppModal
          shipment={whatsappShipment}
          onClose={() => setWhatsappShipment(null)}
        />
      )}
    </div>
  );
};
