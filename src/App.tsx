import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ShipmentsList } from './components/ShipmentsList';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { ShipmentDetailModal } from './components/ShipmentDetailModal';
import { WaybillPrintModal } from './components/WaybillPrintModal';
import { CourierAppView } from './components/CourierAppView';
import { PublicTrackingView } from './components/PublicTrackingView';
import { WalletView } from './components/WalletView';
import { AnalyticsView } from './components/AnalyticsView';
import { RateCalculatorView } from './components/RateCalculatorView';
import { LoginView, createSessionUser } from './components/LoginView';
import { AdminPanelView } from './components/AdminPanelView';
import { supabase, isSupabaseConfigured, mapSupabaseUserToSession } from './lib/supabase';
import { syncEngine } from './lib/syncEngine';

import { Shipment, AppUserRole, MerchantWallet, ShipmentStatus, CourierInfo, CourierNotification, UserSession, HubInfo, GovernorateRate } from './types';
import { INITIAL_SHIPMENTS, INITIAL_MERCHANT_WALLET, BOSTA_COURIERS, BOSTA_HUBS, EGYPT_GOVERNORATES } from './data/mockData';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CourierNotificationToast } from './components/CourierNotificationToast';

// Safe localStorage loader helper
const loadLocalState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

export default function App() {
  const [shipments, setShipments] = useState<Shipment[]>(() =>
    loadLocalState<Shipment[]>('bosta_shipments', INITIAL_SHIPMENTS)
  );

  const [wallet, setWallet] = useState<MerchantWallet>(() =>
    loadLocalState<MerchantWallet>('bosta_wallet', INITIAL_MERCHANT_WALLET)
  );

  // Dynamic system entities customizable by Admin
  const [users, setUsers] = useState<UserSession[]>(() =>
    loadLocalState<UserSession[]>('bosta_users', [])
  );

  const [couriers, setCouriers] = useState<CourierInfo[]>(() =>
    loadLocalState<CourierInfo[]>('bosta_couriers', BOSTA_COURIERS)
  );

  const [hubs, setHubs] = useState<HubInfo[]>(() =>
    loadLocalState<HubInfo[]>('bosta_hubs', BOSTA_HUBS)
  );

  const [governorates, setGovernorates] = useState<GovernorateRate[]>(() =>
    loadLocalState<GovernorateRate[]>('bosta_governorates', EGYPT_GOVERNORATES)
  );

  const [currentRole, setCurrentRole] = useState<AppUserRole>(() =>
    loadLocalState<AppUserRole>('bosta_current_role', 'merchant')
  );

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() =>
    loadLocalState<UserSession | null>('bosta_current_user', null)
  );

  const [activeTab, setActiveTab] = useState<string>(() =>
    loadLocalState<string>('bosta_active_tab', 'login')
  );

  // Auto-sync state updates to localStorage and broadcast to all connected devices/accounts
  useEffect(() => {
    localStorage.setItem('bosta_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('bosta_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('bosta_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bosta_couriers', JSON.stringify(couriers));
  }, [couriers]);

  useEffect(() => {
    localStorage.setItem('bosta_hubs', JSON.stringify(hubs));
  }, [hubs]);

  useEffect(() => {
    localStorage.setItem('bosta_governorates', JSON.stringify(governorates));
  }, [governorates]);

  useEffect(() => {
    localStorage.setItem('bosta_current_role', JSON.stringify(currentRole));
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('bosta_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bosta_active_tab', JSON.stringify(activeTab));
  }, [activeTab]);

  // Real-time synchronization across all devices, browser windows, and registered accounts
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((incoming) => {
      if (incoming.shipments && Array.isArray(incoming.shipments)) {
        setShipments(incoming.shipments);
      }
      if (incoming.wallet) {
        setWallet(incoming.wallet);
      }
      if (incoming.users && Array.isArray(incoming.users)) {
        setUsers(incoming.users);
      }
      if (incoming.couriers && Array.isArray(incoming.couriers)) {
        setCouriers(incoming.couriers);
      }
      if (incoming.hubs && Array.isArray(incoming.hubs)) {
        setHubs(incoming.hubs);
      }
      if (incoming.governorates && Array.isArray(incoming.governorates)) {
        setGovernorates(incoming.governorates);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Broadcast state changes whenever core data is modified
  const broadcastDataChange = (overrideState?: Partial<{
    shipments: Shipment[];
    wallet: MerchantWallet;
    users: UserSession[];
    couriers: CourierInfo[];
    hubs: HubInfo[];
    governorates: GovernorateRate[];
  }>) => {
    syncEngine.broadcastState({
      shipments: overrideState?.shipments || shipments,
      wallet: overrideState?.wallet || wallet,
      users: overrideState?.users || users,
      couriers: overrideState?.couriers || couriers,
      hubs: overrideState?.hubs || hubs,
      governorates: overrideState?.governorates || governorates,
    });
  };

  // Listen to Supabase Auth State changes if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !currentUser) {
        const user = mapSupabaseUserToSession(session.user);
        setCurrentUser(user);
        setCurrentRole(user.role);
        if (user.role === 'courier') {
          setActiveTab('courier_app');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = mapSupabaseUserToSession(session.user);
        setCurrentUser(user);
        setCurrentRole(user.role);
        if (user.role === 'courier') {
          setActiveTab('courier_app');
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth handlers
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'courier') {
      setActiveTab('courier_app');
    } else if (user.role === 'public_tracker') {
      setActiveTab('tracking');
    } else {
      setActiveTab('shipments');
    }
    showToast(`🔑 تم تسجيل الدخول بنجاح كـ ${user.name}`);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
    setCurrentUser(null);
    setActiveTab('login');
    showToast('👋 تم تسجيل الخروج بنجاح');
  };

  const handleGuestTrackFromLogin = (trackingNumber: string) => {
    setPublicSearchTrackNum(trackingNumber);
    setCurrentRole('public_tracker');
    setCurrentUser(createSessionUser('زائر', 'public_tracker'));
    setActiveTab('tracking');
    showToast(`🔍 جاري جلب تفاصيل الشحنة ${trackingNumber}`);
  };

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedDetailShipment, setSelectedDetailShipment] = useState<Shipment | null>(null);
  const [selectedPrintShipment, setSelectedPrintShipment] = useState<Shipment | null>(null);
  const [publicSearchTrackNum, setPublicSearchTrackNum] = useState<string>('BST-804101');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Courier Notification System
  const [courierNotifications, setCourierNotifications] = useState<CourierNotification[]>([]);
  const [activeCourierToast, setActiveCourierToast] = useState<CourierNotification | null>(null);
  const [activeCourierIdInApp, setActiveCourierIdInApp] = useState<string | undefined>(undefined);
  const [activeTargetShipmentId, setActiveTargetShipmentId] = useState<string | undefined>(undefined);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Create Shipment Handler
  const handleCreateShipment = (
    newShipmentData: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>
  ) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const trackingNo = `BST-${randomNum}`;
    const nowIso = new Date().toISOString();
    const isPending = newShipmentData.status === 'pending_approval';

    const createdShipment: Shipment = {
      ...newShipmentData,
      id: trackingNo,
      trackingNumber: trackingNo,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: newShipmentData.status || (currentRole === 'admin' ? 'created' : 'pending_approval'),
          title: isPending ? '⏳ طلب جديد - بانتظار موافقة الأدمن' : '✨ تم إنشاء بوليصة الشحن بنجاح',
          description: isPending
            ? 'تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن'
            : 'تم اعتماد الشحنة وجاري تجهيز الاستلام من المتجر',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          actorRole: currentRole === 'admin' ? 'system' : 'merchant',
        },
      ],
    };

    setShipments((prev) => [createdShipment, ...prev]);

    // Update Wallet pending amount
    setWallet((prev) => ({
      ...prev,
      pendingCod: prev.pendingCod + createdShipment.financials.codAmount,
    }));

    if (isPending) {
      showToast(`⏳ تم تسجيل الطلب ${trackingNo} وبانتظار موافقة وتأكيد الأدمن!`);
    } else {
      showToast(`✨ تم إنشاء بوليصة الشحن رقم ${trackingNo} وتأكيدها بنجاح!`);
    }
  };

  // Approve single pending shipment
  const handleApproveShipment = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: 'created' as ShipmentStatus,
            title: '✅ تم تأكيد وموافقة الأوردر بواسطة الأدمن',
            description: 'قام أدمن النظام بمراجعة بيانات الشحنة وتأكيدها لبدء التنفيذ والاستلام',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actorRole: 'system' as const,
          },
        ];

        return {
          ...s,
          status: 'created' as ShipmentStatus,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );

    showToast(`✅ تم تأكيد وموافقة الأوردر بنجاح!`);
  };

  // Approve all pending shipments
  const handleApproveAllPending = () => {
    let count = 0;
    setShipments((prev) =>
      prev.map((s) => {
        if (s.status !== 'pending_approval') return s;
        count++;
        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: 'created' as ShipmentStatus,
            title: '✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن',
            description: 'تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actorRole: 'system' as const,
          },
        ];
        return {
          ...s,
          status: 'created' as ShipmentStatus,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );

    if (count > 0) {
      showToast(`🎉 تم تأكيد وموافقة جميع الطلبات المعلّقة (${count} أوردر) بنجاح!`);
    } else {
      showToast('لا توجد أوردرات بانتظار موافقة الأدمن حالياً');
    }
  };

  // Update Status Handler
  const handleUpdateStatus = (shipmentId: string, newStatus: ShipmentStatus, note?: string) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: newStatus,
            title:
              newStatus === 'created'
                ? 'تم تأكيد واعتماد الشحنة'
                : newStatus === 'pending_approval'
                ? 'بانتظار موافقة الأدمن'
                : newStatus === 'delivered'
                ? 'تم التسليم بنجاح وتحصيل المبلغ'
                : newStatus === 'partial_delivery'
                ? 'استلام جزئي من العميل وتحصيل المبلغ'
                : newStatus === 'refused'
                ? 'رفض الاستلام من العميل'
                : newStatus === 'out_for_delivery'
                ? 'خرجت للتسليم مع المندوب'
                : newStatus === 'failed_attempt'
                ? 'محاولة تسليم غير ناجحة'
                : newStatus === 'in_hub'
                ? 'وصلت المستودع الرئيسي'
                : 'تحديث حالة الشحنة',
            description: note || 'تم التحديث بواسطة نظام A&Mshipping الإداري',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            actorRole: currentRole === 'courier' ? 'courier' : 'system',
          },
        ];

        // Adjust wallet if delivered or partial delivery
        if ((newStatus === 'delivered' || newStatus === 'partial_delivery') && (s.status !== 'delivered' && s.status !== 'partial_delivery')) {
          setWallet((w) => ({
            ...w,
            availableBalance: w.availableBalance + s.financials.netPayout,
            pendingCod: Math.max(0, w.pendingCod - s.financials.codAmount),
          }));
        }

        return {
          ...s,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      })
    );

    // Also update current active detail modal if open
    if (selectedDetailShipment && selectedDetailShipment.id === shipmentId) {
      setSelectedDetailShipment((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(`تم تحديث حالة الشحنة ${shipmentId} إلى ${newStatus}`);
  };

  // Assign Courier Handler
  const handleAssignCourier = (shipmentId: string, courier: CourierInfo) => {
    let targetShipmentObj: Shipment | undefined;

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const nowFormatted = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const updatedStatus: ShipmentStatus = s.status === 'created' || s.status === 'in_hub' ? 'out_for_delivery' : s.status;

        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: updatedStatus,
            title: `تم تعيين المندوب ${courier.name}`,
            description: `تم إسناد الشحنة رسمياً للمندوب ${courier.name} (${courier.phone}) للمتابعة والتسليم`,
            timestamp: nowFormatted,
            actorRole: 'hub' as const,
          },
        ];

        const updatedShipment: Shipment = {
          ...s,
          assignedCourier: courier,
          status: updatedStatus,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };

        targetShipmentObj = updatedShipment;
        return updatedShipment;
      })
    );

    // Get the updated shipment info
    const shipmentData = targetShipmentObj || shipments.find((s) => s.id === shipmentId);

    if (shipmentData) {
      const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const newNotification: CourierNotification = {
        id: `notif-${Date.now()}`,
        courierId: courier.id,
        courierName: courier.name,
        shipmentId: shipmentData.id,
        trackingNumber: shipmentData.trackingNumber,
        recipientName: shipmentData.recipient.name,
        governorate: shipmentData.recipient.governorate,
        city: shipmentData.recipient.city,
        streetAddress: shipmentData.recipient.streetAddress,
        codAmount: shipmentData.financials.codAmount,
        createdAt: new Date().toISOString(),
        timestamp: nowTime,
        read: false,
      };

      setCourierNotifications((prev) => [newNotification, ...prev]);
      setActiveCourierToast(newNotification);
    }

    showToast(`🚚 تم إسناد الشحنة ${shipmentId} للكابتن ${courier.name} وإرسال إشعار فوري له!`);
  };

  const handleOpenCourierAppFromToast = (courierId: string, shipmentId: string) => {
    setCurrentRole('courier');
    setActiveTab('courier_app');
    setActiveCourierIdInApp(courierId);
    setActiveTargetShipmentId(shipmentId);
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    setCourierNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Payout Request Handler
  const handleRequestPayout = (amount: number, method: string) => {
    setWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - amount),
      totalPaidOut: prev.totalPaidOut + amount,
    }));
    showToast(`تم تحويل مبلغ ${amount.toLocaleString()} ج.م بنجاح عبر ${method}`);
  };

  // Admin CRUD Handlers
  const handleAddUser = (user: UserSession) => {
    setUsers((prev) => [...prev, user]);
    showToast(`✅ تم إضافة الحساب ${user.name} بنجاح`);
  };

  const handleUpdateUser = (updatedUser: UserSession) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast(`✏️ تم تحديث بيانات الحساب ${updatedUser.name}`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('🗑️ تم حذف الحساب من النظام');
  };

  const handleAddCourier = (courier: CourierInfo) => {
    setCouriers((prev) => [...prev, courier]);
    showToast(`🚚 تم إضافة الكابتن ${courier.name} بنجاح`);
  };

  const handleUpdateCourier = (updatedCourier: CourierInfo) => {
    setCouriers((prev) => prev.map((c) => (c.id === updatedCourier.id ? updatedCourier : c)));
    showToast(`✏️ تم تحديث بيانات الكابتن ${updatedCourier.name}`);
  };

  const handleDeleteCourier = (courierId: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== courierId));
    showToast('🗑️ تم حذف المندوب من النظام');
  };

  const handleAddHub = (hub: HubInfo) => {
    setHubs((prev) => [...prev, hub]);
    showToast(`🏢 تم إضافة مستودع / فرع ${hub.name}`);
  };

  const handleUpdateHub = (updatedHub: HubInfo) => {
    setHubs((prev) => prev.map((h) => (h.id === updatedHub.id ? updatedHub : h)));
    showToast(`✏️ تم تحديث بيانات الفرع ${updatedHub.name}`);
  };

  const handleDeleteHub = (hubId: string) => {
    setHubs((prev) => prev.filter((h) => h.id !== hubId));
    showToast('🗑️ تم حذف المستودع من النظام');
  };

  const handleUpdateGovernorateRate = (code: string, baseRate: number, additionalKgRate: number) => {
    setGovernorates((prev) =>
      prev.map((g) => (g.code === code ? { ...g, baseRate, additionalKgRate } : g))
    );
    showToast(`💰 تم تحديث تسعيرة الشحن للمحافظة`);
  };

  const handleUpdateWallet = (updatedWallet: MerchantWallet) => {
    setWallet(updatedWallet);
    showToast('💳 تم تحديث أرصدة المحفظة وقيم COD');
  };

  const handleClearAllShipments = () => {
    setShipments([]);
    showToast('🗑️ تم مسح جميع الشحنات والبوليصات بالكامل من النظام');
  };

  // Clear All Data Handler
  const handleClearAllData = () => {
    setShipments([]);
    setWallet({
      ...INITIAL_MERCHANT_WALLET,
      availableBalance: 0,
      pendingCod: 0,
      totalPaidOut: 0,
    });
    setCourierNotifications([]);
    setUsers([]);
    showToast('🗑️ تم مسح كافة الشحنات والحسابات والمحفظة بنجاح');
  };

  // Restore Demo Data Handler
  const handleRestoreDemoData = () => {
    setShipments(INITIAL_SHIPMENTS);
    setWallet(INITIAL_MERCHANT_WALLET);
    showToast('🔄 تمت استعادة البيانات التجريبية الافتراضية بنجاح');
  };

  const handleHeaderSearchTracking = (trackingNum: string) => {
    setPublicSearchTrackNum(trackingNum);
    setCurrentRole('public_tracker');
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-red-50/30 text-slate-900 font-sans flex flex-col antialiased selection:bg-red-500 selection:text-white relative overflow-x-hidden" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white mr-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Courier Notification Toast Floating Alert */}
      <CourierNotificationToast
        notification={activeCourierToast}
        onClose={() => setActiveCourierToast(null)}
        onOpenCourierApp={handleOpenCourierAppFromToast}
      />

      {/* Navigation Header - Rendered only when user is logged in */}
      {currentUser && (
        <Header
          currentRole={currentRole}
          onRoleChange={(role) => {
            setCurrentRole(role);
            if (role === 'courier') {
              setActiveTab('courier_app');
            } else if (role === 'public_tracker') {
              setActiveTab('tracking');
            } else {
              setActiveTab('shipments');
            }
          }}
          onOpenCreateModal={() => {
            setIsCreateModalOpen(true);
          }}
          onSearchTracking={handleHeaderSearchTracking}
          merchantWallet={wallet}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
          }}
          onClearData={handleClearAllData}
          currentUser={currentUser}
          onOpenLogin={() => setActiveTab('login')}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {!currentUser ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onGuestTrack={handleGuestTrackFromLogin}
            currentRole={currentRole}
            systemUsers={users}
          />
        ) : currentUser.role === 'courier' ? (
          <CourierAppView
            shipments={shipments}
            onUpdateStatus={handleUpdateStatus}
            notifications={courierNotifications}
            selectedCourierId={activeCourierIdInApp}
            targetShipmentId={activeTargetShipmentId}
            onMarkNotificationRead={handleMarkNotificationRead}
            currentUser={currentUser}
          />
        ) : currentUser.role === 'merchant' ? (
          <>
            {(activeTab === 'shipments' || activeTab === 'login' || activeTab === 'admin_panel' || activeTab === 'courier_app') && (
              <ShipmentsList
                shipments={shipments}
                onOpenDetailModal={(s) => setSelectedDetailShipment(s)}
                onOpenPrintModal={(s) => setSelectedPrintShipment(s)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onAssignCourier={handleAssignCourier}
                onClearAllData={handleClearAllData}
                onApproveShipment={handleApproveShipment}
                onApproveAllPending={handleApproveAllPending}
                currentRole="merchant"
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView wallet={wallet} shipments={shipments} onRequestPayout={handleRequestPayout} />
            )}

            {activeTab === 'analytics' && <AnalyticsView shipments={shipments} />}

            {activeTab === 'calculator' && <RateCalculatorView governorates={governorates} />}

            {activeTab === 'tracking' && (
              <PublicTrackingView shipments={shipments} initialTrackingNumber={publicSearchTrackNum} />
            )}
          </>
        ) : (
          <>
            {activeTab === 'login' && (
              <LoginView
                onLoginSuccess={handleLoginSuccess}
                onGuestTrack={handleGuestTrackFromLogin}
                currentRole={currentRole}
                systemUsers={users}
              />
            )}

            {activeTab === 'shipments' && (
              <ShipmentsList
                shipments={shipments}
                onOpenDetailModal={(s) => setSelectedDetailShipment(s)}
                onOpenPrintModal={(s) => setSelectedPrintShipment(s)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onAssignCourier={handleAssignCourier}
                onClearAllData={handleClearAllData}
                onApproveShipment={handleApproveShipment}
                onApproveAllPending={handleApproveAllPending}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'admin_panel' && (
              <AdminPanelView
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                couriers={couriers}
                onAddCourier={handleAddCourier}
                onUpdateCourier={handleUpdateCourier}
                onDeleteCourier={handleDeleteCourier}
                hubs={hubs}
                onAddHub={handleAddHub}
                onUpdateHub={handleUpdateHub}
                onDeleteHub={handleDeleteHub}
                governorates={governorates}
                onUpdateGovernorateRate={handleUpdateGovernorateRate}
                wallet={wallet}
                onUpdateWallet={handleUpdateWallet}
                shipments={shipments}
                onClearAllShipments={handleClearAllShipments}
                onClearAllData={handleClearAllData}
                onApproveShipment={handleApproveShipment}
                onApproveAllPending={handleApproveAllPending}
              />
            )}

            {activeTab === 'courier_app' && (
              <CourierAppView
                shipments={shipments}
                onUpdateStatus={handleUpdateStatus}
                notifications={courierNotifications}
                selectedCourierId={activeCourierIdInApp}
                targetShipmentId={activeTargetShipmentId}
                onMarkNotificationRead={handleMarkNotificationRead}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'tracking' && (
              <PublicTrackingView shipments={shipments} initialTrackingNumber={publicSearchTrackNum} />
            )}

            {activeTab === 'wallet' && (
              <WalletView wallet={wallet} shipments={shipments} onRequestPayout={handleRequestPayout} />
            )}

            {activeTab === 'analytics' && <AnalyticsView shipments={shipments} />}

            {activeTab === 'calculator' && <RateCalculatorView governorates={governorates} />}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateShipment={handleCreateShipment}
        governorates={governorates}
        hubs={hubs}
        currentRole={currentRole}
      />

      <ShipmentDetailModal
        shipment={selectedDetailShipment}
        onClose={() => setSelectedDetailShipment(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignCourier={handleAssignCourier}
        onOpenPrintModal={(s) => {
          setSelectedDetailShipment(null);
          setSelectedPrintShipment(s);
        }}
      />

      <WaybillPrintModal
        shipment={selectedPrintShipment}
        onClose={() => setSelectedPrintShipment(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/am_shipping_new_logo_1785454536501.jpg"
              alt="A&M Shipping Logo"
              className="w-6 h-6 rounded-md object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <span className="font-black text-slate-900">A&M<span className="text-red-600">shipping</span></span>
            <span>© 2026 جميع الحقوق محفوظة لشركة A&Mshipping للشحن واللوجستيات</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>الخط الساخن: 19001</span>
            <span>•</span>
            <span>amshipping.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
