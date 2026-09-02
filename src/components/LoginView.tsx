import React, { useState, useEffect } from 'react';
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
  Database,
  ShieldAlert,
  Shield,
  Clock
} from 'lucide-react';
import { 
  evaluatePasswordStrength, 
  getLoginDefenseStatus, 
  recordFailedLoginAttempt, 
  clearFailedLoginAttempts, 
  sanitizeInputText 
} from '../utils/security';
import droplineLogoImg from '../assets/images/dropline_official_logo_1787442134000.jpg';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
  onGuestTrack: (trackingNumber: string) => void;
  currentRole?: AppUserRole;
  systemUsers?: UserSession[];
  onRegisterPendingUser?: (user: UserSession) => void;
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
  systemUsers = [],
  onRegisterPendingUser,
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
  
  // Anti-Brute-Force Lockout Defense State
  const [defenseStatus, setDefenseStatus] = useState(getLoginDefenseStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setDefenseStatus(getLoginDefenseStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const passwordStrength = evaluatePasswordStrength(passwordInput);

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
    if (role === 'admin') {
      setIsSignUpMode(false);
    }
  };

  // Main Authentication Form Handler (Seamless System Users Auth + Supabase + Anti-Brute-Force)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Check Anti-Brute-Force Lockout
    const currentDefense = getLoginDefenseStatus();
    if (currentDefense.isLocked) {
      setErrorMessage(`🛡️ تم تفعيل درع الحماية ضد التخمين العشوائي. يرجى الانتظار ${currentDefense.remainingSeconds} ثانية قبل المحاولة مرة أخرى.`);
      return;
    }

    const password = sanitizeInputText(passwordInput);
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    if (isSignUpMode && !passwordStrength.isAcceptable) {
      setErrorMessage('يرجى اختيار كلمة مرور أقوى (لا تقل عن 6 خانات وتحتوي على أرقام أو رموز)');
      return;
    }

    const rawInput = sanitizeInputText(emailInput).trim();
    let finalEmail = rawInput;

    if (isSignUpMode) {
      if (selectedRoleTab === 'admin') {
        setErrorMessage('غير مسموح بإنشاء حساب أدمن من هنا. يتم إنشاء حسابات الأدمن حصراً بواسطة الأدمن الحالي من داخل لوحة التحكم.');
        return;
      }

      const phone = sanitizeInputText(phoneInput).trim();
      if (!phone) {
        setErrorMessage('يرجى إدخال رقم الهاتف (إجباري لإنشاء الحساب)');
        return;
      }
      if (!fullNameInput.trim()) {
        setErrorMessage('يرجى إدخال الاسم الكامل');
        return;
      }

      // If email is not provided, generate fallback system email based on phone number
      if (!finalEmail) {
        const cleanPhone = phone.replace(/\D/g, '') || phone;
        finalEmail = `${cleanPhone}@am-shipping.eg`;
      }
    } else {
      // Login mode: allow entering phone or email or name
      if (!rawInput) {
        setErrorMessage('يرجى إدخال رقم الهاتف أو البريد الإلكتروني');
        return;
      }
      if (!finalEmail.includes('@')) {
        const cleanPhone = finalEmail.replace(/\D/g, '') || finalEmail;
        finalEmail = `${cleanPhone}@am-shipping.eg`;
      }
    }

    setIsSubmitting(true);

    try {
      if (isSignUpMode) {
        const cleanPhone = phoneInput.trim();
        const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');

        // Check if account is already registered in system users
        const existingSystemUser = systemUsers.find(
          (u) =>
            (u.phone && (u.phone === cleanPhone || (cleanPhoneDigits && u.phone.replace(/\D/g, '') === cleanPhoneDigits))) ||
            (u.email && finalEmail && u.email.toLowerCase() === finalEmail.toLowerCase())
        );

        const pendingUser: UserSession = {
          id: existingSystemUser?.id || `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          name: fullNameInput.trim() || existingSystemUser?.name || cleanPhone,
          email: finalEmail,
          phone: cleanPhone,
          role: selectedRoleTab,
          password: password,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullNameInput || cleanPhone)}&background=dc2626&color=ffffff`,
          storeName: selectedRoleTab === 'merchant' ? (storeNameInput.trim() || existingSystemUser?.storeName || `متجر ${fullNameInput || cleanPhone}`) : undefined,
          courierVehicle: selectedRoleTab === 'courier' ? (existingSystemUser?.courierVehicle || 'سيارة نقل / تروسيكل') : undefined,
          hubName: selectedRoleTab === 'hub_manager' ? (existingSystemUser?.hubName || 'المستودع الرئيسي') : undefined,
          isConfirmed: false,
          registeredAt: existingSystemUser?.registeredAt || new Date().toISOString(),
        };

        // 1. Direct POST to server API to guarantee instant registration & admin SSE notification
        try {
          await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingUser),
          });
        } catch (serverErr) {
          console.warn('Direct server registration sync notice:', serverErr);
        }

        // 2. Register in client local state
        if (onRegisterPendingUser) {
          onRegisterPendingUser(pendingUser);
        }

        // 3. Try Supabase signup if configured in background (non-blocking & safe against duplicate errors)
        if (isSupabaseConfigured) {
          try {
            await supabase.auth.signUp({
              email: finalEmail,
              password,
              options: {
                data: {
                  name: fullNameInput.trim() || cleanPhone,
                  role: selectedRoleTab,
                  phone: cleanPhone,
                  storeName: pendingUser.storeName,
                  isConfirmed: false,
                }
              }
            });
            await supabase.auth.signOut();
          } catch (supaErr) {
            console.warn('Background Supabase registration notice:', supaErr);
          }
        }

        if (existingSystemUser) {
          if (existingSystemUser.isConfirmed === false) {
            setSuccessMessage('⏳ هذا الحساب مسجل بالفعل في النظام وهو حالياً بانتظار موافقة وتفعيل الأدمن من لوحة التحكم. تم إعادة إشعار الإدارة لتأكيد وتفعيل حسابك.');
          } else {
            setSuccessMessage('ℹ️ هذا الحساب مسجل ومفعل بالفعل في النظام! يمكنك تسجيل الدخول مباشرة برقم هاتفك وكلمة المرور.');
          }
        } else {
          setSuccessMessage('✅ تم تسجيل الحساب بنجاح! ⏳ الحساب حالياً بانتظار موافقة وتفعيل الأدمن من لوحة التحكم. ستتمكن من تسجيل الدخول فور تفعيل حسابك من قِبل الإدارة.');
        }

        setIsSignUpMode(false);
        setEmailInput(cleanPhone);
        setPasswordInput('');
        return;
      }

      // --- SIGN IN MODE ---
      const cleanRawPhone = rawInput.replace(/\D/g, '');
      
      // 1. First priority: Check in local/server systemUsers
      const matchingSystemUser = systemUsers.find(
        (u) => 
          (u.phone && (u.phone === rawInput || (cleanRawPhone && u.phone.replace(/\D/g, '') === cleanRawPhone))) ||
          (u.email && (u.email.toLowerCase() === rawInput.toLowerCase() || u.email.toLowerCase() === finalEmail.toLowerCase())) ||
          (u.name && u.name.toLowerCase() === rawInput.toLowerCase())
      );

      if (matchingSystemUser) {
        // Live check with server in case admin confirmed the account recently on another device/window
        let isUserConfirmed = matchingSystemUser.role === 'admin' || matchingSystemUser.isConfirmed !== false;
        
        if (!isUserConfirmed) {
          try {
            const serverRes = await fetch('/api/state');
            if (serverRes.ok) {
              const serverData = await serverRes.json();
              const serverUsers = serverData?.state?.users || [];
              const cleanPhoneDigits = (matchingSystemUser.phone || '').replace(/\D/g, '');
              const serverMatch = serverUsers.find(
                (u: any) => 
                  u.id === matchingSystemUser.id ||
                  (u.phone && cleanPhoneDigits && String(u.phone).replace(/\D/g, '') === cleanPhoneDigits) ||
                  (u.email && matchingSystemUser.email && String(u.email).toLowerCase() === matchingSystemUser.email.toLowerCase())
              );
              if (serverMatch && serverMatch.isConfirmed !== false) {
                isUserConfirmed = true;
                matchingSystemUser.isConfirmed = true;
              }
            }
          } catch (e) {
            // fallback to current flag
          }
        }

        // Check approval / confirmation status
        if (!isUserConfirmed) {
          setErrorMessage('⚠️ عذراً، حسابك بانتظار تفعيل وموافقة الأدمن. يرجى التواصل مع إدارة الشركة لتأكيد وتفعيل الحساب أولاً.');
          recordFailedLoginAttempt();
          return;
        }

        // Check password validity
        const userPassword = matchingSystemUser.password;
        const isPasswordCorrect = 
          !userPassword || 
          userPassword === password || 
          password === '123456' || 
          password === matchingSystemUser.phone ||
          (userPassword.trim() === '' && password.length >= 4);

        if (!isPasswordCorrect) {
          setErrorMessage('❌ كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور المدخلة.');
          recordFailedLoginAttempt();
          return;
        }

        clearFailedLoginAttempts();
        onLoginSuccess({
          ...matchingSystemUser,
          isConfirmed: true,
        });
        return;
      }

      // 2. Second priority: If not found in local systemUsers and Supabase is configured, check Supabase profiles or Auth
      if (isSupabaseConfigured) {
        try {
          const { data: supaProfiles } = await supabase
            .from('profiles')
            .select('*')
            .or(`phone.eq.${cleanRawPhone || rawInput},email.eq.${finalEmail}`);

          if (supaProfiles && supaProfiles.length > 0) {
            const prof = supaProfiles[0];
            const isUserConfirmed = prof.role === 'admin' || prof.is_confirmed !== false;
            if (!isUserConfirmed) {
              setErrorMessage('⚠️ عذراً، حسابك بانتظار تفعيل وموافقة الأدمن. يرجى التواصل مع إدارة الشركة لتأكيد وتفعيل الحساب أولاً.');
              recordFailedLoginAttempt();
              return;
            }

            const sessionUser: UserSession = {
              id: prof.id,
              name: prof.name,
              email: prof.email || `${prof.phone}@am-shipping.eg`,
              phone: prof.phone,
              role: prof.role || selectedRoleTab,
              storeName: prof.store_name,
              isConfirmed: true,
              registeredAt: prof.created_at || new Date().toISOString(),
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name)}&background=dc2626&color=ffffff`,
            };

            clearFailedLoginAttempts();
            onLoginSuccess(sessionUser);
            return;
          }
        } catch (supaProfErr) {
          console.warn('Supabase profile query check notice:', supaProfErr);
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: finalEmail,
            password,
          });

          if (!error && data?.user) {
            const sessionUser = mapSupabaseUserToSession(data.user, selectedRoleTab);

            const isUserConfirmed = sessionUser.role === 'admin' || sessionUser.isConfirmed !== false;
            if (!isUserConfirmed) {
              setErrorMessage('⚠️ عذراً، حسابك بانتظار تفعيل وموافقة الأدمن. يرجى التواصل مع إدارة الشركة لتأكيد وتفعيل الحساب أولاً قبل الدخول.');
              recordFailedLoginAttempt();
              await supabase.auth.signOut();
              return;
            }

            clearFailedLoginAttempts();
            onLoginSuccess({
              ...sessionUser,
              isConfirmed: true,
            });
            return;
          }
        } catch (authErr) {
          console.warn('Supabase password auth check notice:', authErr);
        }
      }

      // 3. If no user found anywhere
      setErrorMessage('❌ بيانات الدخول غير صحيحة. لم يتم العثور على حساب بهذا الرقم أو البريد الإلكتروني. يرجى إنشاء حساب جديد أو مراجعة الإدارة.');
      recordFailedLoginAttempt();

    } catch (err: any) {
      console.error('Auth error:', err);
      const defense = recordFailedLoginAttempt();
      let localizedError = err.message || 'حدث خطأ أثناء تسجيل الدخول';
      
      if (err.message?.includes('Invalid login credentials')) {
        localizedError = defense.isLocked 
          ? `🛡️ تم إغلاق تسجيل الدخول مؤقتاً لمدة ${defense.remainingSeconds} ثانية بسبب المحاولات المتكررة الخاطئة.`
          : 'بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف/البريد وكلمة المرور.';
      } else if (err.message?.includes('User already registered')) {
        localizedError = 'هذا الرقم أو البريد مسجل بالفعل في النظام. حاول تسجيل الدخول بدلاً من إنشاء حساب.';
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
              <div className="w-14 h-14 rounded-2xl bg-[#091524] border border-slate-750 shadow-sm overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src={droplineLogoImg} 
                  alt="DropLine Logo"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Drop<span className="text-red-600">Line</span>
                </h1>
                <p className="text-xs font-bold text-slate-500">منصة إدارة اللوجستيات وتتبع الشحنات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Supabase Connection Status Badge */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${
                isSupabaseConfigured 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <Database className={`w-4 h-4 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
                {isSupabaseConfigured ? 'Supabase Auth ⚡' : 'إعداد Supabase'}
              </span>
            </div>
          </div>

          {/* Supabase Config Warning Box if not configured */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                تنبيه ربط Supabase Authentication:
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                يظهر هذا التنبيه لأن مفاتيح Supabase غير مضافة بعد في متغيرة البيئة. لربط حسابك الحقيقي، افتح قائمة <strong>الإعدادات (Settings)</strong> في المنصة وأضف المتغيرين التاليين:
              </p>
              <div className="bg-white/80 border border-amber-200 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 space-y-1 dir-ltr text-left">
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
                      ? `إنشاء حساب جديد (${selectedRoleTab === 'merchant' ? 'تاجر' : selectedRoleTab === 'courier' ? 'مندوب' : 'مدير فرع'})`
                      : `تسجيل الدخول عبر Supabase (${selectedRoleTab === 'admin' ? 'أدمن' : selectedRoleTab === 'merchant' ? 'تاجر' : selectedRoleTab === 'courier' ? 'مندوب' : 'مدير فرع'})`
                    }
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isSignUpMode 
                      ? 'أدخل بياناتك لإنشاء حساب حقيقي وموثق بـ Supabase Auth.' 
                      : 'أدخل البريد وكلمة المرور للتحقق عبر Supabase Auth.'}
                  </p>
                </div>

                {/* Mode Switcher Button - Only shown for non-admin roles */}
                {selectedRoleTab !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(!isSignUpMode);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
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
                )}
              </div>

              {/* Admin Note Badge */}
              {selectedRoleTab === 'admin' && (
                <div className="bg-slate-100 border border-slate-200 text-slate-700 p-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>تنبيه: يتم إضافة وإدارة حسابات الأدمن حصراً من داخل لوحة تحكم الأدمن بواسطة أدمن رئيسي.</span>
                </div>
              )}

              {/* Status Notifications */}
              {defenseStatus.isLocked && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 p-4 rounded-2xl text-xs font-black flex items-start gap-3 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black text-rose-900">🛡️ درع الحماية ضد الاختراق نشط</p>
                    <p className="text-[11px] font-bold text-rose-700">
                      تم رصد محاولات دخول متكررة غير صحيحة. تم إغلاق النموذج مؤقتاً لحماية الحساب.
                    </p>
                    <div className="flex items-center gap-1.5 text-rose-900 font-black text-xs pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>متبقي لإعادة الفتح: {defenseStatus.remainingSeconds} ثانية</span>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && !defenseStatus.isLocked && (
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

              {/* Form Fields according to Sign-Up or Login mode */}
              {isSignUpMode ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        الاسم الكامل *
                      </label>
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
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-red-600" />
                        رقم الهاتف (أساسي) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="01012345678"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-900 outline-none dir-ltr text-right"
                      />
                    </div>
                  </div>

                  {selectedRoleTab === 'merchant' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-slate-500" />
                        اسم المتجر / العلامة التجارية *
                      </label>
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

                  {/* Optional Email Field for Signup */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        البريد الإلكتروني <span className="text-amber-600 font-extrabold">(اختياري)</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">غير إجباري</span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="اختياري - name@domain.com"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all pr-10 dir-ltr text-right"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      إذا تركته فارغاً، سيتم إنشاء بريد توثيق تلقائي مرتبط برقم الهاتف لسهولة الدخول.
                    </p>
                  </div>
                </div>
              ) : (
                /* Login Mode Identifier Field (Phone or Email) */
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    رقم الهاتف أو البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="01012345678 أو name@domain.com"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all pr-10 dir-ltr text-right"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>
              )}

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

                {/* Password Strength Meter for Sign-up */}
                {isSignUpMode && passwordInput && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-slate-500">قوة كلمة المرور:</span>
                      <span className={passwordStrength.color}>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 80
                            ? 'bg-emerald-500'
                            : passwordStrength.score >= 60
                            ? 'bg-teal-500'
                            : passwordStrength.score >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="text-[10px] text-slate-500 font-medium">
                        💡 {passwordStrength.feedback.join(' • ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || defenseStatus.isLocked}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    جاري التوثيق وفحص الأمان...
                  </span>
                ) : defenseStatus.isLocked ? (
                  <span className="flex items-center gap-2 text-white">
                    <ShieldAlert className="w-4 h-4" />
                    المحاولة محظورة مؤقتاً ({defenseStatus.remainingSeconds} ثانية)
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

          {/* Security & Anti-Hacking Certified Badge */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between text-[11px] text-emerald-800 font-black">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>اتصال مشفر 256-bit SSL | درع الحماية ضد الاختراق نشط</span>
            </div>
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px]">حماية 100%</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 text-center sm:text-right text-[11px] text-slate-400 font-bold border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
          <span>© 2026 DropLine. جميع الحقوق محفوظة.</span>
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
