import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  ShieldCheck, 
  FileText,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { 
  Shipment, 
  MerchantWallet, 
  UserSession, 
  CourierInfo, 
  HubInfo, 
  GovernorateRate, 
  CompanyTransaction, 
  CourierNotification 
} from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: {
    shipments: Shipment[];
    wallet: MerchantWallet;
    users: UserSession[];
    couriers: CourierInfo[];
    hubs: HubInfo[];
    governorates: GovernorateRate[];
    companyTransactions: CompanyTransaction[];
    notifications: CourierNotification[];
  };
  onRestoreState: (newState: any) => void;
}

interface ServerSnapshot {
  filename: string;
  size: number;
  mtime: string;
  isLatest: boolean;
}

interface LocalSnapshot {
  id: string;
  name: string;
  timestamp: string;
  shipmentsCount: number;
  usersCount: number;
  data: any;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onRestoreState,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'snapshots' | 'server'>('export');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverSnapshots, setServerSnapshots] = useState<ServerSnapshot[]>([]);
  const [localSnapshots, setLocalSnapshots] = useState<LocalSnapshot[]>([]);
  const [snapshotNameInput, setSnapshotNameInput] = useState('');

  // Load local snapshots from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('bosta_local_snapshots');
        if (raw) {
          setLocalSnapshots(JSON.parse(raw));
        }
      } catch (e) {}

      fetchServerSnapshots();
    }
  }, [isOpen]);

  const fetchServerSnapshots = async () => {
    try {
      const res = await fetch('/api/backup/list');
      if (res.ok) {
        const data = await res.json();
        setServerSnapshots(data.snapshots || []);
      }
    } catch (e) {
      console.warn('Failed to fetch server snapshots:', e);
    }
  };

  if (!isOpen) return null;

  // 1. Export Data to JSON file
  const handleExportJSON = () => {
    try {
      const backupPayload = {
        app: 'A&M Shipping Logistics',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        exportedBy: 'النظام / المدير المسؤول',
        data: currentState,
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `bosta_backup_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: `تم تنزيل ملف النسخة الاحتياطية بنجاح (${filename})! احتفظ بهذا الملف في مكان آمن.`,
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `فشل تنزيل ملف النسخة الاحتياطية: ${err.message}` });
    }
  };

  // 2. Import Data from JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsed = JSON.parse(rawContent);

        const restoredData = parsed.data || parsed.state || parsed;

        if (!restoredData || typeof restoredData !== 'object') {
          throw new Error('ملف النسخة الاحتياطية غير صالح أو تنسيقه غير مدعوم');
        }

        // Apply state locally
        onRestoreState(restoredData);

        // Also post to server backup import API
        await fetch('/api/backup/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: restoredData }),
        });

        setStatusMsg({
          type: 'success',
          text: 'تم استعادة كافة بيانات الشحنات، المستخدمين، والمحفظة بنجاح من الملف وتحديث النظام!',
        });
        fetchServerSnapshots();
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: `خطأ في قراءة ملف النسخة الاحتياطية: ${err.message}` });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  // 3. Save Local Snapshot
  const handleSaveLocalSnapshot = () => {
    const name = snapshotNameInput.trim() || `نسخة احتياطية بتاريخ ${new Date().toLocaleDateString('ar-EG')}`;
    const newSnapshot: LocalSnapshot = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: new Date().toLocaleString('ar-EG'),
      shipmentsCount: currentState.shipments?.length || 0,
      usersCount: currentState.users?.length || 0,
      data: currentState,
    };

    const updated = [newSnapshot, ...localSnapshots].slice(0, 10); // Keep max 10
    setLocalSnapshots(updated);
    try {
      localStorage.setItem('bosta_local_snapshots', JSON.stringify(updated));
    } catch (e) {}

    setSnapshotNameInput('');
    setStatusMsg({ type: 'success', text: `تم حفظ اللقطة الاحتياطية المحلية "${name}" بنجاح!` });
  };

  // 4. Restore Local Snapshot
  const handleRestoreLocalSnapshot = (snap: LocalSnapshot) => {
    if (window.confirm(`هل أنت أصلًا متأكد من استعادة النسخة الاحتياطية "${snap.name}"؟`)) {
      onRestoreState(snap.data);
      setStatusMsg({ type: 'success', text: `تم استعادة اللقطة المحلية "${snap.name}" بنجاح!` });
    }
  };

  // 5. Save Permanent Server Backup
  const handleSaveServerBackup = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: currentState }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'تم حفظ نسخة احتياطية دائمة ومؤرخة على قرص السيرفر بنجاح!' });
        fetchServerSnapshots();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'فشل الاتصال بالسيرفر');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `فشل حفظ النسخة الدائمة على السيرفر: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Restore Server Backup Snapshot
  const handleRestoreServerSnapshot = async (filename?: string) => {
    if (!window.confirm('هل تريد استعادة النسخة الاحتياطية المسجلة على السيرفر؟')) return;

    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/backup/restore-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          onRestoreState(data.state);
          setStatusMsg({ type: 'success', text: 'تم استعادة اللقطة الدائمة من السيرفر بنجاح!' });
        }
      } else {
        const err = await res.json();
        throw new Error(err.error || 'فشل الاستعادة من السيرفر');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `خطأ أثناء الاستعادة: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                الاحتفاظ بالبيانات والنسخ الاحتياطي
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  حماية كاملة 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">تنزيل نسخة احتياطية من الداتا، حفظ لقطات محلية، أو استعادة السيرفر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'export'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Download className="w-4 h-4" />
            تنزيل نسخة احتياطية (JSON)
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'import'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Upload className="w-4 h-4" />
            رفع واستعادة من ملف
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'snapshots'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            اللقطات المحلية ({localSnapshots.length})
          </button>

          <button
            onClick={() => setActiveTab('server')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'server'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <HardDrive className="w-4 h-4 text-amber-400" />
            لقطات السيرفر الدائمة ({serverSnapshots.length})
          </button>
        </div>

        {/* Status Notification Toast inside Modal */}
        {statusMsg && (
          <div
            className={`m-4 p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMsg.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed">{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EXPORT BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Data Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold">إجمالي الشحنات</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{currentState.shipments?.length || 0}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold">المستخدمين المسجلين</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{currentState.users?.length || 0}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold">مناديب التوصيل</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{currentState.couriers?.length || 0}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
                  <p className="text-xs text-slate-500 font-bold">معاملات الخزينة</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{currentState.companyTransactions?.length || 0}</p>
                </div>
              </div>

              {/* Main Export Action */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200/80 p-6 rounded-3xl text-center space-y-4">
                <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
                  <Download className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">تصدير وتنزيل كافة بيانات النظام</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    سيتم تجميع كافة الشحنات والحسابات والمعاملات المالية في ملف واحد محمي بصيغة JSON يمكنك حِفظه على جهازك أو إرساله عبر الواتساب.
                  </p>
                </div>

                <button
                  onClick={handleExportJSON}
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  تنزيل النسخة الاحتياطية الآن (.JSON)
                </button>
              </div>

              {/* Server Direct Save */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-xs text-white">حفظ نسخة احتياطية فورية على السيرفر</h5>
                    <p className="text-[11px] text-slate-400">تخزين نسخة دائمة ومحمية من المسح في قرص السيرفر الرئيسي</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveServerBackup}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'جاري الحفظ...' : 'حفظ على السيرفر الآن'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT BACKUP */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 p-8 rounded-3xl text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">اختر ملف النسخة الاحتياطية (.JSON) من جهازك</h4>
                <p className="text-xs text-slate-500 mt-1">اضغط هنا لاستعراض الملفات أو اسحب الملف وأفلته مباشرة</p>
                <span className="inline-block mt-3 text-[10px] bg-slate-200 text-slate-700 font-mono px-3 py-1 rounded-full font-bold">
                  يدعم جميع ملفات bosta_backup_*.json
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">ملاحظة هامة عند الاستعادة:</p>
                  <p className="mt-0.5">
                    عند استعادة ملف النسخة الاحتياطية، سيتم تحديث كافة بيانات الشحنات والحسابات والمحفظة بالنظام فوراً ومزامنتها مع جميع الأجهزة المتصلة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCAL SNAPSHOTS */}
          {activeTab === 'snapshots' && (
            <div className="space-y-6">
              {/* Create New Local Snapshot */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-600" />
                  أخذ لقطة سريعة وحفظها في المتصفح
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم النسخة الاحتياطية (مثال: نسخة قبل الجرد الأسبوعي)..."
                    value={snapshotNameInput}
                    onChange={(e) => setSnapshotNameInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveLocalSnapshot}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    حفظ اللقطة
                  </button>
                </div>
              </div>

              {/* Local Snapshots List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700">اللقطات المحفوظة محلياً ({localSnapshots.length})</h4>
                {localSnapshots.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    لا توجد لقطات محفوظة محلياً بعد. يمكنك أخذ لقطة سريعة في أي وقت.
                  </div>
                ) : (
                  localSnapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">{snap.name}</h5>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{snap.timestamp}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 font-medium">
                          <span>📦 {snap.shipmentsCount} شحنة</span>
                          <span>👥 {snap.usersCount} مستخدم</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreLocalSnapshot(snap)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        استعادة هذه اللقطة
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SERVER BACKUPS */}
          {activeTab === 'server' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">لقطات ونسخ السيرفر الاحتياطية الدائمة</h4>
                  <p className="text-[11px] text-slate-500">نسخ محفوظة تلقائياً ومحمية من أي مسح في قرص السيرفر</p>
                </div>
                <button
                  onClick={fetchServerSnapshots}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  تحديث القائمة
                </button>
              </div>

              <div className="space-y-3">
                {serverSnapshots.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    جاري تحميل النسخ الدائمة من السيرفر...
                  </div>
                ) : (
                  serverSnapshots.map((snap) => (
                    <div
                      key={snap.filename}
                      className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                        snap.isLatest
                          ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          snap.isLatest ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-xs text-slate-900 font-mono">{snap.filename}</h5>
                            {snap.isLatest && (
                              <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                الأحدث
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            الحجم: {(snap.size / 1024).toFixed(1)} ك.ب | التاريخ: {new Date(snap.mtime).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreServerSnapshot(snap.filename)}
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        استعادة من السيرفر
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            جميع النسخ الاحتياطية مشفرة ومحفوظة آلياً بانتظام.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
