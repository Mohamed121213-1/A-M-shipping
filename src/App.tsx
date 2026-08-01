import React, { useState } from 'react';
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

import { Shipment, AppUserRole, MerchantWallet, ShipmentStatus, CourierInfo, CourierNotification, UserSession } from './types';
import { INITIAL_SHIPMENTS, INITIAL_MERCHANT_WALLET } from './data/mockData';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CourierNotificationToast } from './components/CourierNotificationToast';

export default function App() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [wallet, setWallet] = useState<MerchantWallet>({
    ...INITIAL_MERCHANT_WALLET,
    availableBalance: 0,
    pendingCod: 0,
    totalPaidOut: 0,
  });
  const [currentRole, setCurrentRole] = useState<AppUserRole>('merchant');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');

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

  const handleLogout = () => {
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

    const createdShipment: Shipment = {
      ...newShipmentData,
      id: trackingNo,
      trackingNumber: trackingNo,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'created',
          title: 'تم إنشاء بوليصة الشحن بنجاح',
          description: 'في انتظار مندوب الاستلام من المتجر',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          actorRole: 'merchant',
        },
      ],
    };

    setShipments((prev) => [createdShipment, ...prev]);

    // Update Wallet pending amount
    setWallet((prev) => ({
      ...prev,
      pendingCod: prev.pendingCod + createdShipment.financials.codAmount,
    }));

    showToast(`✨ تم إنشاء بوليصة الشحن رقم ${trackingNo} بنجاح!`);
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
              newStatus === 'delivered'
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
    showToast('🗑️ تم مسح كافة الشحنات وبيانات المحفظة بنجاح');
  };

  // Restore Demo Data Handler
  const handleRestoreDemoData = () => {
    setShipments(INITIAL_SHIPMENTS);
    setWallet(INITIAL_MERCHANT_WALLET);
   
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

      {/* Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'courier') {
            setCurrentUser(createSessionUser('مندوب التوصيل', 'courier'));
            setActiveTab('courier_app');
          } else if (role === 'public_tracker') {
            setCurrentUser(createSessionUser('زائر', 'public_tracker'));
            setActiveTab('tracking');
          } else if (role === 'hub_manager') {
            setCurrentUser(createSessionUser('مدير المستودع', 'hub_manager'));
            setActiveTab('shipments');
          } else {
            setCurrentUser(createSessionUser('التاجر', 'merchant'));
            setActiveTab('shipments');
          }
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onSearchTracking={handleHeaderSearchTracking}
        merchantWallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleRestoreDemoData}
        onClearData={handleClearAllData}
        currentUser={currentUser}
        onOpenLogin={() => setActiveTab('login')}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onGuestTrack={handleGuestTrackFromLogin}
            currentRole={currentRole}
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
            onRestoreDemoData={handleRestoreDemoData}
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
          />
        )}

        {activeTab === 'tracking' && (
          <PublicTrackingView shipments={shipments} initialTrackingNumber={publicSearchTrackNum} />
        )}

        {activeTab === 'wallet' && (
          <WalletView wallet={wallet} shipments={shipments} onRequestPayout={handleRequestPayout} />
        )}

        {activeTab === 'analytics' && <AnalyticsView shipments={shipments} />}

        {activeTab === 'calculator' && <RateCalculatorView />}
      </main>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateShipment={handleCreateShipment}
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
