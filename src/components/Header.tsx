import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Building2, 
  Search, 
  PlusCircle, 
  Wallet, 
  BarChart3, 
  Calculator, 
  SearchCode,
  CheckCircle2,
  Bell,
  RefreshCw,
  Trash2,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  RotateCcw,
  X,
  MapPin,
  DollarSign
} from 'lucide-react';
import { AppUserRole, MerchantWallet, UserSession, CourierNotification } from '../types';

interface HeaderProps {
  currentRole: AppUserRole;
  onRoleChange: (role: AppUserRole) => void;
  onOpenCreateModal: () => void;
  onSearchTracking: (trackingNum: string) => void;
  merchantWallet: MerchantWallet;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData?: () => void;
  onClearData?: () => void;
  currentUser?: UserSession | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  notifications?: CourierNotification[];
  onNotificationClick?: (shipmentId: string, notifId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenCreateModal,
  onSearchTracking,
  merchantWallet,
  activeTab,
  setActiveTab,
  onResetData,
  onClearData,
  currentUser,
  onOpenLogin,
  onLogout,
  notifications = [],
  onNotificationClick,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTracking(searchInput.trim());
    }
  };

  const handleNavClick = (tab: string) => {
    if (!currentUser && tab !== 'login' && tab !== 'tracking') {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Multi-Role Switcher */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            A&M shipping
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">تغطية شاملة لجميع المحافظات المصرية</span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            مزامنة البيانات بين جميع الأجهزة متصلة ⚡
          </span>
        </div>

        {/* Role Selector or User Role Badge */}
        {currentUser?.role === 'courier' ? (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-amber-400 text-xs font-bold">
            <Truck className="w-4 h-4" />
            <span>حساب كابتن توصيل ({currentUser.name})</span>
          </div>
        ) : currentUser?.role === 'merchant' ? (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold">
            <Building2 className="w-4 h-4 text-red-400" />
            <span>حساب التاجر ({currentUser.storeName || currentUser.name})</span>
          </div>
        ) : currentUser?.role === 'hub_manager' ? (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold">
            <Package className="w-4 h-4 text-amber-400" />
            <span>حساب مدير مستودع ({currentUser.hubName || currentUser.name})</span>
          </div>
        ) : currentUser?.role === 'admin' ? (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>أدمن النظام والتحكم الكامل ({currentUser.name})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 flex-wrap">
            <span className="text-slate-400 text-[11px] px-2 font-medium">عرض بصفة:</span>
            
            <button
              onClick={() => {
                onRoleChange('admin');
                if (!currentUser) {
                  onOpenLogin?.();
                } else {
                  setActiveTab('shipments');
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              أدمن النظام (Admin)
            </button>

            <button
              onClick={() => {
                onRoleChange('merchant');
                if (!currentUser) {
                  onOpenLogin?.();
                } else {
                  setActiveTab('shipments');
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'merchant'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              بوابة التجار (Merchant)
            </button>

            <button
              onClick={() => {
                onRoleChange('courier');
                if (!currentUser) {
                  onOpenLogin?.();
                } else {
                  setActiveTab('courier_app');
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'courier'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              تطبيق المندوب (Courier)
            </button>

            <button
              onClick={() => {
                onRoleChange('hub_manager');
                if (!currentUser) {
                  onOpenLogin?.();
                } else {
                  setActiveTab('shipments');
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'hub_manager'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              إدارة المستودعات (Hub)
            </button>

            <button
              onClick={() => {
                onRoleChange('public_tracker');
                if (!currentUser) {
                  onOpenLogin?.();
                } else {
                  setActiveTab('tracking');
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentRole === 'public_tracker'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <SearchCode className="w-3.5 h-3.5" />
              تتبع الشحنة
            </button>
          </div>
        )}
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab(currentUser ? (currentUser.role === 'courier' ? 'courier_app' : 'shipments') : 'login')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm shadow-slate-200 group-hover:scale-105 transition-transform flex items-center justify-center p-0.5">
              <img
                src="/src/assets/images/am_shipping_new_logo_1785454536501.jpg"
                alt="A&M Shipping Logo"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  A&M <span className="text-red-600">shipping</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">منصة الشحن واللوجستيات المتكاملة</p>
            </div>
          </div>

          {/* Quick Search Tracking Box */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative min-w-[280px]">
            <input
              type="text"
              placeholder="ابحث برقم البوليصة (مثال: BST-804101)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <button type="submit" className="absolute right-2.5 text-slate-400 hover:text-red-600">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Main Navigation Tabs */}
          {currentUser?.role === 'courier' ? (
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              <button
                onClick={() => handleNavClick('courier_app')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'courier_app'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-400" />
                تطبيق المندوب
              </button>
              <button
                onClick={() => handleNavClick('tracking')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tracking'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SearchCode className="w-4 h-4 text-slate-500" />
                تتبع شحنة
              </button>
            </nav>
          ) : currentRole !== 'public_tracker' && (
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
              {!currentUser && (
                <button
                  onClick={() => handleNavClick('login')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  الرئيسية
                </button>
              )}

              <button
                onClick={() => handleNavClick('shipments')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'shipments'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4 text-slate-500" />
                {currentUser?.role === 'merchant' ? 'شحنات متجري' : 'الشحنات'}
              </button>

              {(currentRole === 'merchant' || currentRole === 'admin') && (
                <button
                  onClick={() => handleNavClick('wallet')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'wallet'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-slate-500" />
                  المحفظة (COD)
                </button>
              )}

              {(currentRole === 'merchant' || currentRole === 'admin') && (
                <button
                  onClick={() => handleNavClick('returns')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'returns'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-red-500" />
                  حساب المرتجعات
                </button>
              )}

              {(currentRole === 'merchant' || currentRole === 'admin') && (
                <button
                  onClick={() => handleNavClick('company_treasury')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'company_treasury'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  خزينة الشركة (حساب الوارد والصادر)
                </button>
              )}

              {(currentRole === 'merchant' || currentRole === 'admin') && (
                <button
                  onClick={() => handleNavClick('analytics')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'analytics'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  التقارير
                </button>
              )}

              {currentRole === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin_panel')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'admin_panel'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-amber-700 hover:text-amber-900 bg-amber-50/80'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  لوحة تحكم الأدمن
                </button>
              )}

              {currentRole === 'admin' && (
                <button
                  onClick={() => handleNavClick('courier_app')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'courier_app'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-500" />
                  تطبيق المندوب
                </button>
              )}

              <button
                onClick={() => handleNavClick('calculator')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'calculator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4 text-slate-500" />
                حاسبة الأسعار
              </button>

              <button
                onClick={() => handleNavClick('tracking')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tracking'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SearchCode className="w-4 h-4 text-slate-500" />
                تتبع شحنة
              </button>
            </nav>
          )}

          {/* Smart System Notifications Bell */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="إشعارات وتحديثات الشحنات"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="font-extrabold text-xs text-white">إشعارات الشحنات الحية ({notifications.length})</h4>
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        لا توجد إشعارات مسجلة حالياً
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (onNotificationClick) {
                              onNotificationClick(n.shipmentId, n.id);
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            !n.read
                              ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-md'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-amber-400 font-mono">#{n.trackingNumber}</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-black/30 px-1.5 py-0.5 rounded">{n.timestamp}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-100">
                            {n.statusTitle || `تحديث بوليصة #${n.trackingNumber}`}
                          </p>
                          {n.statusNote && (
                            <p className="text-[11px] text-amber-200/90 font-medium mt-1 bg-black/30 p-1.5 rounded-lg border border-slate-700/50">
                              {n.statusNote}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            <span>العميل: {n.recipientName} ({n.governorate})</span>
                            <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
                              عرض وتظليل الشحنة ←
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Wallet Pill for Merchant */}
          {currentUser && currentRole === 'merchant' && (
            <div 
              onClick={() => handleNavClick('wallet')}
              className="cursor-pointer hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-emerald-600 leading-none">رصيد الكاش الجاهز</p>
                <p className="text-xs font-extrabold">{merchantWallet.availableBalance.toLocaleString()} ج.م</p>
              </div>
            </div>
          )}

          {/* Create Shipment CTA */}
          {currentUser && (currentRole === 'merchant' || currentRole === 'admin') && (
            <button
              onClick={onOpenCreateModal}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              إنشاء شحنة جديدة
            </button>
          )}

          {/* User Profile & Auth Section */}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  title="تغيير الحساب أو تسجيل الدخول بصفة أخرى"
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors text-right"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden xl:block">
                    <p className="text-[11px] font-extrabold text-slate-900 leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold">
                      {currentUser.role === 'admin' && 'أدمن النظام'}
                      {currentUser.role === 'merchant' && 'تاجر متجر'}
                      {currentUser.role === 'courier' && 'مندوب توصيل'}
                      {currentUser.role === 'hub_manager' && 'مدير مستودع'}
                      {currentUser.role === 'public_tracker' && 'زائر متتبع'}
                    </p>
                  </div>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="تسجيل الخروج"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-red-500" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
