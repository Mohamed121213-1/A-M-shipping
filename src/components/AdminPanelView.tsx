import React, { useState } from 'react';
import { exportShipmentsToExcel } from '../utils/excelExport';
import { 
  Users, 
  Truck, 
  Building2, 
  MapPin, 
  Wallet, 
  Trash2, 
  Plus, 
  Edit3, 
  Shield, 
  Check, 
  X, 
  Search, 
  DollarSign, 
  Package, 
  Settings,
  ShieldCheck,
  Store,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { 
  UserSession, 
  AppUserRole, 
  CourierInfo, 
  HubInfo, 
  GovernorateRate, 
  MerchantWallet, 
  Shipment 
} from '../types';

interface AdminPanelViewProps {
  users: UserSession[];
  onAddUser: (newUser: Omit<UserSession, 'id'>) => void;
  onUpdateUser: (updatedUser: UserSession) => void;
  onDeleteUser: (userId: string) => void;

  couriers: CourierInfo[];
  onAddCourier: (newCourier: Omit<CourierInfo, 'id'>) => void;
  onUpdateCourier: (updatedCourier: CourierInfo) => void;
  onDeleteCourier: (courierId: string) => void;

  hubs: HubInfo[];
  onAddHub: (newHub: Omit<HubInfo, 'id'>) => void;
  onUpdateHub: (updatedHub: HubInfo) => void;
  onDeleteHub: (hubId: string) => void;

  governorates: GovernorateRate[];
  onUpdateGovernorateRate: (updatedGov: GovernorateRate) => void;

  wallet: MerchantWallet;
  onUpdateWallet: (updatedWallet: MerchantWallet) => void;

  shipments: Shipment[];
  onClearAllShipments: () => void;
  onClearAllData: () => void;
  onApproveShipment?: (shipmentId: string) => void;
  onApproveAllPending?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  couriers,
  onAddCourier,
  onUpdateCourier,
  onDeleteCourier,
  hubs,
  onAddHub,
  onUpdateHub,
  onDeleteHub,
  governorates,
  onUpdateGovernorateRate,
  wallet,
  onUpdateWallet,
  shipments,
  onClearAllShipments,
  onClearAllData,
  onApproveShipment,
  onApproveAllPending,
}) => {
  const pendingShipments = shipments.filter((s) => s.status === 'pending_approval');
  const [activeTab, setActiveTab] = useState<'approval' | 'users' | 'couriers' | 'hubs' | 'rates' | 'wallet' | 'danger'>(
    pendingShipments.length > 0 ? 'approval' : 'users'
  );

  // Search & Role filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'merchant' | 'courier' | 'hub_manager' | 'admin'>('all');
  const [courierSearch, setCourierSearch] = useState('');
  const [rateSearch, setRateSearch] = useState('');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);
  const [userFormData, setUserFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: AppUserRole;
    storeName?: string;
    hubName?: string;
    courierVehicle?: string;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'merchant',
    storeName: '',
    hubName: '',
    courierVehicle: '',
  });

  // Courier Modal State
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierInfo | null>(null);
  const [courierFormData, setCourierFormData] = useState<{
    name: string;
    phone: string;
    vehicle: 'motocycle' | 'van' | 'car';
    assignedHub: string;
    rating: number;
    commissionType: 'fixed' | 'percentage';
    commissionValue: number;
  }>({
    name: '',
    phone: '',
    vehicle: 'motocycle',
    assignedHub: hubs[0]?.name || 'المستودع الرئيسي',
    rating: 5.0,
    commissionType: 'fixed',
    commissionValue: 20,
  });

  // Hub Modal State
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<HubInfo | null>(null);
  const [hubFormData, setHubFormData] = useState({
    name: '',
    governorate: 'القاهرة',
    address: '',
    managerName: '',
    phone: '',
  });

  // Edit Governorate Rate State
  const [editingRate, setEditingRate] = useState<GovernorateRate | null>(null);
  const [rateFormData, setRateFormData] = useState<{
    baseRate: number;
    additionalKgRate: number;
    estDays: string;
    citiesStr: string;
  }>({
    baseRate: 45,
    additionalKgRate: 7,
    estDays: '24 ساعة',
    citiesStr: '',
  });

  // Add New Governorate Modal State
  const [isAddGovModalOpen, setIsAddGovModalOpen] = useState(false);
  const [newGovForm, setNewGovForm] = useState({
    code: '',
    nameAr: '',
    nameEn: '',
    baseRate: 50,
    additionalKgRate: 8,
    estDays: '24-48 ساعة',
    citiesStr: '',
  });

  // Bulk rate adjustment state
  const [bulkRateValue, setBulkRateValue] = useState<number>(55);

  // Edit Wallet Balance State
  const [editingWallet, setEditingWallet] = useState(false);
  const [walletForm, setWalletForm] = useState({
    availableBalance: wallet.availableBalance,
    pendingCod: wallet.pendingCod,
    totalPaidOut: wallet.totalPaidOut,
    merchantName: wallet.merchantName,
  });

  // Save User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.phone) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: userFormData.name,
        email: userFormData.email || `${userFormData.name.toLowerCase().replace(/\s+/g, '')}@am-shipping.eg`,
        phone: userFormData.phone,
        role: userFormData.role,
        storeName: userFormData.role === 'merchant' ? userFormData.storeName : undefined,
        hubName: userFormData.role === 'hub_manager' || userFormData.role === 'admin' ? userFormData.hubName : undefined,
        courierVehicle: userFormData.role === 'courier' ? userFormData.courierVehicle : undefined,
        isConfirmed: editingUser.isConfirmed !== undefined ? editingUser.isConfirmed : true,
      });
    } else {
      onAddUser({
        name: userFormData.name,
        email: userFormData.email || `${Date.now()}@am-shipping.eg`,
        phone: userFormData.phone,
        role: userFormData.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userFormData.name)}&background=dc2626&color=ffffff`,
        storeName: userFormData.role === 'merchant' ? userFormData.storeName : undefined,
        hubName: userFormData.role === 'hub_manager' || userFormData.role === 'admin' ? userFormData.hubName : undefined,
        courierVehicle: userFormData.role === 'courier' ? userFormData.courierVehicle : undefined,
        isConfirmed: true,
      });
    }

    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', phone: '', role: 'merchant', storeName: '', hubName: '', courierVehicle: '' });
  };

  const openEditUser = (user: UserSession) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      storeName: user.storeName || '',
      hubName: user.hubName || '',
      courierVehicle: user.courierVehicle || '',
    });
    setIsUserModalOpen(true);
  };

  // Save Courier
  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierFormData.name || !courierFormData.phone) return;

    const commType = courierFormData.commissionType || 'fixed';
    const commVal = Number(courierFormData.commissionValue) || 20;

    if (editingCourier) {
      onUpdateCourier({
        ...editingCourier,
        id: editingCourier.id || `cour-${Date.now()}`,
        name: courierFormData.name,
        phone: courierFormData.phone,
        vehicle: courierFormData.vehicle,
        assignedHub: courierFormData.assignedHub,
        rating: courierFormData.rating,
        commissionType: commType,
        commissionValue: commVal,
      });
    } else {
      const newCourierId = `cour-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      onAddCourier({
        id: newCourierId,
        name: courierFormData.name,
        phone: courierFormData.phone,
        vehicle: courierFormData.vehicle,
        assignedHub: courierFormData.assignedHub || (hubs[0]?.name || 'المستودع الرئيسي'),
        rating: courierFormData.rating,
        activeShipmentsCount: 0,
        codCollectedToday: 0,
        commissionType: commType,
        commissionValue: commVal,
        totalCommissionEarned: 0,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(courierFormData.name)}&background=2563eb&color=ffffff`,
      });
    }

    setIsCourierModalOpen(false);
    setEditingCourier(null);
    setCourierFormData({ name: '', phone: '', vehicle: 'motocycle', assignedHub: hubs[0]?.name || '', rating: 5.0, commissionType: 'fixed', commissionValue: 20 });
  };

  const openEditCourier = (c: CourierInfo) => {
    setEditingCourier(c);
    setCourierFormData({
      name: c.name,
      phone: c.phone,
      vehicle: c.vehicle,
      assignedHub: c.assignedHub,
      rating: c.rating,
      commissionType: c.commissionType || 'fixed',
      commissionValue: c.commissionValue ?? 20,
    });
    setIsCourierModalOpen(true);
  };

  // Save Hub
  const handleSaveHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubFormData.name || !hubFormData.address) return;

    if (editingHub) {
      onUpdateHub({
        ...editingHub,
        name: hubFormData.name,
        governorate: hubFormData.governorate,
        address: hubFormData.address,
        managerName: hubFormData.managerName,
        phone: hubFormData.phone,
      });
    } else {
      onAddHub({
        name: hubFormData.name,
        governorate: hubFormData.governorate,
        address: hubFormData.address,
        managerName: hubFormData.managerName,
        phone: hubFormData.phone,
      });
    }

    setIsHubModalOpen(false);
    setEditingHub(null);
    setHubFormData({ name: '', governorate: 'القاهرة', address: '', managerName: '', phone: '' });
  };

  const openEditHub = (h: HubInfo) => {
    setEditingHub(h);
    setHubFormData({
      name: h.name,
      governorate: h.governorate,
      address: h.address,
      managerName: h.managerName,
      phone: h.phone,
    });
    setIsHubModalOpen(true);
  };

  // Save Governorate Rate
  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    const parsedCities = rateFormData.citiesStr
      ? rateFormData.citiesStr.split(/[,،\n]/).map(c => c.trim()).filter(Boolean)
      : editingRate.cities;

    onUpdateGovernorateRate({
      ...editingRate,
      baseRate: Number(rateFormData.baseRate),
      additionalKgRate: Number(rateFormData.additionalKgRate),
      estDays: rateFormData.estDays,
      cities: parsedCities,
    });

    setEditingRate(null);
  };

  // Add New Governorate
  const handleAddGovernorate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGovForm.nameAr || !newGovForm.code) return;

    const parsedCities = newGovForm.citiesStr
      ? newGovForm.citiesStr.split(/[,،\n]/).map(c => c.trim()).filter(Boolean)
      : [];

    const newGov: GovernorateRate = {
      code: newGovForm.code.toUpperCase().trim(),
      nameAr: newGovForm.nameAr.trim(),
      nameEn: newGovForm.nameEn.trim() || newGovForm.code,
      baseRate: Number(newGovForm.baseRate),
      additionalKgRate: Number(newGovForm.additionalKgRate),
      estDays: newGovForm.estDays,
      cities: parsedCities,
    };

    onUpdateGovernorateRate(newGov);
    setIsAddGovModalOpen(false);
    setNewGovForm({
      code: '',
      nameAr: '',
      nameEn: '',
      baseRate: 50,
      additionalKgRate: 8,
      estDays: '24-48 ساعة',
      citiesStr: '',
    });
  };

  // Apply Bulk Rate to All Governorates
  const handleApplyBulkRate = (newBaseRate: number) => {
    if (!newBaseRate || newBaseRate <= 0) return;
    const updatedList = governorates.map((g) => ({
      ...g,
      baseRate: newBaseRate,
    }));
    onUpdateGovernorateRate(updatedList);
  };

  // Save Wallet
  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWallet({
      ...wallet,
      merchantName: walletForm.merchantName,
      availableBalance: Number(walletForm.availableBalance),
      pendingCod: Number(walletForm.pendingCod),
      totalPaidOut: Number(walletForm.totalPaidOut),
    });
    setEditingWallet(false);
  };

  const filteredUsers = users.filter(u => {
    let matchesRole = false;
    if (userRoleFilter === 'all') {
      matchesRole = true;
    } else if ((userRoleFilter as string) === 'pending') {
      matchesRole = u.isConfirmed === false;
    } else {
      matchesRole = u.role === userRoleFilter;
    }

    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      (u.storeName && u.storeName.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const filteredCouriers = couriers.filter(c =>
    c.name.toLowerCase().includes(courierSearch.toLowerCase()) ||
    c.phone.includes(courierSearch) ||
    c.assignedHub.toLowerCase().includes(courierSearch.toLowerCase())
  );

  const filteredRates = governorates.filter(g =>
    g.nameAr.toLowerCase().includes(rateSearch.toLowerCase()) ||
    g.nameEn.toLowerCase().includes(rateSearch.toLowerCase()) ||
    (g.cities && g.cities.some(c => c.toLowerCase().includes(rateSearch.toLowerCase())))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              مركز تخصيص وإدارة أدمن النظام
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            تخصيص كامل للنظام والحسابات والأسعار
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            تأثير فوري على كافة الواجهات وحسابات المستخدمين والمستودعات والمندوبين
          </p>
        </div>

        {/* Quick System Stats */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-xs font-bold text-slate-300">
          <div className="text-center px-2">
            <span className="block text-slate-400 text-[10px]">الحسابات النشطة</span>
            <span className="text-base font-black text-amber-400">{users.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center px-2">
            <span className="block text-slate-400 text-[10px]">الكباتن</span>
            <span className="text-base font-black text-blue-400">{couriers.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center px-2">
            <span className="block text-slate-400 text-[10px]">المستودعات</span>
            <span className="text-base font-black text-emerald-400">{hubs.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center px-2">
            <span className="block text-slate-400 text-[10px]">إجمالي الشحنات</span>
            <span className="text-base font-black text-red-400">{shipments.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approval'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : pendingShipments.length > 0
              ? 'bg-amber-100 text-amber-950 border border-amber-300 animate-pulse font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>تأكيد الأوردرات الجديدة ({pendingShipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة الحسابات ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('couriers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'couriers'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>إدارة الكباتن والمندوبين ({couriers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hubs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hubs'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>المستودعات والفروع ({hubs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rates'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>أسعار الشحن والمحافظات</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>ماليات ورصيد التاجر</span>
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap mr-auto ${
            activeTab === 'danger'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>مسح وضبط البيانات</span>
        </button>
      </div>

      {/* TAB 0: PENDING ORDERS APPROVAL */}
      {activeTab === 'approval' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                تأكيد وموافقة طلبات الشحن الجديدة (أوردرات التجار والإكسيل)
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                جدول مراجعة واعتماد الطلبات التي أضافها التجار (يدوياً أو عبر رفع ملفات الإكسيل) قبل بدء عملية الشحن والتوزيع
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportShipmentsToExcel(shipments, 'جميع_أوردرات_النظام')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير كافة أوردرات النظام ({shipments.length})
              </button>

              {pendingShipments.length > 0 && onApproveAllPending && (
                <button
                  onClick={onApproveAllPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  تأكيد وموافقة جميع الطلبات المعلّقة ({pendingShipments.length})
                </button>
              )}
            </div>
          </div>

          {pendingShipments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">ممتاز! لا توجد طلبات معلقة بانتظار موافقة الأدمن</h3>
              <p className="text-xs text-slate-500 mt-1">جميع طلبات التجار والإكسيل مراجعة ومؤكدة بنجاح.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                  <tr>
                    <th className="p-3.5">رقم البوليصة</th>
                    <th className="p-3.5">التاجر / المتجر</th>
                    <th className="p-3.5">العميل والمحافظة</th>
                    <th className="p-3.5">قيمة COD</th>
                    <th className="p-3.5">محتوى الطرد</th>
                    <th className="p-3.5">حالة الطلب</th>
                    <th className="p-3.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pendingShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-extrabold text-red-600 block">{s.trackingNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(s.createdAt).toLocaleString('ar-EG')}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{s.sender.storeName}</span>
                        <span className="text-[11px] text-slate-500 font-mono" dir="ltr">{s.sender.phone}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{s.recipient.name} ({s.recipient.governorate})</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">{s.recipient.streetAddress}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-red-600 text-sm block">{s.financials.codAmount.toLocaleString()} ج.م</span>
                        <span className="text-[10px] text-slate-400">شحن: {s.financials.shippingFee} ج.م</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block truncate max-w-[150px]">{s.packageDetails.description}</span>
                        <span className="text-[10px] text-slate-400">{s.packageDetails.itemsCount} قطع ({s.packageDetails.weightKg} كجم)</span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 w-fit animate-pulse">
                          ⏳ بانتظار التأكيد
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {onApproveShipment && (
                          <button
                            onClick={() => onApproveShipment(s.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 mx-auto shadow-2xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            تأكيد الأوردر
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                حسابات مستخدمي النظام
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                إضافة وتعديل وحذف حسابات التجار، المندوبين، مدراء المستودعات وأدمن النظام
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({ name: '', email: '', phone: '', role: 'merchant', storeName: '', hubName: '', courierVehicle: '' });
                setIsUserModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة حساب جديد
            </button>
          </div>

          {/* Search Box and Role Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ابحث بالاسم، اسم المتجر، البريد أو الهاتف..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none focus:border-red-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  userRoleFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كافة الحسابات ({users.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('merchant')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                  userRoleFilter === 'merchant'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                التجار ({users.filter((u) => u.role === 'merchant').length})
              </button>
              <button
                onClick={() => setUserRoleFilter('courier')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                  userRoleFilter === 'courier'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                الكباتن ({users.filter((u) => u.role === 'courier').length})
              </button>
              <button
                onClick={() => setUserRoleFilter('hub_manager')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
                  userRoleFilter === 'hub_manager'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                المستودعات ({users.filter((u) => u.role === 'hub_manager').length})
              </button>
              {users.some((u) => u.isConfirmed === false) && (
                <button
                  onClick={() => setUserRoleFilter('pending' as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    (userRoleFilter as string) === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  بانتظار التفعيل ({users.filter((u) => u.isConfirmed === false).length})
                </button>
              )}
            </div>
          </div>

          {/* Pending Users Admin Confirmation Banner */}
          {users.some((u) => u.isConfirmed === false) && (
            <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-amber-950">
                    تأكيد الحسابات الجديدة عبر Supabase
                  </h4>
                  <p className="text-[11px] font-bold text-amber-800">
                    توجد حسابات تم إنشاؤها عبر التسجيل بانتظار موافقة الأدمن لتفعيلها بالكامل.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  users.filter((u) => u.isConfirmed === false).forEach((u) => {
                    onUpdateUser({ ...u, isConfirmed: true });
                  });
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                تأكيد وتفعيل كافة الحسابات المعلقة ({users.filter((u) => u.isConfirmed === false).length})
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">الدور في النظام</th>
                  <th className="p-3.5">تفاصيل التخصيص</th>
                  <th className="p-3.5">الهاتف والبريد</th>
                  <th className="p-3.5">تأكيد Supabase</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      لا يوجد حسابات مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-black text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {u.id}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                          u.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : u.role === 'merchant'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : u.role === 'courier'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : u.role === 'hub_manager'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
                          {u.role === 'merchant' && <Store className="w-3.5 h-3.5 text-red-600" />}
                          {u.role === 'courier' && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                          {u.role === 'hub_manager' && <Building2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {u.role === 'admin' ? 'أدمن النظام' : u.role === 'merchant' ? 'تاجر / متجر' : u.role === 'courier' ? 'كابتن توصيل' : u.role === 'hub_manager' ? 'مدير مستودع' : 'زائر تتبع'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {u.storeName && <span className="block text-xs font-extrabold text-slate-900">المتجر: {u.storeName}</span>}
                        {u.hubName && <span className="block text-xs font-bold text-slate-700">المستودع: {u.hubName}</span>}
                        {u.courierVehicle && <span className="block text-xs font-bold text-slate-700">المركبة: {u.courierVehicle}</span>}
                        {!u.storeName && !u.hubName && !u.courierVehicle && <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-3.5">
                        <p className="font-mono text-slate-900 dir-ltr text-right">{u.phone}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                      </td>
                      <td className="p-3.5">
                        {u.isConfirmed === false ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            بانتظار موافقة الأدمن
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            مؤكد ومفعل
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {u.isConfirmed === false && (
                            <button
                              onClick={() => onUpdateUser({ ...u, isConfirmed: true })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              title="تأكيد وتفعيل الحساب الآن"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              تأكيد الحساب
                            </button>
                          )}
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الحساب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* TAB 2: COURIERS MANAGEMENT */}
      {activeTab === 'couriers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600" />
                إدارة كباتن ومندوبي الشحن والعمولات
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                إضافة كباتن، تحديد نسب ومبالغ العمولات، وربطهم بالمستودعات
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCourier(null);
                setCourierFormData({ name: '', phone: '', vehicle: 'motocycle', assignedHub: hubs[0]?.name || 'المستودع الرئيسي', rating: 5.0, commissionType: 'fixed', commissionValue: 20 });
                setIsCourierModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة كابتن جديد
            </button>
          </div>

          {/* Admin Courier Commission Control Summary */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white p-4 rounded-2xl border border-red-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                نظام عمولات المندوبين (تحكم الأدمن الكامل)
              </span>
              <h3 className="text-sm font-black text-white">
                إجمالي عمولات الكباتن المستحقة عن الأوردرات المسلّمة:
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                يمكن للأدمن تعيين عمولة لكل مندوب (مبلغ ثابت لكل شحنة أو نسبة مئوية) وتتحدث مستحقات المندوب فور تسليم الأوردر.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/15 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-300 block">إجمالي العمولات المحسوبة:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {filteredCouriers.reduce((acc, c) => {
                    const cDelivered = shipments.filter((s) => s.status === 'delivered' && (s.assignedCourier?.id === c.id || (c.phone && s.assignedCourier?.phone === c.phone)));
                    const commType = c.commissionType || 'fixed';
                    const commVal = c.commissionValue ?? 20;
                    return acc + cDelivered.reduce((sum, s) => sum + (commType === 'percentage' ? (s.financials.shippingFee * commVal) / 100 : commVal), 0);
                  }, 0).toLocaleString()} <span className="text-xs text-white">ج.م</span>
                </span>
              </div>

              <div className="border-r border-white/20 pr-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    couriers.forEach((c) => {
                      onUpdateCourier({ ...c, commissionType: 'fixed', commissionValue: 20 });
                    });
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  title="تخصيص عمولة 20 ج.م ثابتة لكل الأوردرات"
                >
                  تطبيق 20 ج.م ثابتة للكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    couriers.forEach((c) => {
                      onUpdateCourier({ ...c, commissionType: 'percentage', commissionValue: 15 });
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  title="تخصيص 15% من قيمة الشحن لكل الأوردرات"
                >
                  تطبيق 15% نسبة للكل
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCouriers.map((c) => {
              const courierDelivered = shipments.filter(
                (s) => s.status === 'delivered' && (s.assignedCourier?.id === c.id || (c.phone && s.assignedCourier?.phone === c.phone))
              );
              const commType = c.commissionType || 'fixed';
              const commVal = c.commissionValue ?? 20;
              const earnedComm = courierDelivered.reduce((sum, s) => {
                if (commType === 'percentage') {
                  return sum + (s.financials.shippingFee * commVal) / 100;
                }
                return sum + commVal;
              }, 0);

              return (
                <div key={c.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 hover:border-red-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={c.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}`}
                        alt={c.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <h3 className="text-xs font-black text-slate-900">{c.name}</h3>
                        <p className="text-[11px] font-bold text-slate-600 font-mono">{c.phone}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold flex-wrap pt-0.5">
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            {c.vehicle === 'motocycle' ? 'دراجة نارية' : c.vehicle === 'van' ? 'سيارة فان' : 'سيارة نقل'}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                            {c.assignedHub}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => openEditCourier(c)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                        title="تعديل بيانات والعمولة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCourier(c.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                        title="حذف المندوب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Commission Display Box on Courier Card */}
                  <div className="bg-white p-2.5 rounded-xl border border-red-100 flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">العمولة المحددة من الأدمن:</span>
                      <span className="text-red-700 font-extrabold">
                        {commType === 'fixed' ? `${commVal} ج.م / أوردر` : `${commVal}% من الشحن`}
                      </span>
                    </div>
                    <div className="text-left bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      <span className="text-[9px] text-slate-500 block font-medium">أرباح العمولات:</span>
                      <span className="text-emerald-700 font-black font-mono">
                        +{earnedComm.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HUBS MANAGEMENT */}
      {activeTab === 'hubs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                مستودعات وفروع الشحن
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                إضافة مستودعات جديدة وتعيين المدراء والعناوين والمحافظات
              </p>
            </div>

            <button
              onClick={() => {
                setEditingHub(null);
                setHubFormData({ name: '', governorate: 'القاهرة', address: '', managerName: '', phone: '' });
                setIsHubModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة مستودع جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((h) => (
              <div key={h.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                      {h.governorate}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1">{h.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditHub(h)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-slate-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteHub(h.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-slate-200/60">
                  <p><span className="text-slate-400 font-normal">العنوان:</span> {h.address}</p>
                  <p><span className="text-slate-400 font-normal">المدير المسؤول:</span> {h.managerName || '-'}</p>
                  <p><span className="text-slate-400 font-normal">الهاتف:</span> <span className="font-mono">{h.phone || '-'}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHIPPING RATES MANAGEMENT */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                تعديل أسعار الشحن الثابتة والمحافظات
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                يمكن للأدمن التحكم الكامل بسعر الشحن الأساسي وسعر الكيلو الزائد والمدن التابعة لكل محافظة
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  placeholder="ابحث بمحافظة أو مدينة (التجمع، أكتوبر)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none focus:border-red-600 transition-all"
                />
              </div>

              <button
                onClick={() => setIsAddGovModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-red-500" />
                إضافة منطقة / محافظة جديدة
              </button>
            </div>
          </div>

          {/* Bulk Shipping Rate Tool */}
          <div className="bg-gradient-to-r from-red-50 to-slate-50 border border-red-100 p-4 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-red-950 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-red-600" />
                تحديث سريع وموحد لأسعار الشحن (Bulk Rate Action):
              </span>
              <p className="text-[11px] text-slate-600 font-medium">
                تطبيق سعر ثابت موحد على جميع المحافظات الـ {governorates.length} دفعة واحدة بدون الحاجة لتعديل كل محافظة على حدة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-slate-700">السعر الموحد:</span>
                <input
                  type="number"
                  value={bulkRateValue}
                  onChange={(e) => setBulkRateValue(Number(e.target.value))}
                  className="w-16 text-center font-black text-xs text-red-600 border-b border-slate-300 outline-none focus:border-red-600"
                />
                <span className="text-xs font-bold text-slate-500">ج.م</span>
              </div>

              <button
                onClick={() => {
                  if (confirm(`هل أنت تأكد من تطبيق سعر شحن موحد (${bulkRateValue} ج.م) على جميع المحافظات؟`)) {
                    handleApplyBulkRate(bulkRateValue);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تطبيق على الكل ({governorates.length} محافظة)
              </button>
            </div>
          </div>

          {/* Quick Highlight for Requested Cities (مدينتي، بدر، الشروق، العبور، القلج، مؤسسة) */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                قائمة المدن والأسعار المطلوبة (مدينتي - بدر - الشروق - العبور - القلج - مؤسسة)
              </span>
              <span className="text-[10px] text-slate-300 font-medium bg-white/10 px-2.5 py-1 rounded-lg">
                موجودة بالنظام ومفعلة مع إمكانية التعديل
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { name: 'مدينتي', govCode: 'NCW', defaultGov: 'المدن الجديدة' },
                { name: 'بدر', govCode: 'NCW', defaultGov: 'المدن الجديدة' },
                { name: 'الشروق', govCode: 'NCW', defaultGov: 'المدن الجديدة' },
                { name: 'العبور', govCode: 'QLB', defaultGov: 'القليوبية' },
                { name: 'القلج', govCode: 'QLB', defaultGov: 'القليوبية' },
                { name: 'مؤسسة الزكاة (مؤسسة)', govCode: 'CAI', defaultGov: 'القاهرة' },
              ].map((item) => {
                const targetGov = governorates.find((g) => g.code === item.govCode || g.cities?.some(c => c.includes(item.name.split(' ')[0]))) || governorates.find(g => g.code === 'CAI');
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => {
                      if (targetGov) {
                        setEditingRate(targetGov);
                        setRateFormData({
                          baseRate: targetGov.baseRate,
                          additionalKgRate: targetGov.additionalKgRate,
                          estDays: targetGov.estDays,
                          citiesStr: targetGov.cities ? targetGov.cities.join(', ') : '',
                        });
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl space-y-1 text-right transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white group-hover:text-amber-300">{item.name}</span>
                      <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">{targetGov ? targetGov.nameAr : item.defaultGov}</span>
                      <span className="text-amber-400 font-mono font-black">{targetGov ? `${targetGov.baseRate} ج.م` : '45 ج.م'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Governorates Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                <tr>
                  <th className="p-3.5">المحافظة / المنطقة</th>
                  <th className="p-3.5">سعر الشحن الثابت (حتى 3 كجم)</th>
                  <th className="p-3.5">الكيلو الإضافي</th>
                  <th className="p-3.5">مدة التسليم</th>
                  <th className="p-3.5">المدن والمراكز المغطاة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                {filteredRates.map((g) => (
                  <tr key={g.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-mono font-black">
                          {g.code}
                        </span>
                        <div>
                          <span className="font-black text-slate-900 block">{g.nameAr}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{g.nameEn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-black text-sm text-red-600 bg-red-50 border border-red-200/60 px-2.5 py-1 rounded-lg inline-block">
                        {g.baseRate} ج.م
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      +{g.additionalKgRate} ج.م
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-extrabold">
                        {g.estDays}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      {g.cities && g.cities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {g.cities.slice(0, 4).map((c) => (
                            <span key={c} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                              {c}
                            </span>
                          ))}
                          {g.cities.length > 4 && (
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black">
                              +{g.cities.length - 4} مدن أخرى
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal">جميع مدن المحافظة</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setEditingRate(g);
                          setRateFormData({
                            baseRate: g.baseRate,
                            additionalKgRate: g.additionalKgRate,
                            estDays: g.estDays,
                            citiesStr: g.cities ? g.cities.join(', ') : '',
                          });
                        }}
                        className="bg-slate-100 hover:bg-red-600 hover:text-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        تعديل السعر والمدن
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MERCHANT WALLET ADMIN */}
      {activeTab === 'wallet' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-red-600" />
                تعديل وتخصيص محفظة التاجر والماليات
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                التحكم المباشر في الرصيد القابل للسحب ومبالغ التحصيل المعلقة
              </p>
            </div>

            <button
              onClick={() => {
                setWalletForm({
                  merchantName: wallet.merchantName,
                  availableBalance: wallet.availableBalance,
                  pendingCod: wallet.pendingCod,
                  totalPaidOut: wallet.totalPaidOut,
                });
                setEditingWallet(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              تعديل قيم المحفظة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
              <span className="text-xs font-bold text-emerald-700 block">الرصيد المتاح للسحب</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">
                {wallet.availableBalance.toLocaleString()} ج.م
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
              <span className="text-xs font-bold text-amber-700 block">تحصيلات معلقة قيد التسليم</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">
                {wallet.pendingCod.toLocaleString()} ج.م
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
              <span className="text-xs font-bold text-blue-700 block">إجمالي السحوبات السابقة</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {wallet.totalPaidOut.toLocaleString()} ج.م
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DANGER ZONE & DATA PURGE */}
      {activeTab === 'danger' && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              مسح وإعادة ضبط بيانات النظام
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              أدوات تفريغ النظام وإزالة كافة البيانات أو تصفير الشحنات لتبدأ العمل على نظافة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                مسح كافة الشحنات في النظام
              </h3>
              <p className="text-xs text-slate-400">
                سيتم إزالة جميع بوالص الشحن والتتبعات الحالية بشكل نهائي وتصفير المحفظة.
              </p>
              <button
                onClick={onClearAllShipments}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                مسح كافة الشحنات الآن
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                مسح وتصفير كافة الحسابات والبيانات
              </h3>
              <p className="text-xs text-slate-400">
                سيتم مسح البيانات وإعادة ضبط النظام بالكامل ليكون فارغاً وجاهزاً لتخصيصك.
              </p>
              <button
                onClick={onClearAllData}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                تصفير النظام بالكامل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-red-600" />
                {editingUser ? 'تعديل حساب المستخدم' : 'إضافة حساب جديد'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">نوع ودور الحساب:</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as AppUserRole })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                >
                  <option value="admin">أدمن النظام (Admin)</option>
                  <option value="merchant">تاجر / متجر (Merchant)</option>
                  <option value="courier">كابتن توصيل (Courier)</option>
                  <option value="hub_manager">مدير مستودع (Hub Manager)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="مثال: أحمد صلاح"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="user@am-shipping.eg"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              {userFormData.role === 'merchant' && (
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">اسم المتجر التجاري:</label>
                  <input
                    type="text"
                    value={userFormData.storeName}
                    onChange={(e) => setUserFormData({ ...userFormData, storeName: e.target.value })}
                    placeholder="مثال: متجر الملابس الأنيقة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
              )}

              {userFormData.role === 'courier' && (
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">نوع المركبة:</label>
                  <input
                    type="text"
                    value={userFormData.courierVehicle}
                    onChange={(e) => setUserFormData({ ...userFormData, courierVehicle: e.target.value })}
                    placeholder="دراجة نارية / سيارة نقل"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
              )}

              {(userFormData.role === 'hub_manager' || userFormData.role === 'admin') && (
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">اسم المستودع أو التبعية:</label>
                  <input
                    type="text"
                    value={userFormData.hubName}
                    onChange={(e) => setUserFormData({ ...userFormData, hubName: e.target.value })}
                    placeholder="المستودع الرئيسي بالقاهرة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURIER */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600" />
                {editingCourier ? 'تعديل بيانات الكابتن' : 'إضافة كابتن جديد'}
              </h3>
              <button onClick={() => setIsCourierModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">اسم الكابتن:</label>
                <input
                  type="text"
                  required
                  value={courierFormData.name}
                  onChange={(e) => setCourierFormData({ ...courierFormData, name: e.target.value })}
                  placeholder="محمود حسن"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={courierFormData.phone}
                  onChange={(e) => setCourierFormData({ ...courierFormData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">نوع المركبة:</label>
                <select
                  value={courierFormData.vehicle}
                  onChange={(e) => setCourierFormData({ ...courierFormData, vehicle: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                >
                  <option value="motocycle">دراجة نارية (موتوسيكل)</option>
                  <option value="van">سيارة فان (Van)</option>
                  <option value="car">سيارة نقل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">المستودع التابع له:</label>
                <select
                  value={courierFormData.assignedHub}
                  onChange={(e) => setCourierFormData({ ...courierFormData, assignedHub: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Courier Commission Settings (Admin Control) */}
              <div className="bg-red-50/60 border border-red-200 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-red-950">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  <span>تحديد عمولة المندوب (تحكم الأدمن)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع العمولة:</label>
                    <select
                      value={courierFormData.commissionType}
                      onChange={(e) => setCourierFormData({ ...courierFormData, commissionType: e.target.value as 'fixed' | 'percentage' })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                    >
                      <option value="fixed">مبلغ ثابت (ج.م / شحنة)</option>
                      <option value="percentage">نسبة مئوية (% من الشحن)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">قيمة العمولة:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        value={courierFormData.commissionValue}
                        onChange={(e) => setCourierFormData({ ...courierFormData, commissionValue: parseFloat(e.target.value) || 0 })}
                        placeholder={courierFormData.commissionType === 'fixed' ? '20' : '15'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-red-600 font-mono"
                      />
                      <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">
                        {courierFormData.commissionType === 'fixed' ? 'ج.م' : '%'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  * تحسب هذه العمولة للمندوب تلقائياً فور تسليم الشحنة للعميل وتضاف لرصيد عمولاته.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  حفظ الكابتن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT HUB */}
      {isHubModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                {editingHub ? 'تعديل بيانات المستودع' : 'إضافة مستودع جديد'}
              </h3>
              <button onClick={() => setIsHubModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHub} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">اسم المستودع / الفرع:</label>
                <input
                  type="text"
                  required
                  value={hubFormData.name}
                  onChange={(e) => setHubFormData({ ...hubFormData, name: e.target.value })}
                  placeholder="مستودع الجيزة الرئيسي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">المحافظة:</label>
                <input
                  type="text"
                  required
                  value={hubFormData.governorate}
                  onChange={(e) => setHubFormData({ ...hubFormData, governorate: e.target.value })}
                  placeholder="القاهرة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">عنوان المقر والتفاصيل:</label>
                <input
                  type="text"
                  required
                  value={hubFormData.address}
                  onChange={(e) => setHubFormData({ ...hubFormData, address: e.target.value })}
                  placeholder="شارع مصدق، الدقي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">المدير المسؤول:</label>
                <input
                  type="text"
                  value={hubFormData.managerName}
                  onChange={(e) => setHubFormData({ ...hubFormData, managerName: e.target.value })}
                  placeholder="أحمد علي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">هاتف المقر:</label>
                <input
                  type="text"
                  value={hubFormData.phone}
                  onChange={(e) => setHubFormData({ ...hubFormData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  حفظ المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GOVERNORATE RATE */}
      {editingRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                تعديل سعر شحن ومدن {editingRate.nameAr}
              </h3>
              <button onClick={() => setEditingRate(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">سعر الشحن الثابت (حتى 3 كجم):</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rateFormData.baseRate}
                    onChange={(e) => setRateFormData({ ...rateFormData, baseRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-xs font-black text-red-600 outline-none focus:border-red-600"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">ج.م</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">سعر الكيلو الإضافي (ج.م/كجم):</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={rateFormData.additionalKgRate}
                    onChange={(e) => setRateFormData({ ...rateFormData, additionalKgRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">ج.م</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">مدة التسليم المتوقعة:</label>
                <input
                  type="text"
                  required
                  value={rateFormData.estDays}
                  onChange={(e) => setRateFormData({ ...rateFormData, estDays: e.target.value })}
                  placeholder="مثال: 24 ساعة، 48 ساعة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">
                  المراكز والمدن المغطاة (افصل بفاصلة):
                </label>
                <textarea
                  rows={3}
                  value={rateFormData.citiesStr}
                  onChange={(e) => setRateFormData({ ...rateFormData, citiesStr: e.target.value })}
                  placeholder="مثال: التجمع الخامس، التجمع الأول، مدينة نصر، مدينتي، بدر، الشروق، العبور، القلج، مؤسسة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />

                {/* Quick Add City Shortcuts */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold block">إضافة سريعة لمدن ومراكز مطلوبة:</span>
                  <div className="flex flex-wrap gap-1">
                    {['مدينتي', 'بدر', 'الشروق', 'العبور', 'القلج', 'مؤسسة الزكاة (مؤسسة)'].map((cityName) => (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          const currentCities = rateFormData.citiesStr
                            ? rateFormData.citiesStr.split(/[,،\n]/).map((c) => c.trim()).filter(Boolean)
                            : [];
                          if (!currentCities.some(c => c.includes(cityName.split(' ')[0]))) {
                            const updatedStr = [...currentCities, cityName].join(', ');
                            setRateFormData({ ...rateFormData, citiesStr: updatedStr });
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-red-200/60 transition-all cursor-pointer"
                      >
                        + {cityName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW GOVERNORATE */}
      {isAddGovModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" />
                إضافة محافظة / منطقة شحن جديدة
              </h3>
              <button onClick={() => setIsAddGovModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGovernorate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">اسم المحافظة (بالعربي) *</label>
                  <input
                    type="text"
                    required
                    value={newGovForm.nameAr}
                    onChange={(e) => setNewGovForm({ ...newGovForm, nameAr: e.target.value })}
                    placeholder="مثال: مطروح"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">الكود المختصر (Code) *</label>
                  <input
                    type="text"
                    required
                    value={newGovForm.code}
                    onChange={(e) => setNewGovForm({ ...newGovForm, code: e.target.value })}
                    placeholder="مثال: MTR"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono outline-none focus:border-red-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">سعر الشحن الثابت (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={newGovForm.baseRate}
                    onChange={(e) => setNewGovForm({ ...newGovForm, baseRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-red-600 outline-none focus:border-red-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">سعر الكيلو الزائد (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={newGovForm.additionalKgRate}
                    onChange={(e) => setNewGovForm({ ...newGovForm, additionalKgRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">مدة التسليم المتوقعة *</label>
                <input
                  type="text"
                  required
                  value={newGovForm.estDays}
                  onChange={(e) => setNewGovForm({ ...newGovForm, estDays: e.target.value })}
                  placeholder="24-48 ساعة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">المدن والمراكز المغطاة (افصل بفاصلة)</label>
                <textarea
                  rows={2}
                  value={newGovForm.citiesStr}
                  onChange={(e) => setNewGovForm({ ...newGovForm, citiesStr: e.target.value })}
                  placeholder="مثال: مرسى مطروح، العلمين، الساحل الشمالي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGovModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  إضافة المحافظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WALLET */}
      {editingWallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-red-600" />
                تعديل قيم محفظة التاجر
              </h3>
              <button onClick={() => setEditingWallet(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">اسم المتجر / التاجر:</label>
                <input
                  type="text"
                  value={walletForm.merchantName}
                  onChange={(e) => setWalletForm({ ...walletForm, merchantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">الرصيد المتاح للسحب (ج.م):</label>
                <input
                  type="number"
                  value={walletForm.availableBalance}
                  onChange={(e) => setWalletForm({ ...walletForm, availableBalance: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">التحصيلات المعلقة (ج.م):</label>
                <input
                  type="number"
                  value={walletForm.pendingCod}
                  onChange={(e) => setWalletForm({ ...walletForm, pendingCod: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700">إجمالي المبالغ المسحوبة (ج.م):</label>
                <input
                  type="number"
                  value={walletForm.totalPaidOut}
                  onChange={(e) => setWalletForm({ ...walletForm, totalPaidOut: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWallet(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
