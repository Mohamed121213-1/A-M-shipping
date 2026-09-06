import React, { useState, useMemo } from 'react';
import { Shipment, MerchantWallet, UserSession, CompanyTransaction, GovernorateRate } from '../types';
import { EGYPT_GOVERNORATES } from '../data/mockData';
import droplineLogoImg from '../assets/images/dropline_official_logo_1787442134000.jpg';
import {
  Users,
  Search,
  Wallet,
  DollarSign,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  PlusCircle,
  Building2,
  Phone,
  Calendar,
  CreditCard,
  Receipt,
  FileText,
  AlertTriangle,
  ChevronLeft,
  Filter,
  Check,
  X,
  Smartphone,
  Landmark,
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  Package,
  BadgeAlert,
  ArrowUpDown,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface MerchantAccountsViewProps {
  shipments: Shipment[];
  systemUsers: UserSession[];
  wallet: MerchantWallet;
  companyTransactions: CompanyTransaction[];
  currentUser: UserSession | null;
  onAddTransaction: (txn: Omit<CompanyTransaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleMerchantSettlement: (shipmentId: string, isSettled: boolean) => void;
  onUpdateWallet: (updatedWallet: MerchantWallet) => void;
  onRequestPayout: (amount: number, method: string, selectedShipmentIds?: string[]) => void;
  onUpdateUser?: (updatedUser: UserSession) => void;
  governorates?: GovernorateRate[];
}

interface MerchantSummary {
  id: string;
  name: string;
  storeName: string;
  phone: string;
  governorate?: string;
  city?: string;
  email?: string;
  vodafoneCash?: string;
  instaPay?: string;
  bankAccount?: string;
  // Custom shipping configuration
  hasCustomShippingRate?: boolean;
  customShippingRate?: number;
  shippingPricingType?: 'fixed' | 'governorates';
  customGovernorateRates?: Record<string, number>;
  shippingNotes?: string;
  // Financial metrics
  totalShipmentsCount: number;
  deliveredCount: number;
  partialCount: number;
  returnedCount: number;
  refusedCount: number;
  pendingDeliveryCount: number;
  // Goods and shipping amounts
  totalCodCollected: number; // إجمالي التحصيل الفعلي
  totalShippingFees: number; // مصاريف الشحن
  netGoodsAmount: number;    // حساب الشحنات للتاجر بدون الشحن (COD - Shipping)
  // Returns accounting
  returnsCount: number;      // عدد المرتجعات الإجمالي
  returnsShippingDeducted: number; // مصاريف شحن المرتجعات المخصومة من التاجر
  returnsGoodsValue: number; // قيمة البضائع المرتجعة
  // Payouts
  totalPaidOut: number;      // التاجر خد فلوس كام
  // Balance
  netEarned: number;         // إجمالي المستحق للتاجر (صافي البضاعة - خصم شحن المرتجع)
  dueBalance: number;        // التاجر باقي له كام (ليه كام) = netEarned - totalPaidOut
  unsettledShipmentsCount: number;
  settledShipmentsCount: number;
}

export const MerchantAccountsView: React.FC<MerchantAccountsViewProps> = ({
  shipments,
  systemUsers,
  wallet,
  companyTransactions,
  currentUser,
  onAddTransaction,
  onDeleteTransaction,
  onToggleMerchantSettlement,
  onUpdateWallet,
  onRequestPayout,
  onUpdateUser,
  governorates = EGYPT_GOVERNORATES,
}) => {
  const isAdmin = currentUser?.role === 'admin' || !currentUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_balance' | 'settled' | 'has_debt'>('all');
  const [shipmentsFilter, setShipmentsFilter] = useState<'all' | 'delivered' | 'returned' | 'unsettled' | 'settled'>('all');
  
  // Modal for Recording Payout
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'other',
    notes: '',
    receiptNo: '',
    date: new Date().toISOString().split('T')[0],
    autoSettleShipments: true,
  });

  // Modal for Custom Merchant Shipping Rate
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateModalMerchant, setRateModalMerchant] = useState<MerchantSummary | null>(null);
  const [ratePricingType, setRatePricingType] = useState<'fixed' | 'governorates' | 'default'>('fixed');
  const [rateFixedAmount, setRateFixedAmount] = useState<string>('');
  const [rateGovAmounts, setRateGovAmounts] = useState<Record<string, string>>({});
  const [rateNotes, setRateNotes] = useState<string>('');
  const [rateSaveSuccess, setRateSaveSuccess] = useState<boolean>(false);

  const handleOpenRateModal = (merch: MerchantSummary) => {
    setRateModalMerchant(merch);
    setRateSaveSuccess(false);

    if (merch.hasCustomShippingRate && merch.shippingPricingType === 'governorates') {
      setRatePricingType('governorates');
      setRateFixedAmount(merch.customShippingRate !== undefined ? String(merch.customShippingRate) : '');
      const govVals: Record<string, string> = {};
      if (merch.customGovernorateRates) {
        Object.entries(merch.customGovernorateRates).forEach(([k, v]) => {
          govVals[k] = String(v);
        });
      }
      setRateGovAmounts(govVals);
    } else if (merch.hasCustomShippingRate && merch.customShippingRate !== undefined) {
      setRatePricingType('fixed');
      setRateFixedAmount(String(merch.customShippingRate));
      setRateGovAmounts({});
    } else {
      setRatePricingType('default');
      setRateFixedAmount('');
      setRateGovAmounts({});
    }

    setRateNotes(merch.shippingNotes || '');
    setIsRateModalOpen(true);
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateModalMerchant || !onUpdateUser) return;

    const targetUser = systemUsers.find(
      (u) => u.id === rateModalMerchant.id || (u.phone && u.phone === rateModalMerchant.phone) || (u.storeName && u.storeName === rateModalMerchant.storeName)
    );

    const hasCustom = ratePricingType !== 'default';
    const parsedFixed = rateFixedAmount.trim() !== '' ? parseFloat(rateFixedAmount) : undefined;
    const customRate = (hasCustom && ratePricingType === 'fixed' && parsedFixed !== undefined && !isNaN(parsedFixed)) ? parsedFixed : undefined;
    
    const parsedGovRates: Record<string, number> = {};
    Object.entries(rateGovAmounts).forEach(([code, val]) => {
      const num = parseFloat(String(val));
      if (!isNaN(num) && num >= 0) {
        parsedGovRates[code] = num;
      }
    });

    const pricingType = ratePricingType === 'governorates' ? 'governorates' : 'fixed';
    const customGovs = ratePricingType === 'governorates' && Object.keys(parsedGovRates).length > 0 ? parsedGovRates : undefined;

    let updatedUser: UserSession;
    if (targetUser) {
      updatedUser = {
        ...targetUser,
        hasCustomShippingRate: hasCustom,
        customShippingRate: customRate,
        shippingPricingType: pricingType,
        customGovernorateRates: customGovs,
        shippingNotes: rateNotes.trim() || undefined,
      };
    } else {
      updatedUser = {
        id: rateModalMerchant.id || `merch_${Date.now()}`,
        name: rateModalMerchant.name || rateModalMerchant.storeName,
        email: rateModalMerchant.email || `${rateModalMerchant.id || 'merchant'}@dropline.express`,
        storeName: rateModalMerchant.storeName,
        phone: rateModalMerchant.phone || '01000000000',
        role: 'merchant',
        hasCustomShippingRate: hasCustom,
        customShippingRate: customRate,
        shippingPricingType: pricingType,
        customGovernorateRates: customGovs,
        shippingNotes: rateNotes.trim() || undefined,
        isConfirmed: true,
        registeredAt: new Date().toISOString(),
      };
    }

    onUpdateUser(updatedUser);
    setRateSaveSuccess(true);
    setTimeout(() => {
      setIsRateModalOpen(false);
      setRateSaveSuccess(false);
    }, 800);
  };

  // Extract and calculate all merchants data dynamically
  const merchantsList: MerchantSummary[] = useMemo(() => {
    const merchantMap = new Map<string, MerchantSummary>();

    // 1. First seed with registered merchant users
    systemUsers.forEach((u) => {
      if (u.role === 'merchant' || u.storeName) {
        const id = u.id || u.phone || u.name;
        merchantMap.set(id, {
          id,
          name: u.name,
          storeName: u.storeName || `متجر ${u.name}`,
          phone: u.phone || '',
          governorate: u.hubName || '',
          email: u.email || '',
          hasCustomShippingRate: u.hasCustomShippingRate,
          customShippingRate: u.customShippingRate,
          shippingPricingType: u.shippingPricingType,
          customGovernorateRates: u.customGovernorateRates,
          shippingNotes: u.shippingNotes,
          totalShipmentsCount: 0,
          deliveredCount: 0,
          partialCount: 0,
          returnedCount: 0,
          refusedCount: 0,
          pendingDeliveryCount: 0,
          totalCodCollected: 0,
          totalShippingFees: 0,
          netGoodsAmount: 0,
          returnsCount: 0,
          returnsShippingDeducted: 0,
          returnsGoodsValue: 0,
          totalPaidOut: 0,
          netEarned: 0,
          dueBalance: 0,
          unsettledShipmentsCount: 0,
          settledShipmentsCount: 0,
        });
      }
    });

    // 2. Incorporate senders from shipments
    shipments.forEach((s) => {
      const sender = s.sender;
      const id = sender.id || sender.phone || sender.storeName || 'unknown_merchant';
      
      let merch = merchantMap.get(id);
      if (!merch) {
        // Try matching by store name or phone
        for (const [, existing] of merchantMap) {
          if (
            (sender.phone && existing.phone && sender.phone === existing.phone) ||
            (sender.storeName && existing.storeName && sender.storeName.trim().toLowerCase() === existing.storeName.trim().toLowerCase())
          ) {
            merch = existing;
            break;
          }
        }
      }

      if (!merch) {
        merch = {
          id,
          name: sender.contactName || sender.storeName,
          storeName: sender.storeName || 'تاجر بدون اسم',
          phone: sender.phone || '',
          governorate: sender.governorate || '',
          city: sender.city || '',
          totalShipmentsCount: 0,
          deliveredCount: 0,
          partialCount: 0,
          returnedCount: 0,
          refusedCount: 0,
          pendingDeliveryCount: 0,
          totalCodCollected: 0,
          totalShippingFees: 0,
          netGoodsAmount: 0,
          returnsCount: 0,
          returnsShippingDeducted: 0,
          returnsGoodsValue: 0,
          totalPaidOut: 0,
          netEarned: 0,
          dueBalance: 0,
          unsettledShipmentsCount: 0,
          settledShipmentsCount: 0,
        };
        merchantMap.set(id, merch);
      }

      merch.totalShipmentsCount += 1;

      const isSettled = Boolean(s.isMerchantSettled || s.financials.paidStatus === 'settled');
      if (isSettled) {
        merch.settledShipmentsCount += 1;
      } else {
        merch.unsettledShipmentsCount += 1;
      }

      // Calculations by status
      if (s.status === 'delivered') {
        merch.deliveredCount += 1;
        const cod = Number(s.financials.codAmount) || 0;
        const fee = Number(s.financials.shippingFee) || 0;
        const netGoods = Number(s.financials.netPayout) ?? Math.max(0, cod - fee);
        
        merch.totalCodCollected += cod;
        merch.totalShippingFees += fee;
        merch.netGoodsAmount += netGoods;
      } else if (s.status === 'partial_delivery') {
        merch.partialCount += 1;
        const cod = Number(s.partialDetails?.partialCodAmount ?? s.financials.codAmount) || 0;
        const fee = Number(s.financials.shippingFee) || 0;
        const netGoods = Math.max(0, cod - fee);

        merch.totalCodCollected += cod;
        merch.totalShippingFees += fee;
        merch.netGoodsAmount += netGoods;
      } else if (s.status === 'returned' || s.status === 'refused') {
        if (s.status === 'returned') merch.returnedCount += 1;
        if (s.status === 'refused') merch.refusedCount += 1;
        merch.returnsCount += 1;

        const totalShippingFee = Number(s.financials.shippingFee) || 0;
        let collectedShipping = 0;
        if (s.refusedDetails?.amountCollected !== undefined) {
          collectedShipping = Number(s.refusedDetails.amountCollected) || 0;
        } else if (s.refusedDetails?.shippingFeePaid) {
          collectedShipping = totalShippingFee;
        }

        const merchantDeduction = Math.max(0, totalShippingFee - collectedShipping);
        merch.returnsShippingDeducted += merchantDeduction;
        merch.returnsGoodsValue += Number(s.financials.codAmount) || 0;
      } else {
        merch.pendingDeliveryCount += 1;
      }
    });

    // 3. Incorporate payouts & disbursements from companyTransactions
    companyTransactions.forEach((txn) => {
      if (txn.type === 'expense' && (txn.category === 'تسليم مستحقات تجار' || txn.category === 'صرف أرباح/تجار' || txn.title.includes('التاجر'))) {
        for (const [, merch] of merchantMap) {
          const matchName = txn.relatedMerchant && (
            merch.storeName.includes(txn.relatedMerchant) ||
            txn.relatedMerchant.includes(merch.storeName) ||
            merch.name.includes(txn.relatedMerchant) ||
            txn.relatedMerchant.includes(merch.name)
          );
          if (matchName) {
            merch.totalPaidOut += Number(txn.amount) || 0;
            break;
          }
        }
      }
    });

    // 4. Calculate Final Balances
    merchantMap.forEach((merch) => {
      // Net Earned for merchant = (Net Goods delivered) - (Returns shipping fees deducted)
      merch.netEarned = Math.max(0, merch.netGoodsAmount - merch.returnsShippingDeducted);
      // Due Balance = Net Earned - Total Paid Out
      merch.dueBalance = merch.netEarned - merch.totalPaidOut;
    });

    const allMerchants = Array.from(merchantMap.values()).sort((a, b) => b.dueBalance - a.dueBalance);

    // Isolate data if logged in as a merchant
    if (currentUser?.role === 'merchant') {
      const storeName = currentUser.storeName?.trim().toLowerCase();
      const userName = currentUser.name?.trim().toLowerCase();
      const userPhone = currentUser.phone ? String(currentUser.phone).replace(/\D/g, '') : '';
      const userId = currentUser.id?.trim();

      const filtered = allMerchants.filter((m) => {
        const mStore = m.storeName?.trim().toLowerCase();
        const mName = m.name?.trim().toLowerCase();
        const mPhone = m.phone ? String(m.phone).replace(/\D/g, '') : '';

        if (userId && m.id === userId) return true;
        if (storeName && mStore && (mStore === storeName || mStore.includes(storeName) || storeName.includes(mStore))) return true;
        if (userName && (mName === userName || mName.includes(userName) || (mStore && mStore === userName))) return true;
        if (userPhone && mPhone && (mPhone === userPhone || mPhone.endsWith(userPhone) || userPhone.endsWith(mPhone))) return true;
        return false;
      });

      return filtered.length > 0 ? filtered : allMerchants.slice(0, 1);
    }

    return allMerchants;
  }, [shipments, systemUsers, companyTransactions, currentUser]);

  // Overall Totals
  const totals = useMemo(() => {
    return merchantsList.reduce(
      (acc, m) => {
        acc.totalMerchants += 1;
        acc.totalShipments += m.totalShipmentsCount;
        acc.totalCodCollected += m.totalCodCollected;
        acc.totalShippingFees += m.totalShippingFees;
        acc.totalNetGoods += m.netGoodsAmount;
        acc.totalReturnsDeducted += m.returnsShippingDeducted;
        acc.totalPaidOut += m.totalPaidOut;
        acc.totalDueBalance += m.dueBalance;
        return acc;
      },
      {
        totalMerchants: 0,
        totalShipments: 0,
        totalCodCollected: 0,
        totalShippingFees: 0,
        totalNetGoods: 0,
        totalReturnsDeducted: 0,
        totalPaidOut: 0,
        totalDueBalance: 0,
      }
    );
  }, [merchantsList]);

  // Filtered Merchants
  const filteredMerchants = useMemo(() => {
    return merchantsList.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.storeName.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'has_balance') return m.dueBalance > 0;
      if (statusFilter === 'settled') return m.dueBalance === 0 && m.totalShipmentsCount > 0;
      if (statusFilter === 'has_debt') return m.dueBalance < 0;
      return true;
    });
  }, [merchantsList, searchQuery, statusFilter]);

  // Active Selected Merchant
  const selectedMerchant = useMemo(() => {
    if (!selectedMerchantId) return null;
    return merchantsList.find((m) => m.id === selectedMerchantId) || null;
  }, [selectedMerchantId, merchantsList]);

  // Shipments belonging to selected merchant
  const selectedMerchantShipments = useMemo(() => {
    if (!selectedMerchant) return [];
    return shipments.filter((s) => {
      const sender = s.sender;
      return (
        (sender.id && sender.id === selectedMerchant.id) ||
        (sender.phone && selectedMerchant.phone && sender.phone === selectedMerchant.phone) ||
        (sender.storeName && selectedMerchant.storeName && sender.storeName.trim().toLowerCase() === selectedMerchant.storeName.trim().toLowerCase())
      );
    });
  }, [selectedMerchant, shipments]);

  // Filtered Shipments for Selected Merchant
  const filteredSelectedShipments = useMemo(() => {
    return selectedMerchantShipments.filter((s) => {
      if (shipmentsFilter === 'delivered') return s.status === 'delivered' || s.status === 'partial_delivery';
      if (shipmentsFilter === 'returned') return s.status === 'returned' || s.status === 'refused';
      if (shipmentsFilter === 'unsettled') return !s.isMerchantSettled && s.financials.paidStatus !== 'settled';
      if (shipmentsFilter === 'settled') return s.isMerchantSettled || s.financials.paidStatus === 'settled';
      return true;
    });
  }, [selectedMerchantShipments, shipmentsFilter]);

  // Payout transactions belonging to selected merchant
  const selectedMerchantTransactions = useMemo(() => {
    if (!selectedMerchant) return [];
    return companyTransactions.filter((txn) => {
      if (txn.type !== 'expense') return false;
      const rel = txn.relatedMerchant || '';
      return (
        rel.includes(selectedMerchant.storeName) ||
        selectedMerchant.storeName.includes(rel) ||
        rel.includes(selectedMerchant.name) ||
        selectedMerchant.name.includes(rel)
      );
    });
  }, [selectedMerchant, companyTransactions]);

  // Handlers for Payout
  const handleOpenPayoutModal = (merchant: MerchantSummary) => {
    setSelectedMerchantId(merchant.id);
    setPayoutForm({
      amount: Math.max(0, merchant.dueBalance),
      paymentMethod: 'cash',
      notes: `تسليم مستحقات بضاعة التاجر (${merchant.storeName})`,
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      autoSettleShipments: true,
    });
    setIsPayoutModalOpen(true);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant || payoutForm.amount <= 0) return;

    // 1. Add expense transaction to Company Treasury
    const payoutTxn: Omit<CompanyTransaction, 'id' | 'createdAt'> = {
      type: 'expense',
      title: `تسليم وصرف مستحقات التاجر (${selectedMerchant.storeName})`,
      amount: Number(payoutForm.amount),
      category: 'تسليم مستحقات تجار',
      date: payoutForm.date,
      paymentMethod: payoutForm.paymentMethod,
      relatedMerchant: selectedMerchant.storeName,
      createdBy: currentUser?.name || 'أدمن النظام',
      notes: `${payoutForm.notes || 'تسليم مستحقات نقدية'} ${payoutForm.receiptNo ? `(رقم الإيصال: ${payoutForm.receiptNo})` : ''}`,
    };

    onAddTransaction(payoutTxn);

    // 2. If auto settle shipments, mark delivered shipments of this merchant as settled
    if (payoutForm.autoSettleShipments) {
      let remainingAmount = Number(payoutForm.amount);
      selectedMerchantShipments.forEach((s) => {
        const isDeliveredOrDone = ['delivered', 'partial_delivery', 'refused', 'returned'].includes(s.status);
        const isNotSettled = !s.isMerchantSettled && s.financials.paidStatus !== 'settled';

        if (isDeliveredOrDone && isNotSettled && remainingAmount > 0) {
          onToggleMerchantSettlement(s.id, true);
          const net = s.financials.netPayout ?? Math.max(0, (s.financials.codAmount || 0) - (s.financials.shippingFee || 0));
          remainingAmount -= Math.max(0, net);
        }
      });
    }

    setIsPayoutModalOpen(false);
  };

  // Print Official Merchant Statement
  const handlePrintStatement = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!selectedMerchant) {
      // Export all merchants overview
      const headers = ['اسم المتجر', 'المسؤول', 'الهاتف', 'إجمالي الشحنات', 'الناجحة', 'المرتجع', 'حساب البضائع (بدون شحن)', 'شحن المرتجعات المخصوم', 'التاجر خد فلوس', 'الرصيد المتبقي له'];
      const rows = filteredMerchants.map((m) => [
        `"${m.storeName}"`,
        `"${m.name}"`,
        `"${m.phone}"`,
        m.totalShipmentsCount,
        m.deliveredCount + m.partialCount,
        m.returnsCount,
        m.netGoodsAmount,
        m.returnsShippingDeducted,
        m.totalPaidOut,
        m.dueBalance,
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `كشف_حسابات_كافة_التجار_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Export specific merchant shipments
      const headers = ['رقم البوليصة', 'التاريخ', 'اسم العميل', 'المحافظة', 'الحالة', 'التحصيل COD', 'مصاريف الشحن', 'صافي البضاعة للتاجر', 'حالة المرتجع', 'حالة الصرف للتاجر'];
      const rows = selectedMerchantShipments.map((s) => [
        `"${s.trackingNumber}"`,
        `"${s.createdAt?.split('T')[0] || ''}"`,
        `"${s.recipient.name}"`,
        `"${s.recipient.governorate}"`,
        `"${s.status}"`,
        s.financials.codAmount,
        s.financials.shippingFee,
        s.status === 'delivered' ? s.financials.netPayout ?? (s.financials.codAmount - s.financials.shippingFee) : 0,
        (s.status === 'returned' || s.status === 'refused') ? (s.refusedDetails?.shippingFeePaid ? 'دفع العميل الشحن' : `خصم ${s.refusedDetails?.merchantDeductedAmount || s.financials.shippingFee} ج.م`) : '-',
        s.isMerchantSettled ? 'تم الصرف للتاجر' : 'متبقي لم يصرف',
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `كشف_حساب_${selectedMerchant.storeName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">حسابات وكشوفات التجار</h2>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                لوحة الأدمن
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              متابعة دقيقة لحساب بضائع الشحنات بدون مصاريف الشحن، حساب المرتجعات، المسحوبات المنصرفة، وصافي الرصيد المستحق لكل تاجر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {selectedMerchant && (
            <button
              onClick={() => setSelectedMerchantId(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة لقائمة جميع التجار</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
            title="تصدير ملف إكسيل"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrintStatement}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="طباعة كشف الحساب"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة كشف الحساب</span>
          </button>
        </div>
      </div>

      {/* Global Financial Metrics Cards */}
      {!selectedMerchant ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Goods Value (Without Shipping) */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-blue-400" />
                حساب بضائع الشحنات (بدون الشحن)
              </span>
              <span className="text-[10px] bg-blue-800/60 text-blue-200 px-2 py-0.5 rounded-md font-mono">
                صافي البضاعة
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-white font-mono">
              {totals.totalNetGoods.toLocaleString()} <span className="text-sm font-bold text-blue-300">ج.م</span>
            </p>
            <div className="mt-3 pt-2.5 border-t border-blue-800/60 flex items-center justify-between text-[11px] text-blue-200">
              <span>إجمالي التحصيل COD: <strong>{totals.totalCodCollected.toLocaleString()} ج.م</strong></span>
              <span>شحن الشركة: <strong>{totals.totalShippingFees.toLocaleString()} ج.م</strong></span>
            </div>
          </div>

          {/* Card 2: Returns Deductions */}
          <div className="bg-gradient-to-br from-red-950 to-slate-900 text-white p-5 rounded-2xl border border-red-900 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-red-400" />
                حساب مصاريف المرتجعات
              </span>
              <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-md">
                خصومات الشحن
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-red-400 font-mono">
              {totals.totalReturnsDeducted.toLocaleString()} <span className="text-sm font-bold text-red-300">ج.م</span>
            </p>
            <div className="mt-3 pt-2.5 border-t border-red-900/60 flex items-center justify-between text-[11px] text-red-200">
              <span>شحن المرتجع المخصوم من التجار</span>
            </div>
          </div>

          {/* Card 3: Total Paid Out to Merchants */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                المبالغ المنصرفة (التجار خدوا كام)
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-md font-mono">
                المسحوبات
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-amber-400 font-mono">
              {totals.totalPaidOut.toLocaleString()} <span className="text-sm font-bold text-amber-300">ج.م</span>
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span>إجمالي ما تم تحويله وصرفه للتجار</span>
            </div>
          </div>

          {/* Card 4: Net Due Balance (Remaining to be paid) */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                صافي الرصيد المستحق (ليهم كام)
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                جاهز للصرف
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
              {totals.totalDueBalance.toLocaleString()} <span className="text-sm font-bold text-emerald-300">ج.م</span>
            </p>
            <div className="mt-3 pt-2.5 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-emerald-200">
              <span>المتبقي في ذمة الشركة للتجار</span>
              <span>({totals.totalMerchants} تاجر)</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: ALL MERCHANTS TABLE & DIRECTORY                              */}
      {/* ========================================================================= */}
      {!selectedMerchant && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المتجر، التاجر، أو الهاتف..."
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                جميع التجار ({merchantsList.length})
              </button>
              <button
                onClick={() => setStatusFilter('has_balance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'has_balance'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                لهم مستحقات جاهزة للصرف 💸
              </button>
              <button
                onClick={() => setStatusFilter('settled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'settled'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                تم تصفية حسابهم بالكامل ✅
              </button>
              <button
                onClick={() => setStatusFilter('has_debt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'has_debt'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                }`}
              >
                عليهم مديونيات ⚠️
              </button>
            </div>
          </div>

          {/* Merchants Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">بيانات التاجر والمتجر</th>
                  <th className="py-3 px-3 text-center">سعر الشحن المتفق عليه</th>
                  <th className="py-3 px-3 text-center">عدد الشحنات</th>
                  <th className="py-3 px-3">حساب البضائع (بدون الشحن)</th>
                  <th className="py-3 px-3">شحن المرتجعات المخصوم</th>
                  <th className="py-3 px-3">التاجر خد كام (المنصرف)</th>
                  <th className="py-3 px-3">التاجر ليه كام (المستحق)</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      لا يوجد تجار يطابقون خيارات البحث أو التصفية
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((merch) => (
                    <tr key={merch.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-slate-800">
                            {merch.storeName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {merch.storeName}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                              <span>المسؤول: {merch.name}</span>
                              {merch.phone && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-slate-600">{merch.phone}</span>
                                </>
                              )}
                              {merch.governorate && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500">{merch.governorate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {merch.hasCustomShippingRate && merch.customShippingRate !== undefined ? (
                            <span className="font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-md text-xs shadow-2xs">
                              {merch.customShippingRate} ج.م (موحد)
                            </span>
                          ) : merch.hasCustomShippingRate && merch.shippingPricingType === 'governorates' ? (
                            <span className="font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                              تسعيرة محافظات خاصة
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                              تسعيرة عامة للنظام
                            </span>
                          )}
                          {isAdmin && onUpdateUser && (
                            <button
                              type="button"
                              onClick={() => handleOpenRateModal(merch)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                            >
                              تعديل السعر
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-black text-slate-900 text-sm font-mono">
                            {merch.totalShipmentsCount}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({merch.deliveredCount + merch.partialCount} ناجحة / {merch.returnsCount} مرتجع)
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-black text-slate-900 font-mono text-sm">
                            {merch.netGoodsAmount.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] text-slate-500">
                            من إجمالي COD: {merch.totalCodCollected.toLocaleString()} ج.م
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className={`font-bold font-mono ${merch.returnsShippingDeducted > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                            {merch.returnsShippingDeducted.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] text-slate-500">
                            ({merch.returnsCount} أوردر مرتجع)
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-bold text-amber-700 font-mono">
                            {merch.totalPaidOut.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] text-slate-500">
                            تم صرفها مسبقاً
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span
                            className={`font-black font-mono text-sm inline-block px-2.5 py-0.5 rounded-lg ${
                              merch.dueBalance > 0
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : merch.dueBalance < 0
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {merch.dueBalance > 0 ? `+${merch.dueBalance.toLocaleString()}` : merch.dueBalance.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] font-bold mt-0.5 text-slate-500">
                            {merch.dueBalance > 0 ? 'متبقي له للصرف' : merch.dueBalance < 0 ? 'مديونية عليه' : 'خالص الحساب'}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedMerchantId(merch.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
                            title="فتح كشف حساب تفصيلي"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>كشف الحساب</span>
                          </button>

                          {isAdmin && onUpdateUser && (
                            <button
                              onClick={() => handleOpenRateModal(merch)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-slate-300 flex items-center gap-1 cursor-pointer"
                              title="تحديد سعر الشحن للتاجر"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              <span>سعر الشحن</span>
                            </button>
                          )}

                          {merch.dueBalance > 0 && (
                            <button
                              onClick={() => handleOpenPayoutModal(merch)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="صرف وتسليم المستحقات"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>صرف دفعة</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: ITEMIZED MERCHANT STATEMENT (كشف حساب التاجر التفصيلي)      */}
      {/* ========================================================================= */}
      {selectedMerchant && (
        <div className="space-y-6">
          {/* Merchant Identity & Summary Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white">
                  {selectedMerchant.storeName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      كشف حساب: {selectedMerchant.storeName}
                    </h3>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        selectedMerchant.dueBalance > 0
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedMerchant.dueBalance < 0
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {selectedMerchant.dueBalance > 0
                        ? `مستحق له: ${selectedMerchant.dueBalance.toLocaleString()} ج.م`
                        : selectedMerchant.dueBalance < 0
                        ? `مديونية عليه: ${Math.abs(selectedMerchant.dueBalance).toLocaleString()} ج.م`
                        : 'الحساب خالص ومصفّى'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 font-medium mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      المسؤول: <strong>{selectedMerchant.name}</strong>
                    </span>
                    {selectedMerchant.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        الهاتف: <strong className="font-mono">{selectedMerchant.phone}</strong>
                      </span>
                    )}
                    {selectedMerchant.governorate && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        المنطقة: <strong>{selectedMerchant.governorate} {selectedMerchant.city ? `- ${selectedMerchant.city}` : ''}</strong>
                      </span>
                    )}

                    {selectedMerchant.hasCustomShippingRate && selectedMerchant.customShippingRate !== undefined ? (
                      <button
                        type="button"
                        onClick={() => isAdmin && handleOpenRateModal(selectedMerchant)}
                        className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                        title="انقر لتعديل سعر الشحن"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        سعر الشحن المتفق عليه: {selectedMerchant.customShippingRate} ج.م (موحد لجميع المحافظات) ✏️
                      </button>
                    ) : selectedMerchant.hasCustomShippingRate && selectedMerchant.shippingPricingType === 'governorates' ? (
                      <button
                        type="button"
                        onClick={() => isAdmin && handleOpenRateModal(selectedMerchant)}
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-black cursor-pointer transition-colors"
                        title="انقر لتعديل تسعيرة المحافظات"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        سعر الشحن المتفق عليه: تسعيرة مخصصة لكل محافظة ✏️
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => isAdmin && handleOpenRateModal(selectedMerchant)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        title="انقر لتحديد سعر شحن خاص لهذا التاجر"
                      >
                        سعر الشحن: تسعيرة النظام العامة (تحديد سعر خاص +)
                      </button>
                    )}

                    {selectedMerchant.shippingNotes && (
                      <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                        📝 {selectedMerchant.shippingNotes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Merchant */}
              <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                {isAdmin && onUpdateUser && (
                  <button
                    onClick={() => handleOpenRateModal(selectedMerchant)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>تحديد / تعديل سعر الشحن للتاجر</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenPayoutModal(selectedMerchant)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 text-emerald-200" />
                  <span>تسجيل وصرف دفعة للتاجر</span>
                </button>
              </div>
            </div>

            {/* 4 Financial Breakdown Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              {/* Box 1: Goods Amount (Without Shipping) */}
              <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl">
                <div className="flex items-center justify-between text-blue-900 mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-blue-600" />
                    حساب البضائع (بدون الشحن)
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    صافي الأوردرات
                  </span>
                </div>
                <p className="text-xl font-black text-blue-950 font-mono">
                  {selectedMerchant.netGoodsAmount.toLocaleString()} <span className="text-xs font-bold text-blue-700">ج.م</span>
                </p>
                <p className="text-[11px] text-blue-700 mt-1 font-medium">
                  إجمالي COD: {selectedMerchant.totalCodCollected.toLocaleString()} ج.م - شحن: {selectedMerchant.totalShippingFees.toLocaleString()} ج.م
                </p>
              </div>

              {/* Box 2: Returns Deductions */}
              <div className="bg-red-50/60 border border-red-200/80 p-4 rounded-xl">
                <div className="flex items-center justify-between text-red-900 mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    حساب المرتجعات
                  </span>
                  <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold">
                    خصم شحن
                  </span>
                </div>
                <p className="text-xl font-black text-red-700 font-mono">
                  {selectedMerchant.returnsShippingDeducted.toLocaleString()} <span className="text-xs font-bold text-red-600">ج.م</span>
                </p>
                <p className="text-[11px] text-red-700 mt-1 font-medium">
                  {selectedMerchant.returnsCount} أوردر مرتجع (شحن مخصوم من التاجر)
                </p>
              </div>

              {/* Box 3: Paid Out */}
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl">
                <div className="flex items-center justify-between text-amber-900 mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    التاجر خد كام (المسحوبات)
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    المبالغ المصروفة
                  </span>
                </div>
                <p className="text-xl font-black text-amber-800 font-mono">
                  {selectedMerchant.totalPaidOut.toLocaleString()} <span className="text-xs font-bold text-amber-700">ج.م</span>
                </p>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  إجمالي دفعات المستحقات المسلمة للتاجر
                </p>
              </div>

              {/* Box 4: Due Balance */}
              <div className="bg-emerald-50/70 border border-emerald-300 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between text-emerald-900 mb-1">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    التاجر ليه كام (الرصيد المتبقي)
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold">
                    جاهز للصرف
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-700 font-mono">
                  {selectedMerchant.dueBalance.toLocaleString()} <span className="text-xs font-bold text-emerald-700">ج.م</span>
                </p>
                <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                  {selectedMerchant.unsettledShipmentsCount} شحنة بانتظار تصفية الحساب
                </p>
              </div>
            </div>
          </div>

          {/* Previous Disbursements / Payouts History for this Merchant */}
          {selectedMerchantTransactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    سجل المسحوبات والدفعات المسلمة للتاجر ({selectedMerchantTransactions.length} دفعة)
                  </h4>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  إجمالي المنصرف: {selectedMerchant.totalPaidOut.toLocaleString()} ج.م
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">التاريخ</th>
                      <th className="py-2.5 px-3">المبلغ المصروف</th>
                      <th className="py-2.5 px-3">طريقة الدفع</th>
                      <th className="py-2.5 px-3">البيان والملاحظات</th>
                      <th className="py-2.5 px-3">المسؤول</th>
                      <th className="py-2.5 px-4 text-center">إلغاء/حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMerchantTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{txn.date}</td>
                        <td className="py-2.5 px-3 font-extrabold text-amber-700 font-mono text-sm">
                          {txn.amount.toLocaleString()} ج.م
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                            {txn.paymentMethod === 'cash' ? 'كاش من الخزينة' :
                             txn.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                             txn.paymentMethod === 'instapay' ? 'إنستاباي' :
                             txn.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'أخرى'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{txn.title} {txn.notes ? `- ${txn.notes}` : ''}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{txn.createdBy || 'الأدمن'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه الدفعة وإرجاع قيمتها لحساب التاجر؟')) {
                                onDeleteTransaction(txn.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                            title="حذف هذه الدفعة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Itemized Shipments Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header & Filter for shipments */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  كشف حساب تفصيلي بشحنات المتجر ({selectedMerchantShipments.length} أوردر)
                </h4>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShipmentsFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    shipmentsFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  الكل ({selectedMerchantShipments.length})
                </button>
                <button
                  onClick={() => setShipmentsFilter('delivered')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    shipmentsFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  المسلم والناجح ({selectedMerchant.deliveredCount + selectedMerchant.partialCount})
                </button>
                <button
                  onClick={() => setShipmentsFilter('returned')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    shipmentsFilter === 'returned'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                  }`}
                >
                  المرتجعات ({selectedMerchant.returnsCount})
                </button>
                <button
                  onClick={() => setShipmentsFilter('unsettled')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    shipmentsFilter === 'unsettled'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  متبقي لم يصرف ({selectedMerchant.unsettledShipmentsCount})
                </button>
                <button
                  onClick={() => setShipmentsFilter('settled')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    shipmentsFilter === 'settled'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  تم الصرف للتاجر ({selectedMerchant.settledShipmentsCount})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">رقم البوليصة / التاريخ</th>
                    <th className="py-3 px-3">العميل والمحافظة</th>
                    <th className="py-3 px-3 text-center">حالة الشحنة</th>
                    <th className="py-3 px-3 text-center">التحصيل (COD)</th>
                    <th className="py-3 px-3 text-center">شحن الشركة</th>
                    <th className="py-3 px-3 text-center">صافي البضاعة للتاجر</th>
                    <th className="py-3 px-3 text-center">حالة المرتجع</th>
                    <th className="py-3 px-4 text-center">حالة استلام الفلوس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSelectedShipments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        لا توجد شحنات في هذا القسم
                      </td>
                    </tr>
                  ) : (
                    filteredSelectedShipments.map((s) => {
                      const isDelivered = s.status === 'delivered';
                      const isPartial = s.status === 'partial_delivery';
                      const isReturned = s.status === 'returned' || s.status === 'refused';
                      const isSettled = Boolean(s.isMerchantSettled || s.financials.paidStatus === 'settled');

                      let netGoods = 0;
                      if (isDelivered) {
                        netGoods = s.financials.netPayout ?? Math.max(0, s.financials.codAmount - s.financials.shippingFee);
                      } else if (isPartial) {
                        const collected = s.partialDetails?.partialCodAmount ?? s.financials.codAmount;
                        netGoods = Math.max(0, collected - s.financials.shippingFee);
                      }

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-extrabold text-blue-600 block text-xs">
                              #{s.trackingNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.createdAt ? s.createdAt.split('T')[0] : 'اليوم'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{s.recipient.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {s.recipient.governorate} - {s.recipient.city}
                            </p>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                isDelivered
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPartial
                                  ? 'bg-blue-100 text-blue-800'
                                  : isReturned
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isDelivered
                                ? 'تم التسليم'
                                : isPartial
                                ? 'استلام جزئي'
                                : isReturned
                                ? 'مرتجع للتاجر'
                                : 'قيد التوصيل'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                            {isPartial
                              ? (s.partialDetails?.partialCodAmount ?? s.financials.codAmount).toLocaleString()
                              : isReturned
                              ? (s.refusedDetails?.amountCollected ?? 0).toLocaleString()
                              : s.financials.codAmount.toLocaleString()} ج.م
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                            {s.financials.shippingFee.toLocaleString()} ج.م
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isDelivered || isPartial ? (
                              <span className="font-mono font-black text-emerald-600 text-sm">
                                {netGoods.toLocaleString()} ج.م
                              </span>
                            ) : isReturned ? (
                              <span className="text-slate-400 font-mono">0 ج.م</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">قيد التحصيل</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isReturned ? (
                              s.refusedDetails?.shippingFeePaid ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                                  دفع العميل الشحن ✅
                                </span>
                              ) : (
                                <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                                  خصم {s.refusedDetails?.merchantDeductedAmount || s.financials.shippingFee} ج.م ❌
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onToggleMerchantSettlement(s.id, !isSettled)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                isSettled
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              }`}
                              title="اضغط لتغيير حالة صرف هذا الأوردر للتاجر"
                            >
                              {isSettled ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>تم الصرف</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>متبقي لم يصرف</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD / DISBURSE PAYOUT TO MERCHANT                               */}
      {/* ========================================================================= */}
      {isPayoutModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">تسجيل وصرف دفعة مستحقات للتاجر</h3>
                  <p className="text-xs text-emerald-200">{selectedMerchant.storeName} ({selectedMerchant.name})</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-800">إجمالي الرصيد المستحق حالياً للتاجر</p>
                  <p className="text-xl font-black text-emerald-950 font-mono">
                    {selectedMerchant.dueBalance.toLocaleString()} ج.م
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPayoutForm((prev) => ({ ...prev, amount: Math.max(0, selectedMerchant.dueBalance) }))}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  صرف كامل المبلغ
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المبلغ المنصرف (ج.م) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    طريقة الدفع والتسليم *
                  </label>
                  <select
                    value={payoutForm.paymentMethod}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="cash">كاش نقدياً من الخزينة</option>
                    <option value="vodafone_cash">فودافون كاش / محفظة إلكترونية</option>
                    <option value="instapay">إنستاباي (InstaPay)</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="other">أخرى / شيك</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تاريخ الصرف *
                  </label>
                  <input
                    type="date"
                    required
                    value={payoutForm.date}
                    onChange={(e) => setPayoutForm({ ...payoutForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الإيصال أو المعاملة (اختياري)
                </label>
                <input
                  type="text"
                  value={payoutForm.receiptNo}
                  onChange={(e) => setPayoutForm({ ...payoutForm, receiptNo: e.target.value })}
                  placeholder="مثال: REC-890214 أو رقم تحويل إنستاباي"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  بيان وملاحظات الصرف
                </label>
                <input
                  type="text"
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  placeholder="ملاحظات تسليم المستحقات..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payoutForm.autoSettleShipments}
                    onChange={(e) => setPayoutForm({ ...payoutForm, autoSettleShipments: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    تحديث حالة الشحنات الجاهزة إلى "تم استلام التاجر للمستحقات" تلقائياً
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد تسجيل وصرف الدفعة للتاجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CUSTOM MERCHANT SHIPPING RATE CONFIGURATION (تحديد سعر شحن التاجر) */}
      {/* ========================================================================= */}
      {isRateModalOpen && rateModalMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span>تحديد سعر الشحن للتاجر</span>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {rateModalMerchant.storeName}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    المسؤول: {rateModalMerchant.name} {rateModalMerchant.phone ? `• ${rateModalMerchant.phone}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRate} className="p-6 space-y-5 text-right">
              {/* Informative explanation banner */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-950 space-y-1">
                <div className="font-black text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>التحكم في سعر شحن هذا التاجر:</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                  يمكنك تحديد سعر شحن خاص ومستقل لهذا التاجر؛ لتحاسبه بسعر مختلف عن باقي التجار (مثلاً سعر شحن موحد لكافة شحناته أو تسعيرة مخصصة لكل محافظة). أي شحنة جديدة يتم إنشاؤها لهذا التاجر ستُحسب تلقائياً بهذا السعر المتفق عليه.
                </p>
              </div>

              {/* Pricing Type Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-black text-slate-800">
                  اختر نظام تسعير الشحن لهذا التاجر:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Fixed Unified Rate */}
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-right ${
                      ratePricingType === 'fixed'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-slate-900">سعر موحد</span>
                      <input
                        type="radio"
                        name="pricingType"
                        value="fixed"
                        checked={ratePricingType === 'fixed'}
                        onChange={() => setRatePricingType('fixed')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium leading-tight">
                      سعر شحن ثابت وموحد لكافة المحافظات
                    </span>
                  </label>

                  {/* Option 2: Governorate-based Custom Rates */}
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-right ${
                      ratePricingType === 'governorates'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-slate-900">تسعيرة لكل محافظة</span>
                      <input
                        type="radio"
                        name="pricingType"
                        value="governorates"
                        checked={ratePricingType === 'governorates'}
                        onChange={() => setRatePricingType('governorates')}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium leading-tight">
                      تحديد سعر خاص لكل محافظة على حدة
                    </span>
                  </label>

                  {/* Option 3: Default System Rates */}
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-right ${
                      ratePricingType === 'default'
                        ? 'border-slate-800 bg-slate-100 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs text-slate-900">تسعيرة النظام العامة</span>
                      <input
                        type="radio"
                        name="pricingType"
                        value="default"
                        checked={ratePricingType === 'default'}
                        onChange={() => setRatePricingType('default')}
                        className="text-slate-800 focus:ring-slate-700 w-4 h-4"
                      />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium leading-tight">
                      بدون سعر خاص (تطبيق أسعار النظام الافتراضية)
                    </span>
                  </label>
                </div>
              </div>

              {/* Conditional Sub-forms based on Selected Pricing Type */}
              {ratePricingType === 'fixed' && (
                <div className="bg-emerald-50/80 border border-emerald-300 p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-emerald-950">
                      سعر الشحن المتفق عليه للتاجر (ج.م) *
                    </label>
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-200/70 px-2 py-0.5 rounded-md">
                      شامل كافة المحافظات
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={rateFixedAmount}
                      onChange={(e) => setRateFixedAmount(e.target.value)}
                      placeholder="اكتب السعر المتفق عليه مثلاً 50 أو 60 أو أي مبلغ..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-400 text-sm font-black font-mono focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ج.م
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 font-medium">
                    💡 سيتم احتساب هذا السعر تلقائياً عند إضافة أي شحنة جديدة لهذا التاجر.
                  </p>
                </div>
              )}

              {ratePricingType === 'governorates' && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      حدد سعر الشحن المتفق عليه لكل محافظة (ج.م):
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      المحافظات الفارغة ستعتمد على السعر الافتراضي
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
                    {governorates.map((gov) => {
                      const currentVal = rateGovAmounts[gov.code] ?? '';
                      return (
                        <div key={gov.code} className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-900 block">{gov.nameAr || gov.nameEn}</span>
                            <span className="text-[10px] text-slate-400">
                              السعر العام للنظام: {gov.baseRate} ج.م
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) => {
                                setRateGovAmounts({
                                  ...rateGovAmounts,
                                  [gov.code]: e.target.value,
                                });
                              }}
                              placeholder={String(gov.baseRate)}
                              className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-black font-mono text-center focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-[11px] font-bold text-slate-400">ج.م</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {ratePricingType === 'default' && (
                <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
                  <p className="font-bold text-slate-900 mb-1">
                    العودة للتسعيرة العامة:
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    عند اختيار هذا الخيار، سيتم إلغاء أي تسعيرة مخصصة لهذا التاجر، وستُحسب شحناته القادمة وفقاً للأسعار الافتراضية لكل محافظة والمحددة في إعدادات النظام.
                  </p>
                </div>
              )}

              {/* Agreement Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات الاتفاق التجاري مع التاجر (اختياري)
                </label>
                <input
                  type="text"
                  value={rateNotes}
                  onChange={(e) => setRateNotes(e.target.value)}
                  placeholder="مثال: اتفاق أسعار شحن خاصة لحجم طرود كبير يتجاوز 150 شحنة شهرياً..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                />
              </div>

              {/* Save Success Alert */}
              {rateSaveSuccess && (
                <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-black flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>تم حفظ واعتماد سعر الشحن الجديد للتاجر بنجاح!</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>حفظ وتفعيل سعر الشحن للتاجر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
