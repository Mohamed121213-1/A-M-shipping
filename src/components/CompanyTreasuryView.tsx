import React, { useState, useMemo } from 'react';
import { CompanyTransaction, CompanyTransactionType, UserSession, CourierInfo } from '../types';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  CreditCard, 
  User, 
  X, 
  CheckCircle2, 
  Sparkles,
  PieChart
} from 'lucide-react';

interface CompanyTreasuryViewProps {
  transactions: CompanyTransaction[];
  onAddTransaction: (txn: Omit<CompanyTransaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction: (id: string, txn: Partial<CompanyTransaction>) => void;
  onDeleteTransaction: (id: string) => void;
  currentUser?: UserSession | null;
  couriers?: CourierInfo[];
}

export const CompanyTreasuryView: React.FC<CompanyTreasuryViewProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  currentUser,
  couriers = [],
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<CompanyTransaction | null>(null);

  // Form Fields State
  const [formType, setFormType] = useState<CompanyTransactionType>('income');
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('إيرادات شحن');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState<'cash' | 'bank_transfer' | 'vodafone_cash' | 'instapay' | 'check' | 'other'>('cash');
  const [formMerchant, setFormMerchant] = useState('');
  const [formCourier, setFormCourier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingTxn(null);
    setFormType('income');
    setFormTitle('');
    setFormAmount('');
    setFormCategory('إيرادات شحن');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('cash');
    setFormMerchant('');
    setFormCourier('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (txn: CompanyTransaction) => {
    setEditingTxn(txn);
    setFormType(txn.type);
    setFormTitle(txn.title);
    setFormAmount(txn.amount.toString());
    setFormCategory(txn.category);
    setFormDate(txn.date || new Date().toISOString().split('T')[0]);
    setFormPaymentMethod(txn.paymentMethod || 'cash');
    setFormMerchant(txn.relatedMerchant || '');
    setFormCourier(txn.relatedCourier || '');
    setFormNotes(txn.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || Number(formAmount) <= 0) {
      alert('يرجى إدخال بيان المعاملة والمبلغ بشكل صحيح');
      return;
    }

    const payload = {
      type: formType,
      title: formTitle.trim(),
      amount: Number(formAmount),
      category: formCategory,
      date: formDate,
      paymentMethod: formPaymentMethod,
      relatedMerchant: formMerchant.trim() || undefined,
      relatedCourier: formCourier.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdBy: currentUser?.name || 'الأدمن',
      updatedAt: new Date().toISOString(),
    };

    if (editingTxn) {
      onUpdateTransaction(editingTxn.id, payload);
    } else {
      onAddTransaction(payload);
    }

    setIsModalOpen(false);
  };

  // Categories list options
  const incomeCategories = ['إيرادات شحن', 'رسوم وخدمات', 'عمولات توصيل', 'تحصيل كاش COD', 'أرباح تسوية', 'إيرادات أخرى'];
  const expenseCategories = ['وقود ومحروقات', 'مستلزمات وتغليف', 'رواتب ومستحقات', 'إيجار ومرافق', 'صيانة وتصليح', 'عمولات مناديب', 'مصروفات إدارية', 'مصروفات أخرى'];

  // Categories list for Filter
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => { if (t.category) set.add(t.category); });
    return Array.from(set);
  }, [transactions]);

  // Filter Transactions Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const txnDate = new Date(t.date);
        const now = new Date();
        if (dateFilter === 'today') {
          if (t.date !== now.toISOString().split('T')[0]) return false;
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (txnDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'month') {
          if (txnDate.getMonth() !== now.getMonth() || txnDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchMerchant = t.relatedMerchant?.toLowerCase().includes(q);
        const matchCourier = t.relatedCourier?.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        return matchTitle || matchCategory || matchMerchant || matchCourier || matchNotes;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, dateFilter, searchTerm]);

  // Totals calculations
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV/Excel
  const handleExportCSV = () => {
    const headers = ['المعرف', 'النوع', 'البيان', 'المبلغ (ج.م)', 'التصنيف', 'التاريخ', 'طريقة الدفع', 'التاجر المرتبط', 'المندوب المرتبط', 'الملاحظات'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type === 'income' ? 'وارد (إيراد)' : 'صادر (مصروف)',
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.category}"`,
      t.date,
      t.paymentMethod,
      `"${t.relatedMerchant || '-'}"`,
      `"${t.relatedCourier || '-'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_treasury_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'كاش (نقدي)';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'vodafone_cash': return 'فودافون كاش';
      case 'instapay': return 'انستا باي';
      case 'check': return 'شيك';
      default: return 'أخرى';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">خزينة وحساب الشركة (الفلوس الصادرة والواردة)</h1>
              <p className="text-xs text-slate-500 font-medium">سجل الأرباح والمصروفات، الإيرادات والواردات المالية وإمكانيات الإضافة والتعديل والحذف.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير CSV
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            طباعة كشف الحساب
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            تسجيل معاملة جديدة (وارد / صادر)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-emerald-200 flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              إجمالي الوارد (الإيرادات)
            </span>
            <div className="p-2 bg-emerald-800/60 rounded-xl text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-100">
            {totalIncome.toLocaleString()} <span className="text-xs text-emerald-300">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-300 font-medium">
            مجموع الإيرادات والمقبوضات
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white rounded-2xl p-5 border border-rose-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-rose-200 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              إجمالي الصادر (المصروفات)
            </span>
            <div className="p-2 bg-rose-800/60 rounded-xl text-rose-300">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-100">
            {totalExpense.toLocaleString()} <span className="text-xs text-rose-300">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-300 font-medium">
            مجموع المصروفات والمدفوعات
          </div>
        </div>

        {/* Net Treasury Balance Card */}
        <div className={`rounded-2xl p-5 text-white border shadow-xs ${
          netBalance >= 0 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-rose-950 border-rose-900'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-amber-400" />
              صافي رصيد الخزينة الحالي
            </span>
            <div className="p-2 bg-slate-800 rounded-xl text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString()} <span className="text-xs text-slate-300">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            (الإيرادات - المصروفات)
          </div>
        </div>

        {/* Total Transactions Count Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-600">
              عدد المعاملات المسجلة
            </span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {transactions.length} <span className="text-xs text-slate-500 font-normal">معاملة</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            المعاملات النشطة في الدفتر
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="ابحث بالبيان، الملاحظات، اسم التاجر، المندوب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 font-medium placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-xs font-extrabold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              الوارد (إيرادات)
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow-xs font-extrabold' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              الصادر (مصروفات)
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">جميع التصنيفات المالية</option>
              {allCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">معاملات اليوم فقط</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span>دفتر سجل المعاملات المالية الحالية</span>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {filteredTransactions.length}
            </span>
          </h2>

          <div className="text-xs text-slate-500 font-medium">
            تاريخ التحديث: {new Date().toLocaleDateString('ar-EG')}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm">لا توجد معاملات مالية مطابقة للبحث أو الفلتر الحريري.</p>
            <p className="text-xs text-slate-400">يمكنك إضافة معاملة جديدة بالضغط على زر "تسجيل معاملة جديدة".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">النوع</th>
                  <th className="p-3.5">بيان المعاملة</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">المبلغ (ج.م)</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5">التاجر / المندوب المرتبط</th>
                  <th className="p-3.5">التاريخ والوقت</th>
                  <th className="p-3.5">سُجلت بواسطة</th>
                  <th className="p-3.5 text-center">الإجراءات (تعديل/حذف)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Type Badge */}
                    <td className="p-3.5 whitespace-nowrap">
                      {txn.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          وارد (إيراد)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          صادر (مصروف)
                        </span>
                      )}
                    </td>

                    {/* Title & Notes */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 text-sm">{txn.title}</div>
                      {txn.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">{txn.notes}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-200">
                        {txn.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 whitespace-nowrap font-black text-sm">
                      <span className={txn.type === 'income' ? 'text-emerald-700 font-black text-base' : 'text-rose-700 font-black text-base'}>
                        {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString()} ج.م
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="p-3.5 whitespace-nowrap text-slate-700">
                      <span className="flex items-center gap-1 text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {getPaymentMethodLabel(txn.paymentMethod)}
                      </span>
                    </td>

                    {/* Related Merchant / Courier */}
                    <td className="p-3.5 whitespace-nowrap text-slate-600">
                      {txn.relatedMerchant && (
                        <div className="text-xs font-bold text-slate-800">
                          تاجر: {txn.relatedMerchant}
                        </div>
                      )}
                      {txn.relatedCourier && (
                        <div className="text-xs font-bold text-amber-800">
                          مندوب: {txn.relatedCourier}
                        </div>
                      )}
                      {!txn.relatedMerchant && !txn.relatedCourier && (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{txn.date}</span>
                      </div>
                    </td>

                    {/* Created By */}
                    <td className="p-3.5 whitespace-nowrap text-slate-500 text-xs">
                      {txn.createdBy || 'الأدمن'}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="p-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(txn)}
                          title="تعديل المعاملة"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت تأكد من حذف المعاملة المالية (${txn.title}) نهائياً؟`)) {
                              onDeleteTransaction(txn.id);
                            }
                          }}
                          title="حذف المعاملة"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating or Editing Company Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-600/20 text-red-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingTxn ? 'تعديل المعاملة المالية' : 'تسجيل معاملة مالية جديدة للشركة'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">أدخل تفاصيل الوارد أو المصروف بدقة لتحديث الخزينة.</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع المعاملة المالية:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('income');
                      if (!incomeCategories.includes(formCategory)) setFormCategory(incomeCategories[0]);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    وارد (إيراد / مقبوضات)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('expense');
                      if (!expenseCategories.includes(formCategory)) setFormCategory(expenseCategories[0]);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'expense'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    صادر (مصروف / مدفوعات)
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بيان المعاملة (الوصف الرئيسي) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تحصيل مصاريف شحن يوم الأحد من القاهرة..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (بالجنية المصري) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-red-500/20 text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف المالي:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    {(formType === 'income' ? incomeCategories : expenseCategories).map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المعاملة:</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع / التحصيل:</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="cash">كاش (نقدي)</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="instapay">انستا باي</option>
                    <option value="check">شيك</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Related Merchant / Courier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاجر المرتبط (اختياري):</label>
                  <input
                    type="text"
                    placeholder="اسم التاجر أو المتجر..."
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المندوب المرتبط (اختياري):</label>
                  <select
                    value={formCourier}
                    onChange={(e) => setFormCourier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="">بدون اختيار</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  placeholder="أدخل أي ملاحظات إضافية مثل رقم المرجع أو التفاصيل..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingTxn ? 'تحديث المعاملة' : 'حفظ وتسجيل المعاملة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
