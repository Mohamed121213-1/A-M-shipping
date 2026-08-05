import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ShipmentsList } from './components/ShipmentsList';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { ShipmentDetailModal } from './components/ShipmentDetailModal';
import { WaybillPrintModal } from './components/WaybillPrintModal';
import { CourierAppView } from './components/CourierAppView';
import { PublicTrackingView } from './components/PublicTrackingView';
import { WalletView } from './components/WalletView';
import { ReturnsAccountingView } from './components/ReturnsAccountingView';
import { AnalyticsView } from './components/AnalyticsView';
import { RateCalculatorView } from './components/RateCalculatorView';
import { LoginView, createSessionUser } from './components/LoginView';
import { AdminPanelView } from './components/AdminPanelView';
import { supabase, isSupabaseConfigured, mapSupabaseUserToSession } from './lib/supabase';
import { syncEngine } from './lib/syncEngine';

import { Shipment, AppUserRole, MerchantWallet, ShipmentStatus, CourierInfo, CourierNotification, UserSession, HubInfo, GovernorateRate } from './types';
import { INITIAL_SHIPMENTS, INITIAL_MERCHANT_WALLET, BOSTA_COURIERS, BOSTA_HUBS, EGYPT_GOVERNORATES, INITIAL_USERS } from './data/mockData';
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
  const [users, setUsers] = useState<UserSession[]>(() => {
    const saved = loadLocalState<UserSession[]>('bosta_users', []);
    return saved && saved.length > 0 ? saved : INITIAL_USERS;
  });

  const [couriers, setCouriers] = useState<CourierInfo[]>(() => {
    const saved = loadLocalState<CourierInfo[]>('bosta_couriers', []);
    if (saved && saved.length > 0) {
      return saved.map((c, idx) => ({
        ...c,
        id: c.id || `cour-${Date.now()}-${idx}`,
      }));
    }
    return BOSTA_COURIERS;
  });

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

  // Courier Notification System State
  const [courierNotifications, setCourierNotifications] = useState<CourierNotification[]>(() =>
    loadLocalState<CourierNotification[]>('bosta_courier_notifications', [])
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

  useEffect(() => {
    localStorage.setItem('bosta_courier_notifications', JSON.stringify(courierNotifications));
  }, [courierNotifications]);

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
      if (incoming.notifications && Array.isArray(incoming.notifications)) {
        setCourierNotifications(incoming.notifications);
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
    notifications: CourierNotification[];
  }>) => {
    syncEngine.broadcastState({
      shipments: overrideState?.shipments || shipments,
      wallet: overrideState?.wallet || wallet,
      users: overrideState?.users || users,
      couriers: overrideState?.couriers || couriers,
      hubs: overrideState?.hubs || hubs,
      governorates: overrideState?.governorates || governorates,
      notifications: overrideState?.notifications || courierNotifications,
    });
  };

  // Automatically broadcast whenever core operational data updates
  useEffect(() => {
    broadcastDataChange();
  }, [shipments, wallet, users, couriers, hubs, governorates, courierNotifications]);

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

  // Data Isolation: Filter shipments based on logged in user's role and identity
  const userShipments = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') {
      return shipments;
    }

    if (currentUser.role === 'merchant') {
      const storeName = currentUser.storeName?.trim().toLowerCase();
      const userName = currentUser.name?.trim().toLowerCase();
      const userPhone = currentUser.phone?.trim();

      return shipments.filter((s) => {
        const sStore = s.sender?.storeName?.trim().toLowerCase();
        const sContact = s.sender?.contactName?.trim().toLowerCase();
        const sPhone = s.sender?.phone?.trim();

        if (storeName && sStore && (sStore === storeName || sStore.includes(storeName) || storeName.includes(sStore))) {
          return true;
        }
        if (userName && (sContact === userName || sContact?.includes(userName) || (sStore && sStore === userName))) {
          return true;
        }
        if (userPhone && sPhone && sPhone === userPhone) {
          return true;
        }
        if (s.sender?.contactName === currentUser.name) return true;

        return false;
      });
    }

    if (currentUser.role === 'courier') {
      const courierName = currentUser.name?.trim().toLowerCase();
      const courierPhone = currentUser.phone?.trim();

      return shipments.filter((s) => {
        if (!s.assignedCourier) return false;
        const cId = s.assignedCourier.id;
        const cName = s.assignedCourier.name?.trim().toLowerCase();
        const cPhone = s.assignedCourier.phone?.trim();

        if (currentUser.id && cId === currentUser.id) return true;
        if (courierName && cName && (cName === courierName || cName.includes(courierName) || courierName.includes(cName))) return true;
        if (courierPhone && cPhone && cPhone === courierPhone) return true;

        return false;
      });
    }

    if (currentUser.role === 'hub_manager') {
      const hubName = currentUser.hubName?.trim().toLowerCase() || 'المستودع الرئيسي';
      return shipments.filter((s) => {
        const sHub = s.assignedHub?.trim().toLowerCase() || 'المستودع الرئيسي';
        return sHub === hubName;
      });
    }

    return shipments;
  }, [shipments, currentUser]);

  // Merchant Wallet scoped calculation
  const userWallet = useMemo(() => {
    if (!currentUser || currentUser.role !== 'merchant') {
      return wallet;
    }
    let totalCOD = 0;
    let pendingCOD = 0;
    let collectedCOD = 0;

    userShipments.forEach((s) => {
      const amount = s.codAmount || 0;
      totalCOD += amount;
      if (s.status === 'delivered' || s.status === 'partial_delivery') {
        collectedCOD += amount;
      } else if (['created', 'pickup_requested', 'picked_up', 'in_hub', 'out_for_delivery'].includes(s.status)) {
        pendingCOD += amount;
      }
    });

    return {
      totalCod: totalCOD,
      availableBalance: collectedCOD,
      pendingCod: pendingCOD,
      lastPayoutDate: wallet.lastPayoutDate,
      bankAccount: wallet.bankAccount,
      instapayAddress: wallet.instapayAddress,
      vodafoneCash: wallet.vodafoneCash,
    };
  }, [wallet, userShipments, currentUser]);

  // Auth handlers
  const handleLoginSuccess = (user: UserSession) => {
    const userId = user.id || `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullUser: UserSession = { ...user, id: userId };

    setCurrentUser(fullUser);
    setCurrentRole(fullUser.role);

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === fullUser.id || (u.phone && u.phone === fullUser.phone) || (u.email && u.email === fullUser.email));
      if (!exists) return [...prev, fullUser];
      return prev.map((u) => (u.id === fullUser.id || (u.phone && u.phone === fullUser.phone) ? { ...u, ...fullUser } : u));
    });

    if (fullUser.role === 'courier') {
      const courierObj: CourierInfo = {
        id: fullUser.id,
        name: fullUser.name,
        phone: fullUser.phone,
        vehicle: fullUser.courierVehicle === 'سيارة فان' ? 'van' : 'motocycle',
        assignedHub: fullUser.hubName || 'المستودع الرئيسي',
        rating: 5.0,
        activeShipmentsCount: 0,
        codCollectedToday: 0,
        photoUrl: fullUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullUser.name)}&background=2563eb&color=ffffff`,
      };

      setCouriers((prev) => {
        const exists = prev.some((c) => c.id === courierObj.id || (c.phone && c.phone === courierObj.phone));
        if (!exists) return [...prev, courierObj];
        return prev.map((c) => (c.id === courierObj.id || (c.phone && c.phone === courierObj.phone) ? { ...c, ...courierObj } : c));
      });

      setActiveTab('courier_app');
    } else if (fullUser.role === 'public_tracker') {
      setActiveTab('tracking');
    } else {
      setActiveTab('shipments');
    }
    showToast(`🔑 تم تسجيل الدخول بنجاح كـ ${fullUser.name}`);
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

  // Courier Reports "No Response" (مبيردش)
  const handleReportNoResponse = (shipmentId: string, courierNote?: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    let trackingNum = '';

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;
        trackingNum = s.trackingNumber;

        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: s.status,
            title: '📞 تنبيه من المندوب: العميل لا يرد على الهاتف',
            description: courierNote || 'قام المندوب بمحاولة الاتصال بالعميل ولم يقم بالرد. تم إرسال تنبيه للتاجر للتواصل معه.',
            timestamp: timeStr,
            actorRole: 'courier' as const,
          },
        ];

        return {
          ...s,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
          noResponseDetails: {
            isNoResponse: true,
            reportedAt: timeStr,
            courierNote: courierNote || 'العميل لا يرد على اتصال المندوب',
            merchantResponse: undefined,
          },
        };
      })
    );

    showToast(`📞 تم إرسال تنبيه للتاجر أن العميل لا يرد على البوليصة ${trackingNum || shipmentId}!`);
  };

  // Merchant Responds to "No Response" (رد / كلمه)
  const handleMerchantRespondNoResponse = (shipmentId: string, merchantNote: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    let targetTracking = '';
    let courierToNotifyId = '';
    let courierToNotifyName = '';
    let recipientName = '';
    let gov = '';
    let city = '';
    let cod = 0;

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        targetTracking = s.trackingNumber;
        courierToNotifyId = s.assignedCourier?.id || 'all';
        courierToNotifyName = s.assignedCourier?.name || 'الكابتن';
        recipientName = s.recipient.name;
        gov = s.recipient.governorate;
        city = s.recipient.city;
        cod = s.financials.codAmount;

        const updatedTimeline = [
          ...s.timeline,
          {
            id: `tl-${Date.now()}`,
            status: s.status,
            title: '💬 رد التاجر للمندوب',
            description: `التاجر تواصل مع العميل وأفاد: "${merchantNote}"`,
            timestamp: timeStr,
            actorRole: 'merchant' as const,
          },
        ];

        return {
          ...s,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
          noResponseDetails: {
            isNoResponse: true,
            reportedAt: s.noResponseDetails?.reportedAt || timeStr,
            courierNote: s.noResponseDetails?.courierNote,
            merchantResponse: {
              contacted: true,
              responseNote: merchantNote,
              respondedAt: timeStr,
            },
          },
        };
      })
    );

    // Send notification to Courier
    if (courierToNotifyId) {
      const newNotification: CourierNotification = {
        id: `notif-${Date.now()}`,
        courierId: courierToNotifyId,
        courierName: courierToNotifyName,
        shipmentId: shipmentId,
        trackingNumber: targetTracking,
        recipientName: recipientName,
        governorate: gov,
        city: city,
        codAmount: cod,
        createdAt: new Date().toISOString(),
        timestamp: timeStr,
        read: false,
      };

      setCourierNotifications((prev) => [newNotification, ...prev]);
      setActiveCourierToast(newNotification);
    }

    showToast(`💬 تم إرسال رد التاجر إلى المندوب بنجاح للشحنة ${targetTracking}!`);
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
    const userId = user.id || `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullUser: UserSession = { ...user, id: userId };
    setUsers((prev) => [...prev, fullUser]);
    if (fullUser.role === 'courier') {
      const courierObj: CourierInfo = {
        id: fullUser.id,
        name: fullUser.name,
        phone: fullUser.phone,
        vehicle: fullUser.courierVehicle === 'سيارة فان' ? 'van' : 'motocycle',
        assignedHub: fullUser.hubName || 'المستودع الرئيسي',
        rating: 5.0,
        activeShipmentsCount: 0,
        codCollectedToday: 0,
        photoUrl: fullUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullUser.name)}&background=2563eb&color=ffffff`,
      };
      setCouriers((prev) => {
        if (prev.some((c) => c.id === courierObj.id || (c.phone && c.phone === courierObj.phone))) {
          return prev.map((c) => (c.id === courierObj.id || (c.phone && c.phone === courierObj.phone) ? { ...c, ...courierObj } : c));
        }
        return [...prev, courierObj];
      });
    }
    showToast(`✅ تم إضافة الحساب ${fullUser.name} بنجاح`);
  };

  const handleUpdateUser = (updatedUser: UserSession) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (updatedUser.role === 'courier') {
      setCouriers((prev) =>
        prev.map((c) =>
          c.id === updatedUser.id || c.phone === updatedUser.phone
            ? {
                ...c,
                name: updatedUser.name,
                phone: updatedUser.phone,
                vehicle: updatedUser.courierVehicle === 'سيارة فان' ? 'van' : 'motocycle',
                assignedHub: updatedUser.hubName || 'المستودع الرئيسي',
              }
            : c
        )
      );
    }
    showToast(`✏️ تم تحديث بيانات الحساب ${updatedUser.name}`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setCouriers((prev) => prev.filter((c) => c.id !== userId));
    showToast('🗑️ تم حذف الحساب من النظام');
  };

  const handleAddCourier = (courier: CourierInfo) => {
    const courierId = courier.id || `cour-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullCourier: CourierInfo = { ...courier, id: courierId };

    setCouriers((prev) => {
      const exists = prev.some((c) => c.id === courierId || c.phone === fullCourier.phone);
      if (exists) {
        return prev.map((c) => (c.id === courierId || c.phone === fullCourier.phone ? { ...c, ...fullCourier } : c));
      }
      return [...prev, fullCourier];
    });

    const courierUser: UserSession = {
      id: courierId,
      name: fullCourier.name,
      email: `${courierId}@am-shipping.eg`,
      phone: fullCourier.phone,
      role: 'courier',
      avatarUrl: fullCourier.photoUrl,
      courierVehicle: fullCourier.vehicle === 'motocycle' ? 'دراجة نارية' : 'سيارة فان',
      hubName: fullCourier.assignedHub,
    };

    setUsers((prev) => {
      if (prev.some((u) => u.id === courierId || u.phone === fullCourier.phone)) {
        return prev.map((u) => (u.id === courierId || u.phone === fullCourier.phone ? { ...u, ...courierUser } : u));
      }
      return [...prev, courierUser];
    });

    showToast(`🚚 تم إضافة الكابتن ${fullCourier.name} بنجاح وربطه بحسابات لوحة التحكم`);
  };

  const handleUpdateCourier = (updatedCourier: CourierInfo) => {
    const courierId = updatedCourier.id || `cour-${Date.now()}`;
    const fullCourier = { ...updatedCourier, id: courierId };
    setCouriers((prev) => prev.map((c) => (c.id === courierId || c.phone === fullCourier.phone ? fullCourier : c)));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === courierId || u.phone === fullCourier.phone
          ? {
              ...u,
              name: fullCourier.name,
              phone: fullCourier.phone,
              courierVehicle: fullCourier.vehicle === 'motocycle' ? 'دراجة نارية' : 'سيارة فان',
              hubName: fullCourier.assignedHub,
            }
          : u
      )
    );
    showToast(`✏️ تم تحديث بيانات الكابتن ${fullCourier.name}`);
  };

  const handleDeleteCourier = (courierId: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== courierId));
    setUsers((prev) => prev.filter((u) => u.id !== courierId));
    showToast('🗑️ تم حذف المندوب من النظام لوحة التحكم');
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

  const handleUpdateGovernorateRate = (
    updatedGov: GovernorateRate | GovernorateRate[] | string,
    baseRate?: number,
    additionalKgRate?: number
  ) => {
    if (Array.isArray(updatedGov)) {
      setGovernorates(updatedGov);
      showToast('💰 تم تحديث أسعار الشحن لجميع المحافظات بنجاح');
    } else if (typeof updatedGov === 'object') {
      setGovernorates((prev) => {
        const exists = prev.some((g) => g.code === updatedGov.code);
        if (exists) {
          return prev.map((g) => (g.code === updatedGov.code ? updatedGov : g));
        }
        return [...prev, updatedGov];
      });
      showToast(`💰 تم تحديث سعر الشحن لمحافظة ${updatedGov.nameAr}`);
    } else {
      setGovernorates((prev) =>
        prev.map((g) => (g.code === updatedGov ? { ...g, baseRate: baseRate!, additionalKgRate: additionalKgRate! } : g))
      );
      showToast(`💰 تم تحديث تسعيرة الشحن للمحافظة`);
    }
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
            shipments={userShipments}
            onUpdateStatus={handleUpdateStatus}
            onReportNoResponse={handleReportNoResponse}
            notifications={courierNotifications}
            selectedCourierId={activeCourierIdInApp}
            targetShipmentId={activeTargetShipmentId}
            onMarkNotificationRead={handleMarkNotificationRead}
            currentUser={currentUser}
            couriers={couriers}
          />
        ) : currentUser.role === 'merchant' ? (
          <>
            {(activeTab === 'shipments' || activeTab === 'login' || activeTab === 'admin_panel' || activeTab === 'courier_app') && (
              <ShipmentsList
                shipments={userShipments}
                onOpenDetailModal={(s) => setSelectedDetailShipment(s)}
                onOpenPrintModal={(s) => setSelectedPrintShipment(s)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onMerchantRespondNoResponse={handleMerchantRespondNoResponse}
                onAssignCourier={handleAssignCourier}
                onClearAllData={handleClearAllData}
                onApproveShipment={handleApproveShipment}
                onApproveAllPending={handleApproveAllPending}
                currentRole="merchant"
                couriers={couriers}
                systemUsers={users}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView wallet={userWallet} shipments={userShipments} onRequestPayout={handleRequestPayout} couriers={couriers} systemUsers={users} currentUser={currentUser} />
            )}

            {activeTab === 'returns' && (
              <ReturnsAccountingView shipments={userShipments} systemUsers={users} currentUser={currentUser} />
            )}

            {activeTab === 'analytics' && <AnalyticsView shipments={userShipments} />}

            {activeTab === 'calculator' && <RateCalculatorView governorates={governorates} />}

            {activeTab === 'tracking' && (
              <PublicTrackingView shipments={userShipments} initialTrackingNumber={publicSearchTrackNum} />
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
                onMerchantRespondNoResponse={handleMerchantRespondNoResponse}
                onAssignCourier={handleAssignCourier}
                onClearAllData={handleClearAllData}
                onApproveShipment={handleApproveShipment}
                onApproveAllPending={handleApproveAllPending}
                currentRole={currentRole}
                couriers={couriers}
                systemUsers={users}
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
                onReportNoResponse={handleReportNoResponse}
                notifications={courierNotifications}
                selectedCourierId={activeCourierIdInApp}
                targetShipmentId={activeTargetShipmentId}
                onMarkNotificationRead={handleMarkNotificationRead}
                currentUser={currentUser}
                couriers={couriers}
              />
            )}

            {activeTab === 'tracking' && (
              <PublicTrackingView shipments={shipments} initialTrackingNumber={publicSearchTrackNum} />
            )}

            {activeTab === 'wallet' && (
              <WalletView wallet={wallet} shipments={shipments} onRequestPayout={handleRequestPayout} couriers={couriers} systemUsers={users} />
            )}

            {activeTab === 'returns' && (
              <ReturnsAccountingView shipments={shipments} systemUsers={users} currentUser={currentUser} />
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
        systemUsers={users}
        currentUser={currentUser}
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
