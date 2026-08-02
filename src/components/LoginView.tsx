import React, { useState } from 'react';
import { AppUserRole, UserSession } from '../types';
import { 
  Lock, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Store, 
  Truck, 
  Building2, 
  SearchCode, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  HelpCircle,
  Package,
  Globe,
  KeyRound
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
  onGuestTrack: (trackingNumber: string) => void;
  currentRole?: AppUserRole;
  systemUsers?: UserSession[];
}

// Default user profile generator based on user input
export const createSessionUser = (identifier: string, role: AppUserRole, existingUsers?: UserSession[]): UserSession => {
  if (existingUsers && existingUsers.length > 0) {
    const matched = existingUsers.find(
      u => u.role === role && (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier || u.name.toLowerCase() === identifier.toLowerCase())
    );
    if (matched) return matched;
  }
  
  const isEmail = identifier.includes('@');
  const displayName = isEmail 
    ? identifier.split('@')[0] 
    : (identifier || 'مستخدم جديدة');

  return {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: displayName,
    email: isEmail ? identifier : `${identifier}@am-shipping.eg`,
    phone: isEmail ? '01000000000' : identifier,
    role: role,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=dc2626&color=ffffff`,
    storeName: role === 'merchant' ? `متجر ${displayName}` : undefined,
    courierVehicle: role === 'courier' ? 'سيارة نقل / تروسيكل' : undefined,
    hubName: role === 'hub_manager' ? 'المستودع الرئيسي' : undefined,
  };
};

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onGuestTrack,
  currentRole = 'merchant',
  systemUsers = []
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<AppUserRole>(
    currentRole === 'public_tracker' ? 'merchant' : currentRole
  );

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [guestTrackingInput, setGuestTrackingInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState(false);

  // Handle Tab Change
  const handleTabChange = (role: AppUserRole) => {
    setSelectedRoleTab(role);
    setErrorMessage(null);
    setIdentifier('');
    setPassword('');
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد أو رقم الهاتف');
      return;
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const user = createSessionUser(identifier.trim(), selectedRoleTab, systemUsers);
      onLoginSuccess(user);
    }, 600);
  };

  // Handle Guest Tracking Submit
  const handleGuestTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestTrackingInput.trim()) {
      onGuestTrack(guestTrackingInput.trim());
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-900/95 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl my-4 grid grid-cols-1 lg:grid-cols-12 text-right dir-rtl">
      {/* Right Form Section */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Header Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center p-1">
                <img 
                  src="/src/assets/images/am_shipping_new_logo_1785454536501.jpg" 
                  alt="A&M Shipping Logo"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  A&M <span className="text-red-600">shipping</span>
                </h1>
                <p className="text-xs font-bold text-slate-500">منصة إدارة اللوجستيات وتتبع الشحنات</p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              اتصال آمن ومشفر
            </span>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 block">
              اختر نوع الحساب وأدخل بيانات الدخول:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  selectedRoleTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>أدمن النظام</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('merchant')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  selectedRoleTab === 'merchant'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>التجار</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('courier')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  selectedRoleTab === 'courier'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>المندوب</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('hub_manager')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  selectedRoleTab === 'hub_manager'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>المستودع</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('public_tracker')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 col-span-2 sm:col-span-1 ${
                  selectedRoleTab === 'public_tracker'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <SearchCode className="w-3.5 h-3.5 text-amber-400" />
                <span>تتبع زائر</span>
              </button>
            </div>
          </div>

          {/* IF ROLE IS PUBLIC TRACKER */}
          {selectedRoleTab === 'public_tracker' ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <SearchCode className="w-5 h-5 text-red-600" />
                  تتبع الشحنة بدون تسجيل دخول
                </h3>
                <p className="text-xs text-slate-500">
                  أدخل رقم البوليصة لمتابعة حالة الطرد وموقعه الحالي بدون الحاجة لإنشاء حساب.
                </p>
              </div>

              <form onSubmit={handleGuestTrackingSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={guestTrackingInput}
                    onChange={(e) => setGuestTrackingInput(e.target.value)}
                    placeholder="مثال: BST-804101"
                    className="w-full bg-white border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-3 text-sm font-extrabold dir-ltr text-right pr-11 text-slate-900 outline-none transition-all"
                  />
                  <Package className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <SearchCode className="w-4 h-4" />
                  تتبع الشحنة الآن
                </button>
              </form>
            </div>
          ) : (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">
                  {selectedRoleTab === 'admin' && 'تسجيل دخول أدمن إدارة النظام'}
                  {selectedRoleTab === 'merchant' && 'تسجيل دخول التجار والمتاجر'}
                  {selectedRoleTab === 'courier' && 'دخول كابتن توصيل الشحنات'}
                  {selectedRoleTab === 'hub_manager' && 'لوحة قيادة مدير المستودع والفرع'}
                </h2>
                <p className="text-xs text-slate-500">
                  أدخل بيانات اعتمادك للوصول إلى لوحة التحكم الخاصة بك.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                  {errorMessage}
                </div>
              )}

              {/* Identifier Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {selectedRoleTab === 'admin' && 'البريد الإلكتروني للأدمن'}
                  {selectedRoleTab === 'merchant' && 'البريد الإلكتروني أو كود المتجر'}
                  {selectedRoleTab === 'courier' && 'رقم الهاتف أو كود المندوب'}
                  {selectedRoleTab === 'hub_manager' && 'البريد الوظيفي لمدير المستودع'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRoleTab === 'admin'
                        ? 'admin@am-shipping.eg'
                        : selectedRoleTab === 'merchant' 
                        ? 'merchant@elegance-store.eg' 
                        : selectedRoleTab === 'courier' 
                        ? '01098765432' 
                        : 'sherif.hub@am-shipping.eg'
                    }
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all pr-10"
                  />
                  {selectedRoleTab === 'merchant' || selectedRoleTab === 'hub_manager' || selectedRoleTab === 'admin' ? (
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all pr-10 pl-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                  />
                  تذكر بيانات الدخول على هذا الجهاز
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    جاري التحقق والدخول...
                  </span>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-8 text-center sm:text-right text-[11px] text-slate-400 font-bold border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
          <span>© 2026 A&M shipping. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">الشروط والأحكام</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">سياسة الخصوصية</span>
          </div>
        </div>
      </div>

      {/* Left Marketing & Stats Showcase Banner */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 lg:p-12 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-800 relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            الجيل الجديد من حلول اللوجستيات
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              سرعة فائقة في توصيل الشحنات وتحصيل الأموال
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              نظام متكامل يربط المتاجر الإلكترونية بمندوبي التوصيل ومستودعات الفرز المجهزة بأحدث التقنيات في كافة محافظات الجمهورية.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs p-4 rounded-2xl space-y-1">
              <div className="text-xl sm:text-2xl font-black text-white">27</div>
              <div className="text-[11px] font-bold text-slate-400">محافظة مغطاة بالكامـل</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs p-4 rounded-2xl space-y-1">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">99.4%</div>
              <div className="text-[11px] font-bold text-slate-400">نسبة التسليم الناجح</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs p-4 rounded-2xl space-y-1">
              <div className="text-xl sm:text-2xl font-black text-amber-400">فوري</div>
              <div className="text-[11px] font-bold text-slate-400">تحويل كاش COD يومياً</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs p-4 rounded-2xl space-y-1">
              <div className="text-xl sm:text-2xl font-black text-red-400">24h</div>
              <div className="text-[11px] font-bold text-slate-400">دعم موظفين مباشر</div>
            </div>
          </div>

          {/* Value Bullet Points */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              تراكينج حي ومباشر لكل طرد مع تحديث الحالة فوراً
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              إمكانية فتح المعاينة للعميل والتسليم الفوري
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              طباعة بولايص شحن بباركود QR فوري
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span>خدمة العملاء: 19882</span>
          </div>
          <span className="text-emerald-400 font-mono">Status: Online 🟢</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-right dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-red-600" />
                استعادة كلمة المرور
              </h3>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setResetSuccessMsg(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-900">تم إرسال رابط إعادة التعيين</h4>
                <p className="text-xs text-emerald-700">
                  يرجى مراجعة البريد الإلكتروني أو الرسائل النصية لاتمام العملية.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetSuccessMsg(false);
                  }}
                  className="mt-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  حسناً، فهمت
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSuccessMsg(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-500">
                  أدخل بريدك الإلكتروني أو رقم الهاتف المسجل لتلقي رمز إعـادة الضبط.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">البريد الإلكتروني / الهاتف</label>
                  <input
                    type="text"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-red-600 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl"
                  >
                    إرسال رابط الضبط
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
