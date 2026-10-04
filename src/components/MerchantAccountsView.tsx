import React, { useState, useMemo, useEffect } from 'react';
import { Shipment, MerchantWallet, UserSession, CompanyTransaction, GovernorateRate } from '../types';
import { EGYPT_GOVERNORATES, INITIAL_SHIPMENTS } from '../data/mockData';
import { isAdvanceTransaction, matchesMerchant } from '../utils/merchantFinancials';
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
  HandCoins,
  Truck,
  Calculator,
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
  onMarkReturnedToMerchant?: (shipmentId: string, revert?: boolean) => void;
  onMarkAllMerchantReturns?: (shipmentIds: string[]) => void;
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
  // All Work Complete Metrics (الشغل كامل بدون الشحن)
  totalShipmentsCount: number;
  totalAllWorkCod: number;           // إجمالي COD لكل شحنات التاجر بلا استثناء
  totalAllWorkShippingFees: number;  // إجمالي مصاريف الشحن الكلية لكل الشحنات
  totalAllWorkNetGoods: number;      // إجمالي حساب الشغل كامل بدون الشحن (صافي البضائع الكلي)

  // Delivered Work (المسلم)
  deliveredCount: number;
  fullDeliveredCount: number; // الشحنات الكاملة المسلمة
  fullDeliveredCod: number;
  fullDeliveredNetGoods: number; // صافي الشحنات الكاملة للتاجر
  partialCount: number;
  returnedCount: number;
  refusedCount: number;
  pendingDeliveryCount: number;
  // In-transit amounts (قيد التوصيل / في الطريق مع المناديب)
  inTransitCount: number;
  inTransitCod: number;
  inTransitShippingFees: number;
  inTransitNet: number;              // صافي بضائع قيد التسليم بدون الشحن
  // Goods and shipping amounts (الشغل المسلم المنجز)
  totalCodCollected: number; // إجمالي التحصيل الفعلي
  totalShippingFees: number; // مصاريف الشحن
  netGoodsAmount: number;    // حساب الشغل المسلم للتاجر بدون الشحن (COD - Shipping)
  // Returns accounting (المرتجعات)
  returnsCount: number;      // عدد المرتجعات الإجمالي
  returnsGoodsValue: number; // قيمة البضائع المرتجعة بحساب عادي
  returnsTotalCod: number;   // إجمالي مبالغ المرتجعات العادية (COD كامل)
  returnsShippingDeducted: number; // مصاريف شحن المرتجعات المخصومة من التاجر (تتخصم من الفلوس اللي ليه)
  pendingReturnsCount: number; // عدد المرتجعات المعلقة لدى الشركة (لم يستلمها التاجر بعد)
  pendingReturnsGoodsValue: number; // حساب المرتجعات المعلقة (يصبح 0 عند استلام التاجر لكافة المرتجعات)
  deliveredToMerchantReturnsCount: number; // عدد المرتجعات المستلمة للتاجر
  deliveredToMerchantReturnsGoodsValue: number; // قيمة المرتجعات المستلمة للتاجر
  deliveredToMerchantReturnsShippingDeducted: number; // خصم شحن المرتجعات المستلمة للتاجر (المخصومة فعلياً من حسابه لما يستلمها)
  pendingReturnsShippingDeducted: number; // مصاريف شحن المرتجعات المعلقة بالمستودع (ستُخصم فور استلام التاجر لها)
  partialShippingCount: number; // عدد شحنات دفع جزء من الشحن
  partialShippingCollected: number; // إجمالي المحصل كـ جزء من الشحن
  customerCancellationCount: number; // عدد شحنات إلغاء بطلب العميل
  customerCancellationGoodsValue: number; // قيمة بضائع الإلغاء
  // Payouts & Advances
  totalAdvancePaid: number;  // سلف ودفعات مقدمة أخذها التاجر
  totalRegularPaidOut: number; // صرف مستحقات عادي
  totalPaidOut: number;      // إجمالي المنصرف (مقدمات + سحوبات)
  advanceTransactions: CompanyTransaction[]; // قائمة السلف والدفعات المقدمة
  // Balance (حساب التاجر - ليه كام)
  netEarned: number;         // إجمالي المستحق للتاجر (صافي البضاعة المسلمة - خصم شحن المرتجع)
  dueBalance: number;        // التاجر ليه كام = netEarned - totalPaidOut
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
  onMarkReturnedToMerchant,
  onMarkAllMerchantReturns,
}) => {
  const isAdmin = currentUser?.role === 'admin' || !currentUser;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_balance' | 'settled' | 'has_debt'>('all');
  const [shipmentsFilter, setShipmentsFilter] = useState<'all' | 'delivered' | 'full_delivered' | 'partial_delivery' | 'in_transit' | 'returned' | 'pending_returns' | 'received_returns' | 'partial_shipping' | 'customer_cancellation' | 'unsettled' | 'settled' | 'advances'>('all');
  
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

  // Modal for Recording Advance Payment / Prepayment (تسجيل سلفة أو دفعة مقدمة للتاجر)
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceModalMerchant, setAdvanceModalMerchant] = useState<MerchantSummary | null>(null);
  const [advanceSuccessBanner, setAdvanceSuccessBanner] = useState<{ message: string; merchantId?: string; storeName?: string } | null>(null);
  const [advanceForm, setAdvanceForm] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'other',
    notes: '',
    receiptNo: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (advanceSuccessBanner) {
      const timer = setTimeout(() => setAdvanceSuccessBanner(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [advanceSuccessBanner]);

  const handleOpenAdvanceModal = (merch?: MerchantSummary | null) => {
    const target = merch || selectedMerchant || (merchantsList.length > 0 ? merchantsList[0] : null);
    setAdvanceModalMerchant(target);
    setAdvanceForm({
      amount: 0,
      paymentMethod: 'cash',
      notes: target ? `سلفة نقدية / دفعة مقدمة تحت الحساب للتاجر (${target.storeName})` : 'سلفة نقدية تحت الحساب',
      receiptNo: `ADV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
    });
    setIsAdvanceModalOpen(true);
  };

  const handleConfirmAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const target = advanceModalMerchant || selectedMerchant || (merchantsList.length > 0 ? merchantsList[0] : null);
    if (!target || advanceForm.amount <= 0) return;

    const advTxn: Omit<CompanyTransaction, 'id' | 'createdAt'> = {
      type: 'expense',
      category: 'دفعة مقدمة / سلفة تاجر',
      title: `سلفة نقدية / دفعة مقدمة للتاجر (${target.storeName})`,
      amount: Number(advanceForm.amount),
      date: advanceForm.date,
      paymentMethod: advanceForm.paymentMethod,
      relatedMerchant: target.storeName,
      createdBy: currentUser?.name || 'أدمن النظام',
      notes: `${advanceForm.notes || 'سلفة نقدية مقدمة مخصومة من المستحقات'} ${advanceForm.receiptNo ? `(رقم الإيصال: ${advanceForm.receiptNo})` : ''} [تاجر: ${target.storeName} - ${target.phone || ''} - id:${target.id}]`,
    };

    onAddTransaction(advTxn);
    setAdvanceSuccessBanner({
      message: `تم تسجيل سلفة نقدية بمبلغ ${Number(advanceForm.amount).toLocaleString()} ج.م للتاجر (${target.storeName}) بنجاح وخصمها من حسابه ومستحقاته فوراً!`,
      merchantId: target.id,
      storeName: target.storeName,
    });

    if (selectedMerchantId === target.id) {
      setShipmentsFilter('advances');
    }

    setIsAdvanceModalOpen(false);
  };

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
          totalAllWorkCod: 0,
          totalAllWorkShippingFees: 0,
          totalAllWorkNetGoods: 0,
          deliveredCount: 0,
          fullDeliveredCount: 0,
          fullDeliveredCod: 0,
          fullDeliveredNetGoods: 0,
          partialCount: 0,
          returnedCount: 0,
          refusedCount: 0,
          pendingDeliveryCount: 0,
          inTransitCount: 0,
          inTransitCod: 0,
          inTransitShippingFees: 0,
          inTransitNet: 0,
          totalCodCollected: 0,
          totalShippingFees: 0,
          netGoodsAmount: 0,
          returnsCount: 0,
          returnsShippingDeducted: 0,
          returnsGoodsValue: 0,
          returnsTotalCod: 0,
          pendingReturnsCount: 0,
          pendingReturnsGoodsValue: 0,
          pendingReturnsShippingDeducted: 0,
          deliveredToMerchantReturnsCount: 0,
          deliveredToMerchantReturnsGoodsValue: 0,
          deliveredToMerchantReturnsShippingDeducted: 0,
          partialShippingCount: 0,
          partialShippingCollected: 0,
          customerCancellationCount: 0,
          customerCancellationGoodsValue: 0,
          totalAdvancePaid: 0,
          totalRegularPaidOut: 0,
          totalPaidOut: 0,
          advanceTransactions: [],
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
          totalAllWorkCod: 0,
          totalAllWorkShippingFees: 0,
          totalAllWorkNetGoods: 0,
          deliveredCount: 0,
          fullDeliveredCount: 0,
          fullDeliveredCod: 0,
          fullDeliveredNetGoods: 0,
          partialCount: 0,
          returnedCount: 0,
          refusedCount: 0,
          pendingDeliveryCount: 0,
          inTransitCount: 0,
          inTransitCod: 0,
          inTransitShippingFees: 0,
          inTransitNet: 0,
          totalCodCollected: 0,
          totalShippingFees: 0,
          netGoodsAmount: 0,
          returnsCount: 0,
          returnsShippingDeducted: 0,
          returnsGoodsValue: 0,
          returnsTotalCod: 0,
          pendingReturnsCount: 0,
          pendingReturnsGoodsValue: 0,
          pendingReturnsShippingDeducted: 0,
          deliveredToMerchantReturnsCount: 0,
          deliveredToMerchantReturnsGoodsValue: 0,
          deliveredToMerchantReturnsShippingDeducted: 0,
          partialShippingCount: 0,
          partialShippingCollected: 0,
          customerCancellationCount: 0,
          customerCancellationGoodsValue: 0,
          totalAdvancePaid: 0,
          totalRegularPaidOut: 0,
          totalPaidOut: 0,
          advanceTransactions: [],
          netEarned: 0,
          dueBalance: 0,
          unsettledShipmentsCount: 0,
          settledShipmentsCount: 0,
        };
        merchantMap.set(id, merch);
      }

      merch.totalShipmentsCount += 1;

      // Track all work metrics across every shipment of this merchant
      const shipmentCod = Number(s.financials?.codAmount) || 0;
      const shipmentFee = Number(s.financials?.shippingFee) || 0;
      merch.totalAllWorkCod += shipmentCod;
      merch.totalAllWorkShippingFees += shipmentFee;
      merch.totalAllWorkNetGoods += Math.max(0, shipmentCod - shipmentFee);

      const isSettled = Boolean(s.isMerchantSettled || s.financials.paidStatus === 'settled');
      if (isSettled) {
        merch.settledShipmentsCount += 1;
      } else {
        merch.unsettledShipmentsCount += 1;
      }

      // Calculations by status
      if (s.status === 'delivered') {
        merch.deliveredCount += 1;
        merch.fullDeliveredCount += 1;
        const cod = Number(s.financials.codAmount) || 0;
        const fee = Number(s.financials.shippingFee) || 0;
        const netGoods = Number(s.financials.netPayout) ?? Math.max(0, cod - fee);
        
        merch.totalCodCollected += cod;
        merch.totalShippingFees += fee;
        merch.netGoodsAmount += netGoods;

        merch.fullDeliveredCod += cod;
        merch.fullDeliveredNetGoods += netGoods;
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

        const isCancelExempt = s.refusedDetails?.isCustomerCancellationWithoutFee === true ||
          s.refusedDetails?.reason?.includes('إلغاء') ||
          s.refusedDetails?.reason?.includes('إعفاء');

        const fallback = INITIAL_SHIPMENTS.find((x) => x.id === s.id || x.trackingNumber === s.trackingNumber);
        const orderCod = s.refusedDetails?.originalCodAmount ||
          (Number(s.financials.codAmount) > 0 && Number(s.financials.codAmount) !== collectedShipping ? Number(s.financials.codAmount) : 0) ||
          fallback?.financials?.codAmount ||
          Number(s.financials.codAmount) || 0;
        merch.returnsTotalCod += orderCod;
        const goodsVal = s.refusedDetails?.originalGoodsValue ?? (orderCod > totalShippingFee ? orderCod - totalShippingFee : orderCod);
        const effectiveGoods = (goodsVal > 0 ? goodsVal : orderCod);
        merch.returnsGoodsValue += effectiveGoods;

        const isReceivedByMerchant = Boolean(s.isReturnedToMerchant);
        if (isReceivedByMerchant) {
          merch.deliveredToMerchantReturnsCount += 1;
          merch.deliveredToMerchantReturnsGoodsValue += effectiveGoods;
        } else {
          merch.pendingReturnsCount += 1;
          merch.pendingReturnsGoodsValue += effectiveGoods;
        }

        let returnDeduction = 0;
        if (isCancelExempt) {
          merch.customerCancellationCount += 1;
          merch.customerCancellationGoodsValue += effectiveGoods;
          returnDeduction = 0;
        } else if (s.refusedDetails?.merchantDeductedAmount !== undefined) {
          returnDeduction = Number(s.refusedDetails.merchantDeductedAmount) || 0;
        } else if (s.refusedDetails?.partialShippingFeePaid || (collectedShipping > 0 && collectedShipping < totalShippingFee)) {
          const deduction = Math.max(0, totalShippingFee - collectedShipping);
          merch.partialShippingCount += 1;
          merch.partialShippingCollected += collectedShipping;
          returnDeduction = deduction;
        } else if (collectedShipping >= totalShippingFee && totalShippingFee > 0) {
          // دفع كامل الشحن -> خصم 0
          returnDeduction = 0;
        } else {
          // لم يدفع شحن -> خصم كامل الشحن
          returnDeduction = totalShippingFee;
        }

        merch.returnsShippingDeducted += returnDeduction;

        if (isReceivedByMerchant) {
          merch.deliveredToMerchantReturnsShippingDeducted += returnDeduction;
        } else {
          merch.pendingReturnsShippingDeducted += returnDeduction;
        }
      } else {
        // In transit with couriers / in hub / created / pending
        merch.pendingDeliveryCount += 1;
        merch.inTransitCount += 1;
        const cod = Number(s.financials.codAmount) || 0;
        const fee = Number(s.financials.shippingFee) || 0;
        merch.inTransitCod += cod;
        merch.inTransitShippingFees += fee;
        merch.inTransitNet += Math.max(0, cod - fee);
      }
    });

    // 3. Incorporate payouts & advance payments from companyTransactions
    companyTransactions.forEach((txn) => {
      if (txn.type === 'expense') {
        for (const [, merch] of merchantMap) {
          if (matchesMerchant(txn, { id: merch.id, storeName: merch.storeName, name: merch.name, phone: merch.phone })) {
            const amt = Number(txn.amount) || 0;
            if (isAdvanceTransaction(txn)) {
              merch.totalAdvancePaid += amt;
              merch.advanceTransactions.push(txn);
            } else if (
              txn.category === 'تسليم مستحقات تجار' ||
              txn.category === 'صرف أرباح/تجار' ||
              (txn.title && txn.title.includes('التاجر'))
            ) {
              merch.totalRegularPaidOut += amt;
            }
            merch.totalPaidOut = merch.totalAdvancePaid + merch.totalRegularPaidOut;
            break;
          }
        }
      }
    });

    // 4. Calculate Final Balances
    merchantMap.forEach((merch) => {
      // Net Earned for merchant = (Net Goods delivered) - (Returns shipping fees deducted for returns received by merchant)
      // لما التاجر يستلم المرتجع يتخصم من حساب التاجر يعني يتخصم من الفلوس اللي ليه
      merch.netEarned = merch.netGoodsAmount - merch.deliveredToMerchantReturnsShippingDeducted;
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
        acc.totalAllWorkCod += m.totalAllWorkCod;
        acc.totalAllWorkShippingFees += m.totalAllWorkShippingFees;
        acc.totalAllWorkNetGoods += m.totalAllWorkNetGoods;
        acc.totalCodCollected += m.totalCodCollected;
        acc.totalShippingFees += m.totalShippingFees;
        acc.totalNetGoods += m.netGoodsAmount;
        acc.totalFullDeliveredNetGoods += m.fullDeliveredNetGoods;
        acc.totalFullDeliveredCount += m.fullDeliveredCount;
        acc.totalInTransitCount += m.inTransitCount;
        acc.totalInTransitCod += m.inTransitCod;
        acc.totalInTransitShippingFees += m.inTransitShippingFees;
        acc.totalInTransitNet += m.inTransitNet;
        acc.totalReturnsCount += m.returnsCount;
        acc.totalReturnsDeducted += m.returnsShippingDeducted;
        acc.totalReturnsGoodsValue += m.returnsGoodsValue;
        acc.totalReturnsTotalCod += m.returnsTotalCod;
        acc.totalPendingReturnsCount += m.pendingReturnsCount;
        acc.totalPendingReturnsGoodsValue += m.pendingReturnsGoodsValue;
        acc.totalDeliveredToMerchantReturnsCount += m.deliveredToMerchantReturnsCount;
        acc.totalDeliveredToMerchantReturnsGoodsValue += m.deliveredToMerchantReturnsGoodsValue;
        acc.totalPartialShippingCount += m.partialShippingCount;
        acc.totalPartialShippingCollected += m.partialShippingCollected;
        acc.totalCustomerCancellationCount += m.customerCancellationCount;
        acc.totalAdvancePaid += m.totalAdvancePaid;
        acc.totalPaidOut += m.totalPaidOut;
        acc.totalDueBalance += m.dueBalance;
        return acc;
      },
      {
        totalMerchants: 0,
        totalShipments: 0,
        totalAllWorkCod: 0,
        totalAllWorkShippingFees: 0,
        totalAllWorkNetGoods: 0,
        totalCodCollected: 0,
        totalShippingFees: 0,
        totalNetGoods: 0,
        totalFullDeliveredNetGoods: 0,
        totalFullDeliveredCount: 0,
        totalInTransitCount: 0,
        totalInTransitCod: 0,
        totalInTransitShippingFees: 0,
        totalInTransitNet: 0,
        totalReturnsCount: 0,
        totalReturnsDeducted: 0,
        totalReturnsGoodsValue: 0,
        totalReturnsTotalCod: 0,
        totalPendingReturnsCount: 0,
        totalPendingReturnsGoodsValue: 0,
        totalDeliveredToMerchantReturnsCount: 0,
        totalDeliveredToMerchantReturnsGoodsValue: 0,
        totalPartialShippingCount: 0,
        totalPartialShippingCollected: 0,
        totalCustomerCancellationCount: 0,
        totalAdvancePaid: 0,
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
      if (shipmentsFilter === 'full_delivered') return s.status === 'delivered';
      if (shipmentsFilter === 'partial_delivery') return s.status === 'partial_delivery';
      if (shipmentsFilter === 'partial_shipping') {
        const isCancel = s.refusedDetails?.isCustomerCancellationWithoutFee || s.refusedDetails?.reason?.includes('إلغاء') || s.refusedDetails?.reason?.includes('إعفاء');
        const collected = s.refusedDetails?.amountCollected || 0;
        const fee = s.financials?.shippingFee || 0;
        return (s.status === 'returned' || s.status === 'refused') && !isCancel && (s.refusedDetails?.partialShippingFeePaid || (collected > 0 && collected < fee));
      }
      if (shipmentsFilter === 'customer_cancellation') {
        return (s.status === 'returned' || s.status === 'refused') && (s.refusedDetails?.isCustomerCancellationWithoutFee || s.refusedDetails?.reason?.includes('إلغاء') || s.refusedDetails?.reason?.includes('إعفاء'));
      }
      if (shipmentsFilter === 'in_transit') {
        return s.status !== 'delivered' && s.status !== 'partial_delivery' && s.status !== 'returned' && s.status !== 'refused';
      }
      if (shipmentsFilter === 'pending_returns') {
        return (s.status === 'returned' || s.status === 'refused') && !s.isReturnedToMerchant;
      }
      if (shipmentsFilter === 'received_returns') {
        return (s.status === 'returned' || s.status === 'refused') && Boolean(s.isReturnedToMerchant);
      }
      if (shipmentsFilter === 'returned') return s.status === 'returned' || s.status === 'refused';
      if (shipmentsFilter === 'unsettled') return !s.isMerchantSettled && s.financials.paidStatus !== 'settled';
      if (shipmentsFilter === 'settled') return s.isMerchantSettled || s.financials.paidStatus === 'settled';
      return true;
    });
  }, [selectedMerchantShipments, shipmentsFilter]);

  // Payout and advance transactions belonging to selected merchant
  const selectedMerchantTransactions = useMemo(() => {
    if (!selectedMerchant) return [];
    return companyTransactions.filter((txn) => {
      if (txn.type !== 'expense') return false;
      return matchesMerchant(txn, {
        id: selectedMerchant.id,
        storeName: selectedMerchant.storeName,
        name: selectedMerchant.name,
        phone: selectedMerchant.phone,
      });
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
            onClick={() => handleOpenAdvanceModal(selectedMerchant || null)}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="تسجيل سلفة نقدية أو دفعة مقدمة تخصم فوراً من حساب التاجر"
          >
            <HandCoins className="w-4 h-4 text-amber-200" />
            <span>+ تسجيل سلفة للتاجر</span>
          </button>

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

      {/* Advance Success Notification Banner */}
      {advanceSuccessBanner && (
        <div className="bg-emerald-900 text-white border-2 border-emerald-500 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-sm text-emerald-100">{advanceSuccessBanner.message}</p>
              <p className="text-xs text-emerald-300 mt-0.5">
                تم تحديث حساب التاجر تلقائياً وخصم المبلغ من "الصافي اللي ليه" وتسجيله في كشف الحساب والسلف.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {advanceSuccessBanner.merchantId && !selectedMerchant && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMerchantId(advanceSuccessBanner.merchantId!);
                  setShipmentsFilter('advances');
                }}
                className="bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                عرض كشف حساب التاجر والسلف
              </button>
            )}
            <button
              type="button"
              onClick={() => setAdvanceSuccessBanner(null)}
              className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Financial Metrics Cards */}
      {!selectedMerchant ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: All Work Complete Net (Without Shipping) */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-4.5 rounded-2xl border border-blue-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-blue-400" />
                حساب الشغل كامل (بدون الشحن)
              </span>
              <span className="text-[10px] bg-blue-800/60 text-blue-200 px-2 py-0.5 rounded-md font-mono">
                صافي كل البضائع
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-white font-mono">
              {totals.totalAllWorkNetGoods.toLocaleString()} <span className="text-sm font-bold text-blue-300">ج.م</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-blue-800/60 flex flex-col gap-0.5 text-[11px] text-blue-200">
              <span>إجمالي كل الشغل: <strong>{totals.totalAllWorkNetGoods.toLocaleString()} ج.م</strong> ({totals.totalShipments} شحنة)</span>
              <span className="text-blue-300/90 text-[10px]">المسلم: {totals.totalNetGoods.toLocaleString()} ج.م | قيد التسليم: {totals.totalInTransitNet.toLocaleString()} ج.م</span>
              <span className="text-blue-400/80 text-[10px]">إجمالي COD: {totals.totalAllWorkCod.toLocaleString()} ج.م - شحن: {totals.totalAllWorkShippingFees.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Card 2: In-Transit (قيد التسليم) */}
          <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white p-4.5 rounded-2xl border border-teal-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-400" />
                حساب قيد التسليم (مع المناديب)
              </span>
              <span className="text-[10px] bg-teal-900 text-teal-300 px-2 py-0.5 rounded-md font-mono">
                في الطريق
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-teal-300 font-mono">
              {totals.totalInTransitNet.toLocaleString()} <span className="text-sm font-bold text-teal-200">ج.م</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-teal-800/60 flex flex-col gap-0.5 text-[11px] text-teal-200">
              <span>صافي بضائع قيد التسليم: <strong>{totals.totalInTransitNet.toLocaleString()} ج.م</strong></span>
              <span className="text-[10px] text-teal-300/80">({totals.totalInTransitCount} شحنة في الطريق | تحصيل: {totals.totalInTransitCod.toLocaleString()} ج.م - شحن: {totals.totalInTransitShippingFees.toLocaleString()} ج.م)</span>
            </div>
          </div>

          {/* Card 3: Returns (حساب المرتجعات) */}
          <div className="bg-gradient-to-br from-red-950 to-slate-900 text-white p-4.5 rounded-2xl border border-red-900 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-red-400" />
                حساب المرتجعات
              </span>
              <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-md">
                تتخصم من اللي ليه
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-red-400 font-mono">
              {totals.totalReturnsGoodsValue.toLocaleString()} <span className="text-sm font-bold text-red-300">ج.م</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-red-900/60 flex flex-col gap-0.5 text-[11px] text-red-200">
              <span className="text-rose-200 font-bold">يخصم من فلوس التجار: <strong className="text-rose-300">-{totals.totalReturnsDeducted.toLocaleString()} ج.م</strong> (شحن المرتجع)</span>
              <span>بضاعة مرتجعة بحساب عادي: <strong>{totals.totalReturnsGoodsValue.toLocaleString()} ج.م</strong> ({totals.totalReturnsCount} أوردر)</span>
              <span className="text-[10px] text-amber-300">دفع جزء: {totals.totalPartialShippingCount} | إلغاء معفى: {totals.totalCustomerCancellationCount}</span>
            </div>
          </div>

          {/* Card 4: Total Advances & Paid Out to Merchants */}
          <div 
            onClick={() => handleOpenAdvanceModal(null)}
            className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4.5 rounded-2xl border border-amber-600/70 hover:border-amber-400 transition-all cursor-pointer shadow-md relative overflow-hidden group"
            title="انقر لتسجيل سلفة نقدية للتاجر"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <HandCoins className="w-4 h-4 text-amber-400" />
                سلف ومقدمات التجار (مخصومة)
              </span>
              <span className="text-[10px] bg-amber-600 group-hover:bg-amber-500 text-white px-2 py-0.5 rounded-md font-bold transition-colors">
                + تسجيل سلفة
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-amber-400 font-mono">
              {totals.totalAdvancePaid.toLocaleString()} <span className="text-sm font-bold text-amber-300">ج.م</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col gap-0.5 text-[11px] text-slate-300">
              <span>سلف ومقدمات مخصومة: <strong>{totals.totalAdvancePaid.toLocaleString()} ج.م</strong></span>
              <span className="text-[10px] text-slate-400">إجمالي المنصرف والمسحوبات: {totals.totalPaidOut.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Card 5: Net Due Balance (حساب التجار - ليهم كام) */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-4.5 rounded-2xl border border-emerald-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                حساب التجار (ليهم كام)
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                صافي مستحق
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
              {totals.totalDueBalance.toLocaleString()} <span className="text-sm font-bold text-emerald-300">ج.م</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-emerald-200">
              <span>(الشغل المسلم - شحن المرتجع - السلف)</span>
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
                  <th className="py-3 px-3 text-center">سعر الشحن</th>
                  <th className="py-3 px-3 text-center">عدد الشحنات</th>
                  <th className="py-3 px-3">حساب الشغل كامل (بدون الشحن)</th>
                  <th className="py-3 px-3">قيد التسليم (في الطريق)</th>
                  <th className="py-3 px-3">شحن المرتجعات المخصوم</th>
                  <th className="py-3 px-3">السلف والمسحوبات</th>
                  <th className="py-3 px-3">التاجر ليه كام (المستحق)</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400">
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
                            {merch.totalAllWorkNetGoods.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] text-blue-700 font-bold">
                            المسلم: {merch.netGoodsAmount.toLocaleString()} ج.م ({merch.deliveredCount + merch.partialCount} شحنة)
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            COD: {merch.totalAllWorkCod.toLocaleString()} - شحن: {merch.totalAllWorkShippingFees.toLocaleString()}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-black font-mono text-teal-800 text-sm">
                            {merch.inTransitNet.toLocaleString()} ج.م
                          </span>
                          <p className="text-[10px] text-teal-700 font-bold">
                            صافي متوقع بدون الشحن
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            ({merch.inTransitCount} شحنة | تحصيل: {merch.inTransitCod.toLocaleString()} ج.م)
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-black font-mono text-rose-700 text-sm">
                            {merch.deliveredToMerchantReturnsShippingDeducted > 0
                              ? `-${merch.deliveredToMerchantReturnsShippingDeducted.toLocaleString()} ج.م`
                              : '0 ج.م'}
                          </span>
                          <p className={`text-[10px] font-bold ${merch.deliveredToMerchantReturnsShippingDeducted > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                            مخصوم من حسابه (مستلم): -{merch.deliveredToMerchantReturnsShippingDeducted.toLocaleString()} ج.م
                          </p>
                          {merch.pendingReturnsCount > 0 ? (
                            <p className="text-[10px] text-amber-700 font-bold font-mono">
                              معلق لم يستلم: {merch.pendingReturnsCount} أوردر ({merch.pendingReturnsShippingDeducted.toLocaleString()} ج.م يُخصم فور الاستلام)
                            </p>
                          ) : (
                            <p className="text-[9px] text-emerald-700 font-bold">
                              ✅ مستلم ومخصوم بالكامل ({merch.deliveredToMerchantReturnsCount} أوردر)
                            </p>
                          )}
                          <p className="text-[9px] text-slate-500">
                            بضائع المرتجع: {merch.returnsGoodsValue.toLocaleString()} ج.م
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div>
                          <span className="font-bold text-amber-800 font-mono">
                            {merch.totalPaidOut.toLocaleString()} ج.م
                          </span>
                          {merch.totalAdvancePaid > 0 && (
                            <p className="text-[10px] text-amber-700 font-bold">
                              منها سلف: {merch.totalAdvancePaid.toLocaleString()} ج.م
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            تم صرفها
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

                          {isAdmin && (
                            <button
                              onClick={() => handleOpenAdvanceModal(merch)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-amber-300 flex items-center gap-1 cursor-pointer"
                              title="تسجيل سلفة نقدية أو دفعة مقدمة تخصم من المستحقات"
                            >
                              <HandCoins className="w-3.5 h-3.5 text-amber-600" />
                              <span>سلفة</span>
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
                {isAdmin && (
                  <button
                    onClick={() => handleOpenAdvanceModal(selectedMerchant)}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none cursor-pointer"
                    title="تسجيل سلفة نقدية أو دفعة مقدمة تخصم من المستحقات"
                  >
                    <HandCoins className="w-4 h-4 text-amber-200" />
                    <span>تسجيل سلفة / دفعة مقدمة</span>
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

            {/* Live Financial Calculation Equation Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs mt-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-slate-100">معادلة حساب التاجر:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap font-mono font-bold text-slate-300">
                {/* 1. شغله المتسلم */}
                <span className="text-blue-300 bg-blue-950/70 px-2.5 py-1 rounded-lg border border-blue-800" title="إجمالي قيمة بضائع الشغل المتسلم للشركة (المسلمة + المرتجعة للتاجر)">
                  شغله المتسلم: +{(selectedMerchant.netGoodsAmount + selectedMerchant.deliveredToMerchantReturnsGoodsValue).toLocaleString()} ج.م
                </span>

                <span className="text-slate-400 font-sans text-base">-</span>

                {/* 2. شغله المرتجع */}
                <span className="text-rose-300 bg-rose-950/70 px-2.5 py-1 rounded-lg border border-rose-800" title="قيمة بضائع شغله المرتجع التي استلمها التاجر">
                  شغله المرتجع: -{selectedMerchant.deliveredToMerchantReturnsGoodsValue.toLocaleString()} ج.م
                </span>

                <span className="text-slate-400 font-sans text-base">-</span>

                {/* 3. شحن المرتجع */}
                <span className="text-red-300 bg-red-950/70 px-2.5 py-1 rounded-lg border border-red-800" title="مصاريف شحن المرتجعات المستلمة للتاجر">
                  شحن المرتجع: -{selectedMerchant.deliveredToMerchantReturnsShippingDeducted.toLocaleString()} ج.م
                </span>

                <span className="text-slate-400 font-sans text-base">-</span>

                {/* 4. السلفة */}
                <span className="text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-800" title="السلف النقدية والمسحوبات الصادرة للتاجر">
                  السلفة: -{selectedMerchant.totalPaidOut.toLocaleString()} ج.م
                </span>

                <span className="text-slate-400 font-sans text-base">=</span>

                {/* 5. الصافي اللي ليه */}
                <span className={`px-3 py-1 rounded-lg border font-black text-sm ${
                  selectedMerchant.dueBalance >= 0
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-600'
                    : 'text-rose-300 bg-rose-950/80 border-rose-600'
                }`}>
                  الصافي اللي ليه: {selectedMerchant.dueBalance.toLocaleString()} ج.م
                </span>

                {selectedMerchant.pendingReturnsCount > 0 && (
                  <span className="text-[10px] text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60 font-sans font-medium" title="شحنات مرتجعة لم يستلمها التاجر بعد بالمستودع، وتُخصم فور استلامه لها">
                    ⏳ معلق لم يستلم: {selectedMerchant.pendingReturnsCount} أوردر (شحن {selectedMerchant.pendingReturnsShippingDeducted.toLocaleString()} ج.م يُخصم فور الاستلام)
                  </span>
                )}
              </div>
            </div>

            {/* 6 Financial Breakdown Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
              {/* Box 1: All Work Net (الشغل كامل بدون الشحن) */}
              <div className="bg-blue-50/70 border border-blue-200/90 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-blue-900 mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                      صافي الشغل كامل
                    </span>
                    <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-black">
                      بدون الشحن
                    </span>
                  </div>
                  <p className="text-lg font-black text-blue-950 font-mono">
                    {selectedMerchant.totalAllWorkNetGoods.toLocaleString()} <span className="text-xs font-bold text-blue-700">ج.م</span>
                  </p>
                </div>
                <div className="text-[10px] text-blue-700 mt-2 pt-1.5 border-t border-blue-200/60 space-y-0.5 font-medium">
                  <p>كل الأوردرات: <strong>{selectedMerchant.totalShipmentsCount}</strong> شحنة</p>
                  <p className="text-blue-600 font-mono text-[9px]">COD: {selectedMerchant.totalAllWorkCod.toLocaleString()} - شحن: {selectedMerchant.totalAllWorkShippingFees.toLocaleString()}</p>
                </div>
              </div>

              {/* Box 2: Delivered Work (تم التسليم) */}
              <div className="bg-emerald-50/60 border border-emerald-200/90 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-emerald-900 mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      تم التسليم (المسلم)
                    </span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-black">
                      شغله المسلم
                    </span>
                  </div>
                  <p className="text-lg font-black text-emerald-900 font-mono">
                    {selectedMerchant.netGoodsAmount.toLocaleString()} <span className="text-xs font-bold text-emerald-700">ج.م</span>
                  </p>
                </div>
                <div className="text-[10px] text-emerald-800 mt-2 pt-1.5 border-t border-emerald-200/60 space-y-0.5 font-medium">
                  <p>الناجحة: <strong>{selectedMerchant.deliveredCount + selectedMerchant.partialCount}</strong> أوردر</p>
                  <p className="text-[9px] text-emerald-700 font-mono">تحصيل كاش: {selectedMerchant.totalCodCollected.toLocaleString()} ج.م</p>
                </div>
              </div>

              {/* Box 3: In-Transit (قيد التوصيل) */}
              <div className="bg-teal-50/60 border border-teal-200/90 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-teal-900 mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-teal-600" />
                      قيد التوصيل
                    </span>
                    <span className="text-[9px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-black">
                      في الطريق
                    </span>
                  </div>
                  <p className="text-lg font-black text-teal-900 font-mono">
                    {selectedMerchant.inTransitNet.toLocaleString()} <span className="text-xs font-bold text-teal-700">ج.م</span>
                  </p>
                </div>
                <div className="text-[10px] text-teal-800 mt-2 pt-1.5 border-t border-teal-200/60 space-y-0.5 font-medium">
                  <p>العدد: <strong>{selectedMerchant.inTransitCount}</strong> أوردر</p>
                  <p className="text-[9px] text-teal-700 font-mono">COD متوقع: {selectedMerchant.inTransitCod.toLocaleString()} ج.م</p>
                </div>
              </div>

              {/* Box 4: Returns (حساب المرتجعات) */}
              <div className="bg-red-50/60 border border-red-200/90 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-red-900 mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                      حساب المرتجع
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                      selectedMerchant.pendingReturnsCount === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {selectedMerchant.pendingReturnsCount === 0
                        ? `✅ مستلم ومخصوم (${selectedMerchant.deliveredToMerchantReturnsCount})`
                        : `معلق لم يستلم (${selectedMerchant.pendingReturnsCount})`}
                    </span>
                  </div>
                  {/* Big Number: Real deduction from merchant's balance */}
                  <p className="text-lg font-black text-red-700 font-mono">
                    {selectedMerchant.deliveredToMerchantReturnsShippingDeducted > 0
                      ? `-${selectedMerchant.deliveredToMerchantReturnsShippingDeducted.toLocaleString()}`
                      : '0'}{' '}
                    <span className="text-xs font-bold text-red-600">ج.م</span>
                  </p>
                  <p className="text-[10px] font-black text-red-800">
                    {selectedMerchant.deliveredToMerchantReturnsShippingDeducted > 0
                      ? 'مخصوم من حسابه فعلياً'
                      : selectedMerchant.pendingReturnsShippingDeducted > 0
                      ? 'معلق لم يستلم (يُخصم فور الاستلام)'
                      : 'لا يوجد خصم مرتجع'}
                  </p>
                </div>
                <div className="text-[10px] text-red-800 mt-2 pt-1.5 border-t border-red-200/60 space-y-0.5 font-medium">
                  {selectedMerchant.pendingReturnsCount > 0 ? (
                    <p className="text-amber-900 font-bold">
                      معلق بالمستودع: <strong>{selectedMerchant.pendingReturnsCount}</strong> أوردر ({selectedMerchant.pendingReturnsShippingDeducted.toLocaleString()} ج.م يُخصم فور الاستلام)
                    </p>
                  ) : (
                    <p className="text-emerald-800 font-bold">
                      ✅ استلم كافة المرتجعات وتم خصمها من حسابه
                    </p>
                  )}
                  <p className="text-[9px] text-slate-600 font-bold">
                    إجمالي بضائع المرتجع: {selectedMerchant.returnsCount} أوردر ({selectedMerchant.returnsGoodsValue.toLocaleString()} ج.م)
                  </p>
                  <p className="text-[9px] text-slate-500">
                    مستلم للتاجر: {selectedMerchant.deliveredToMerchantReturnsCount} ({selectedMerchant.deliveredToMerchantReturnsGoodsValue.toLocaleString()} ج.م)
                  </p>
                  {selectedMerchant.pendingReturnsCount > 0 && onMarkAllMerchantReturns && (
                    <button
                      type="button"
                      onClick={() => {
                        const pendingIds = selectedMerchantShipments
                          .filter((s) => (s.status === 'returned' || s.status === 'refused') && !s.isReturnedToMerchant)
                          .map((s) => s.id);
                        if (pendingIds.length > 0) onMarkAllMerchantReturns(pendingIds);
                      }}
                      className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <PackageCheck className="w-3 h-3" />
                      <span>استلام كافة المرتجعات وخصمها من حسابه</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Box 5: Advances (سلف ومقدمات مخصومة) */}
              <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-amber-900 mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <HandCoins className="w-3.5 h-3.5 text-amber-600" />
                      سلف ومقدمات
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAdvanceModal(selectedMerchant)}
                      className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white px-1.5 py-0.5 rounded font-black transition-colors cursor-pointer"
                      title="تسجيل سلفة نقدية جديدة لهذا التاجر"
                    >
                      + سلفة
                    </button>
                  </div>
                  <p className="text-lg font-black text-amber-800 font-mono">
                    {selectedMerchant.totalAdvancePaid.toLocaleString()} <span className="text-xs font-bold text-amber-700">ج.م</span>
                  </p>
                </div>
                <div className="text-[10px] text-amber-800 mt-2 pt-1.5 border-t border-amber-200/80 space-y-0.5 font-medium">
                  <p>عدد السلف: <strong>{selectedMerchant.advanceTransactions.length}</strong> دفعة</p>
                  <p className="text-[9px] text-amber-900 font-mono">إجمالي المنصرف: {selectedMerchant.totalPaidOut.toLocaleString()} ج.م</p>
                </div>
              </div>

              {/* Box 6: Due Balance (الصافي اللي ليه) */}
              <div className={`p-3.5 rounded-xl shadow-xs border flex flex-col justify-between ${
                selectedMerchant.dueBalance > 0
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : selectedMerchant.dueBalance < 0
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      الصافي اللي ليه
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                      selectedMerchant.dueBalance > 0
                        ? 'bg-emerald-200 text-emerald-900'
                        : selectedMerchant.dueBalance < 0
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {selectedMerchant.dueBalance > 0 ? 'مستحق له' : selectedMerchant.dueBalance < 0 ? 'مديونية' : 'خالص'}
                    </span>
                  </div>
                  <p className="text-lg font-black font-mono">
                    {selectedMerchant.dueBalance.toLocaleString()} <span className="text-xs font-bold">ج.م</span>
                  </p>
                </div>
                <div className="text-[10px] mt-2 pt-1.5 border-t border-current/20 font-bold opacity-85 space-y-0.5">
                  <p className="font-mono text-[9px] leading-tight">
                    ({(selectedMerchant.netGoodsAmount + selectedMerchant.deliveredToMerchantReturnsGoodsValue).toLocaleString()} متسلم - {selectedMerchant.deliveredToMerchantReturnsGoodsValue.toLocaleString()} مرتجع - {selectedMerchant.deliveredToMerchantReturnsShippingDeducted.toLocaleString()} شحن - {selectedMerchant.totalPaidOut.toLocaleString()} سلفة)
                  </p>
                </div>
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
                  type="button"
                  onClick={() => setShipmentsFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  الكل ({selectedMerchantShipments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('delivered')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  المسلم والناجح ({selectedMerchant.deliveredCount + selectedMerchant.partialCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('in_transit')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'in_transit'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  قيد التوصيل ({selectedMerchant.inTransitCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('returned')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'returned'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                  }`}
                >
                  المرتجعات ({selectedMerchant.returnsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('pending_returns')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'pending_returns'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  مرتجعات معلقة ({selectedMerchant.pendingReturnsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('received_returns')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'received_returns'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
                  }`}
                >
                  مرتجعات استلمها التاجر ({selectedMerchant.deliveredToMerchantReturnsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('advances')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'advances'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  السلف والدفعات المقدمة ({selectedMerchant.advanceTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('unsettled')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'unsettled'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  متبقي لم يصرف ({selectedMerchant.unsettledShipmentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShipmentsFilter('settled')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    shipmentsFilter === 'settled'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  تم الصرف للتاجر ({selectedMerchant.settledShipmentsCount})
                </button>
              </div>
            </div>

            {/* Pending Returns Banner */}
            {selectedMerchant.pendingReturnsCount > 0 && onMarkAllMerchantReturns && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    حساب المرتجعات المعلقة للتاجر: <strong>{selectedMerchant.pendingReturnsGoodsValue.toLocaleString()} ج.م</strong> ({selectedMerchant.pendingReturnsCount} أوردر لم يستلمها التاجر بعد). عند تأكيد استلام التاجر، تخصم من مبلغ المرتجعات وتصبح 0 ج.م عند استلام الكل.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pendingIds = selectedMerchantShipments
                      .filter((s) => (s.status === 'returned' || s.status === 'refused') && !s.isReturnedToMerchant)
                      .map((s) => s.id);
                    if (pendingIds.length > 0) onMarkAllMerchantReturns(pendingIds);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>تأكيد استلام التاجر لكافة المرتجعات (تصفير حساب المرتجع)</span>
                </button>
              </div>
            )}

            {/* Table: Advances List OR Shipments List */}
            {shipmentsFilter === 'advances' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-amber-50/90 text-amber-950 font-extrabold border-b border-amber-200">
                    <tr>
                      <th className="py-3 px-4">تاريخ السلفة</th>
                      <th className="py-3 px-3">مبلغ السلفة</th>
                      <th className="py-3 px-3">طريقة الصرف</th>
                      <th className="py-3 px-3">البيان والملاحظات</th>
                      <th className="py-3 px-3">المسؤول عن الصرف</th>
                      <th className="py-3 px-3 text-center">حالة الخصم</th>
                      <th className="py-3 px-4 text-center">إلغاء / حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMerchant.advanceTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <HandCoins className="w-9 h-9 text-amber-300" />
                            <p className="font-extrabold text-slate-700 text-sm">لا توجد سلف أو دفعات مقدمة مسجلة لهذا التاجر حالياً</p>
                            <p className="text-xs text-slate-500">يمكنك تسجيل سلفة نقدية فوراً وتخصم تلقائياً من الصافي المستحق للتاجر</p>
                            <button
                              type="button"
                              onClick={() => handleOpenAdvanceModal(selectedMerchant)}
                              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <HandCoins className="w-4 h-4" />
                              <span>+ تسجيل سلفة نقدية للتاجر الآن</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      selectedMerchant.advanceTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{txn.date}</td>
                          <td className="py-3 px-3 font-mono font-black text-amber-800 text-sm">
                            {txn.amount.toLocaleString()} ج.م
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              {txn.paymentMethod === 'cash' ? 'كاش من الخزينة' :
                               txn.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                               txn.paymentMethod === 'instapay' ? 'إنستاباي' :
                               txn.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'أخرى'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            <span className="font-bold">{txn.title}</span>
                            {txn.notes && <p className="text-[11px] text-slate-500 mt-0.5">{txn.notes}</p>}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">{txn.createdBy || 'الأدمن'}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded text-[10px] font-bold">
                              مخصومة من المستحق ✅
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من إلغاء وحذف هذه السلفة وإرجاع قيمتها لمستحقات التاجر؟')) {
                                  onDeleteTransaction(txn.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف هذه السلفة"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
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
                      <th className="py-3 px-3 text-center">حالة المرتجع والخصم</th>
                      <th className="py-3 px-3 text-center">استلام التاجر للمرتجع</th>
                      <th className="py-3 px-4 text-center">حالة صرف الفلوس</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSelectedShipments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
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
                                    : 'bg-teal-100 text-teal-800'
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
                                ? (s.refusedDetails?.originalCodAmount ?? s.financials.codAmount).toLocaleString()
                                : s.financials.codAmount.toLocaleString()} ج.م
                              {isReturned && (
                                <span className="block text-[10px] text-amber-800 font-bold">
                                  بضاعة: {(s.refusedDetails?.originalGoodsValue ?? Math.max(0, (s.refusedDetails?.originalCodAmount ?? s.financials.codAmount) - s.financials.shippingFee)).toLocaleString()} ج.م
                                </span>
                              )}
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
                                <span className="text-teal-700 font-mono font-bold text-[11px]">
                                  {Math.max(0, s.financials.codAmount - s.financials.shippingFee).toLocaleString()} ج.م (متوقع)
                                </span>
                              )}
                            </td>

                            {/* Return Status & Deduction */}
                            <td className="py-3 px-3 text-center">
                              {isReturned ? (
                                (() => {
                                  const isCancelExempt = s.refusedDetails?.isCustomerCancellationWithoutFee === true ||
                                    s.refusedDetails?.reason?.includes('إلغاء') ||
                                    s.refusedDetails?.reason?.includes('إعفاء');
                                  let deductedFee = 0;
                                  if (isCancelExempt) {
                                    deductedFee = 0;
                                  } else if (s.refusedDetails?.merchantDeductedAmount !== undefined) {
                                    deductedFee = Number(s.refusedDetails.merchantDeductedAmount) || 0;
                                  } else if (s.refusedDetails?.partialShippingFeePaid || ((s.refusedDetails?.amountCollected || 0) > 0 && (s.refusedDetails?.amountCollected || 0) < s.financials.shippingFee)) {
                                    const col = Number(s.refusedDetails?.amountCollected) || 0;
                                    deductedFee = Math.max(0, s.financials.shippingFee - col);
                                  } else if ((s.refusedDetails?.amountCollected || 0) >= s.financials.shippingFee && s.financials.shippingFee > 0) {
                                    deductedFee = 0;
                                  } else {
                                    deductedFee = s.financials.shippingFee;
                                  }

                                  if (isCancelExempt) {
                                    return (
                                      <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-200">
                                        إلغاء عميل (معفى 0 ج.م) 🚫
                                      </span>
                                    );
                                  }

                                  if (deductedFee === 0) {
                                    return (
                                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                                        دفع العميل الشحن (معفى 0 ج.م) ✅
                                      </span>
                                    );
                                  }

                                  if (s.isReturnedToMerchant) {
                                    return (
                                      <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-black border border-red-200">
                                          مخصوم من حسابه: -{deductedFee} ج.م ❌
                                        </span>
                                        <span className="text-[9px] text-emerald-700 font-bold">
                                          (تم استلامه وخُصم من الفلوس اللي ليه)
                                        </span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300">
                                        معلق بالمستودع ({deductedFee} ج.م) ⏳
                                      </span>
                                      <span className="text-[9px] text-amber-700 font-semibold">
                                        يُخصم فور استلام التاجر له
                                      </span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* Return Received by Merchant Action */}
                            <td className="py-3 px-3 text-center">
                              {isReturned ? (
                                s.isReturnedToMerchant ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-extrabold border border-emerald-300 flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>تم استلام التاجر (مخصوم)</span>
                                    </span>
                                    {onMarkReturnedToMerchant && (
                                      <button
                                        type="button"
                                        onClick={() => onMarkReturnedToMerchant(s.id, true)}
                                        className="text-[10px] text-slate-500 hover:text-red-600 underline font-medium cursor-pointer"
                                        title="إلغاء استلام التاجر وإلغاء الخصم من حسابه"
                                      >
                                        إلغاء الاستلام
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>معلق بالمستودع</span>
                                    </span>
                                    {onMarkReturnedToMerchant && (
                                      <button
                                        type="button"
                                        onClick={() => onMarkReturnedToMerchant(s.id, false)}
                                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="تأكيد استلام التاجر لهذه البضاعة المرتجعة وخصم مصاريف شحنها فوراً من الفلوس اللي ليه"
                                      >
                                        <PackageCheck className="w-3 h-3" />
                                        <span>تأكيد استلام التاجر (خصم من حسابه)</span>
                                      </button>
                                    )}
                                  </div>
                                )
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
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
            )}
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
      {/* MODAL 1.B: RECORD ADVANCE PAYMENT / PREPAYMENT (تسجيل سلفة نقدية للتاجر)  */}
      {/* ========================================================================= */}
      {isAdvanceModalOpen && (
        (() => {
          const currentModalMerchant = advanceModalMerchant || selectedMerchant || (merchantsList.length > 0 ? merchantsList[0] : null);
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <HandCoins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        <span>تسجيل سلفة نقدية / دفعة مقدمة</span>
                      </h4>
                      <p className="text-xs text-amber-200 mt-0.5">
                        {currentModalMerchant ? (
                          <>التاجر المستفيد: <strong className="text-white">{currentModalMerchant.storeName}</strong> ({currentModalMerchant.name})</>
                        ) : (
                          <span>اختر التاجر المستفيد من السلفة</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdvanceModalOpen(false)}
                    className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleConfirmAdvance} className="p-6 space-y-4 text-right">
                  {/* Merchant Selector (if multiple or to switch merchant) */}
                  {merchantsList.length > 0 && (
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1.5">
                        التاجر / المتجر المستفيد من السلفة *
                      </label>
                      <select
                        value={currentModalMerchant?.id || ''}
                        onChange={(e) => {
                          const found = merchantsList.find((m) => m.id === e.target.value);
                          if (found) {
                            setAdvanceModalMerchant(found);
                            setAdvanceForm((prev) => ({
                              ...prev,
                              notes: `سلفة نقدية / دفعة مقدمة تحت الحساب للتاجر (${found.storeName})`,
                            }));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-200 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-amber-50/20 cursor-pointer"
                      >
                        {merchantsList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.storeName} ({m.name}) — الصافي المستحق له: {m.dueBalance.toLocaleString()} ج.م
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Current Balances Context Banner */}
                  {currentModalMerchant && (
                    <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">الصافي الحالي المستحق للتاجر:</span>
                        <span className={`font-mono font-black text-sm ${currentModalMerchant.dueBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {currentModalMerchant.dueBalance.toLocaleString()} ج.م
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        ⚠️ هذه السلفة تعتبر دفعة نقدية مقدمة تحت الحساب وستُخصم فوراً وتلقائياً من "الصافي اللي ليه" للتاجر وتظهر في كشف حسابه وسجل المسحوبات والسلف.
                      </p>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      المبلغ المطلوب صرفه كسلفة مقدمة (ج.م) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        required
                        autoFocus
                        value={advanceForm.amount || ''}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-300 font-mono text-lg font-black focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 bg-amber-50/20"
                        placeholder="اكتب مبلغ السلفة مثلاً 500 أو 1000..."
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ج.م
                      </span>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className="text-[10px] text-slate-500 font-bold ml-1">مبالغ سريعة:</span>
                      {[200, 500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdvanceForm({ ...advanceForm, amount: amt })}
                          className="px-2 py-0.5 bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer"
                        >
                          +{amt.toLocaleString()} ج.م
                        </button>
                      ))}
                      {currentModalMerchant && currentModalMerchant.dueBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setAdvanceForm({ ...advanceForm, amount: currentModalMerchant.dueBalance })}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          كامل المستحق ({currentModalMerchant.dueBalance.toLocaleString()} ج.م)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Method & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        طريقة التسليم / الصرف *
                      </label>
                      <select
                        value={advanceForm.paymentMethod}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none bg-white cursor-pointer"
                      >
                        <option value="cash">كاش نقدياً من الخزينة</option>
                        <option value="vodafone_cash">فودافون كاش / محفظة</option>
                        <option value="instapay">إنستاباي (InstaPay)</option>
                        <option value="bank_transfer">تحويل بنكي</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        تاريخ السلفة *
                      </label>
                      <input
                        type="date"
                        required
                        value={advanceForm.date}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Receipt No */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم الإيصال أو المرجع (اختياري)
                    </label>
                    <input
                      type="text"
                      value={advanceForm.receiptNo}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, receiptNo: e.target.value })}
                      placeholder="مثال: ADV-1024 أو رقم تحويل إنستاباي"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      البيان وملاحظات السلفة
                    </label>
                    <input
                      type="text"
                      value={advanceForm.notes}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                      placeholder="سبب السلفة أو تفاصيل إضافية..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  {/* Modal Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAdvanceModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={advanceForm.amount <= 0 || !currentModalMerchant}
                      className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HandCoins className="w-4 h-4" />
                      <span>تأكيد تسجيل السلفة وخصمها فوراً</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()
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
