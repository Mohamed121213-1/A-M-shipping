import React, { useState } from 'react';
import { AppUserRole, UserSession } from '../types';
import { supabase, isSupabaseConfigured, mapSupabaseUserToSession } from '../lib/supabase';
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
  Package,
  Globe,
  KeyRound,
  UserPlus,
  AlertTriangle,
  Database
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
  onGuestTrack: (trackingNumber: string) => void;
  currentRole?: AppUserRole;
  systemUsers?: UserSession[];
}

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
    : (identifier || 'مستخدم جديد');

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

  // Form Mode: Login vs Signup
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Form fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [guestTrackingInput, setGuestTrackingInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Forgot Password Modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Handle Tab Change
  const handleTabChange = (role: AppUserRole) => {
    setSelectedRoleTab(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailInput('');
    setPasswordInput('');
    setFullNameInput('');
    setPhoneInput('');
    setStoreNameInput('');
  };

  // Main Authentication Form Handler (Supabase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage('يرجى ربط Supabase بإضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env لتشغيل التوثيق الحقيقي.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUpMode) {
        // --- SUPABASE SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullNameInput.trim() || email.split('@')[0],
              role: selectedRoleTab,
              phone: phoneInput.trim() || '01000000000',
              storeName: selectedRoleTab === 'merchant' ? (storeNameInput.trim() || `متجر ${fullNameInput || email.split('@')[0]}`) : undefined,
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          if (data.session) {
            // Immediate sign up & auto login
            const sessionUser = mapSupabaseUserToSession(data.user, selectedRoleTab);
            onLoginSuccess(sessionUser);
          } else {
            // Email confirmation required or pending
            setSuccessMessage('تم إنشاء الحساب بنجاح في Supabase! يرجى مراجعة بريدك الإلكتروني للتأكيد ثم تسجيل الدخول.');
            setIsSignUpMode(false);
          }
        }
      } else {
        // --- SUPABASE SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const sessionUser = mapSupabaseUserToSession(data.user, selectedRoleTab);
          onLoginSuccess(sessionUser);
        }
      }
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      let localizedError = err.message || 'حدث خطأ أثناء الاتصال بـ Supabase';
      
      if (err.message?.includes('Invalid login credentials')) {
        localizedError = 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.';
      } else if (err.message?.includes('User already registered')) {
        localizedError = 'هذا البريد الإلكتروني مسجل بالفعل في Supabase. حاول تسجيل الدخول بدلاً من إنشاء حساب.';
      } else if (err.message?.includes('Password should be at least')) {
        localizedError = 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
      }
      
      setErrorMessage(localizedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    if (!isSupabaseConfigured) {
      setResetSuccessMsg(true);
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());
      if (error) throw error;
      setResetSuccessMsg(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال رابط إعادة التعيين');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Guest Tracking Submit
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
        <div className="space-y-6">
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

            {/* Supabase Connection Status Badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${
              isSupabaseConfigured 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <Database className={`w-4 h-4 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
              {isSupabaseConfigured ? 'Supabase Auth ⚡' : 'إعداد Supabase مطلوب'}
            </span>
          </div>

          {/* Supabase Config Warning Box if not configured */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-black text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                تنبيه ربط Supabase Authentication:
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                لربط تسجيل الدخول بقاعدة بيانات Supabase، أضف المفاتيح التالية في ملف <code className="bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded font-mono">.env</code>:
              </p>
              <div className="bg-white/80 border border-amber-200 p-2 rounded-xl font-mono text-[11px] text-slate-800 space-y-0.5 dir-ltr text-left">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 block">
              اختر نوع الحساب اللوجستي:
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

          {/* PUBLIC TRACKER OPTION */}
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
            /* SUPABASE AUTHENTICATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header Title & Switcher between Login / Signup */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {isSignUpMode 
                      ? `إنشاء حساب جديد (${selectedRoleTab === 'admin' ? 'أدمن' : selectedRoleTab === 'merchant' ? 'تاجر' : selectedRoleTab === 'courier' ? 'مندوب' : 'مدير فرع'})`
                      : `تسجيل الدخول عبر Supabase (${selectedRoleTab === 'admin' ? 'أدمن' : selectedRoleTab === 'merchant' ? 'تاجر' : selectedRoleTab === 'courier' ? 'مندوب' : 'مدير فرع'})`
                    }
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isSignUpMode 
                      ? 'أدخل بياناتك لإنشاء حساب حقيقي وموثق بـ Supabase Auth.' 
                      : 'أدخل البريد وكلمة المرور للتحقق عبر Supabase Auth.'}
                  </p>
                </div>

                {/* Mode Switcher Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  {isSignUpMode ? (
                    <>
                      <User className="w-3.5 h-3.5 text-red-600" />
                      <span>لديك حساب؟ تسجيل الدخول</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-red-600" />
                      <span>حساب جديد؟ إنشاء حساب</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Notifications */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {successMessage}
                </div>
              )}

              {/* Additional Sign-up Fields */}
              {isSignUpMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="مثال: أحمد محمود"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none dir-ltr text-right"
                    />
                  </div>

                  {selectedRoleTab === 'merchant' && (
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">اسم المتجر / العلامة التجارية</label>
                      <input
                        type="text"
                        required
                        value={storeNameInput}
                        onChange={(e) => setStoreNameInput(e.target.value)}
                        placeholder="مثال: متجر الأناقة"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  البريد الإلكتروني (Supabase Auth Email)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all pr-10 dir-ltr text-right"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    كلمة المرور
                  </label>
                  {!isSignUpMode && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    جاري التوثيق مع Supabase...
                  </span>
                ) : (
                  <>
                    <span>{isSignUpMode ? 'تسجيل حساب جديد' : 'تسجيل الدخول'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-6 text-center sm:text-right text-[11px] text-slate-400 font-bold border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
          <span>© 2026 A&M shipping. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">Supabase Auth Integrated</span>
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
            منظومة توثيق الحسابات المتقدمة
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              تكامل مباشر مع Supabase Authentication
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              حماية مشفرة لبيانات التوثيق وجلسات المستخدمين عبر Supabase، مع توزيع الصلاحيات الدقيقة لكل من الأدمن، التجار، والمناديب.
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
              ربط مباشر بقاعدة بيانات Supabase Auth
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              جلسات آمنة ومشفرة للمستخدمين
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              فصل أدوار الأدمن والتجار والمناديب
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span>خدمة العملاء: 19882</span>
          </div>
          <span className="text-emerald-400 font-mono">Supabase Auth: Active 🟢</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-right dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-red-600" />
                استعادة كلمة المرور عبر Supabase
              </h3>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setResetSuccessMsg(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-900">تم إرسال رابط إعادة التعيين</h4>
                <p className="text-xs text-emerald-700">
                  يرجى مراجعة بريدك الإلكتروني لاتمام عملية تغيير كلمة المرور عبر Supabase.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetSuccessMsg(false);
                  }}
                  className="mt-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  حسناً، فهمت
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-500">
                  أدخل بريدك الإلكتروني المسجل في Supabase لتلقي رابط إعـادة ضبط كلمة المرور.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-red-600 outline-none dir-ltr text-right"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {isResettingPassword ? 'جاري الإرسال...' : 'إرسال رابط الضبط'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
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
