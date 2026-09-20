import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  User, 
  LogOut,
  Copy,
  Check
} from 'lucide-react';
import { UserSession } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onPasswordChanged: (updatedUser: UserSession, newPassword: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPasswordChanged,
}) => {
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showExistingAccountPassword, setShowExistingAccountPassword] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const actualCurrentPassword = currentUser.password || '123456';

  const handleCopyCurrentPassword = () => {
    navigator.clipboard.writeText(actualCurrentPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Validation
    if (!currentPasswordInput.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور الحالية للتأكيد');
      return;
    }

    if (currentPasswordInput.trim() !== actualCurrentPassword) {
      setErrorMessage('❌ كلمة المرور الحالية غير صحيحة. يرجى التأكد من كلمة المرور المدخلة.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('يرجى كتابة كلمة المرور الجديدة');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMessage('⚠️ كلمة المرور الجديدة يجب ألا تقل عن 4 أحرف أو أرقام لمنع الأخطاء');
      return;
    }

    if (newPassword.trim() === actualCurrentPassword) {
      setErrorMessage('⚠️ كلمة المرور الجديدة مطابقة لكلمة المرور الحالية. يرجى إدخال كلمة مرور مختلفة.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('❌ كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call server endpoint to persist password change permanently
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          newPassword: newPassword.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل تحديث كلمة المرور على الخادم');
      }

      const updatedUser: UserSession = {
        ...currentUser,
        password: newPassword.trim(),
      };

      setSuccessMessage('✅ تم تغيير كلمة المرور بنجاح وحفظها بشكل دائم في النظام! جاري تسجيل الخروج لإعادة الدخول بكلمة المرور الجديدة...');

      // Notify parent & force re-login after 1.8 seconds so user can read the success message
      setTimeout(() => {
        onPasswordChanged(updatedUser, newPassword.trim());
      }, 1800);

    } catch (err: any) {
      console.error('Password change error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-right dir-rtl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                تغيير كلمة المرور
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  أمان الحساب
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديث وحفظ كلمة سر الحساب وإلزام تسجيل الدخول بها
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Current Account Card & Existing Password Display */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=dc2626&color=ffffff`}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-black text-sm text-slate-900 leading-tight">{currentUser.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.phone}</p>
                </div>
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
                {currentUser.role === 'admin' && 'أدمن النظام'}
                {currentUser.role === 'merchant' && 'تاجر متجر'}
                {currentUser.role === 'courier' && 'مندوب توصيل'}
                {currentUser.role === 'hub_manager' && 'مدير مستودع'}
                {currentUser.role === 'public_tracker' && 'متتبع'}
              </span>
            </div>

            {/* Displaying Existing Current Password */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-600">كلمة المرور الحالية للحساب:</span>
                <span className="font-mono font-black text-slate-900 text-sm tracking-wider px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200/60">
                  {showExistingAccountPassword ? actualCurrentPassword : '••••••••'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowExistingAccountPassword(!showExistingAccountPassword)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title={showExistingAccountPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showExistingAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCurrentPassword}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="نسخ كلمة المرور الحالية"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3 text-red-700 text-xs font-bold animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Current Password */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                تأكيد كلمة المرور الحالية <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية للحساب"
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Input 2: New Password */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                كلمة المرور الجديدة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (4 رموز على الأقل)"
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                نصيحة: يمكنك استخدام حروف أو أرقام سهلة التذكر لك ولن يتم تسجيل الدخول بعدها إلا بها.
              </p>
            </div>

            {/* Input 3: Confirm New Password */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور الجديدة للتأكيد"
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed font-bold flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>تأكيد الأمان الفوري:</strong> عند حفظ كلمة المرور، سيتم تحديث قاعدة البيانات فوراً ومسح الجلسة القديمة وإلزامك بتسجيل الدخول بكلمة المرور الجديدة.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري حفظ وتثبيت كلمة المرور...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>تأكيد وتغيير كلمة المرور الآن</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
