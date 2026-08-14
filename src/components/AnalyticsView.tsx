import React, { useState, useMemo } from 'react';
import { Shipment, CourierInfo, MerchantWallet, CompanyTransaction } from '../types';
import { BOSTA_COURIERS, BOSTA_HUBS } from '../data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Truck, 
  PackageX, 
  DollarSign,
  UserCheck,
  Star,
  Award,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  Search,
  Clock,
  RotateCcw,
  Store,
  Wallet,
  Receipt,
  Package
} from 'lucide-react';

interface AnalyticsViewProps {
  shipments: Shipment[];
  couriers?: CourierInfo[];
  wallet?: MerchantWallet;
  companyTransactions?: CompanyTransaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  shipments, 
  couriers: couriersProp,
  wallet,
  companyTransactions = []
}) => {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'courier_reports' | 'merchant_reports' | 'logistics_overview'>('courier_reports');

  const todayStr = new Date().toISOString().substring(0, 10);
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Filter state for Reports
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedCourierId, setSelectedCourierId] = useState<string>('all');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract available merchants from shipments
  const availableMerchants = useMemo(() => {
    const merchantsSet = new Set<string>();
    shipments.forEach(s => {
      if (s.sender?.storeName) {
        merchantsSet.add(s.sender.storeName);
      }
    });
    return Array.from(merchantsSet).sort();
  }, [shipments]);

  // Extract available dates & months from shipments for dropdown options
  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    shipments.forEach(s => {
      if (s.createdAt) {
        const d = s.createdAt.substring(0, 10);
        if (d.match(/^\d{4}-\d{2}-\d{2}$/)) datesSet.add(d);
      }
    });
    const today = new Date().toISOString().split('T')[0];
    datesSet.add(today);
    return Array.from(datesSet).sort().reverse();
  }, [shipments]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    shipments.forEach(s => {
      if (s.createdAt) {
        const m = s.createdAt.substring(0, 7);
        if (m.match(/^\d{4}-\d{2}$/)) monthsSet.add(m);
      }
    });
    const currentMonth = new Date().toISOString().substring(0, 7);
    monthsSet.add(currentMonth);
    return Array.from(monthsSet).sort().reverse();
  }, [shipments]);

  // Filter shipments according to selected period & filters
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      // Period filter
      if (reportPeriod === 'daily') {
        const sDate = s.createdAt ? s.createdAt.substring(0, 10) : '';
        if (sDate && sDate !== selectedDate) return false;
      } else if (reportPeriod === 'weekly') {
        const sDateStr = s.createdAt ? s.createdAt.substring(0, 10) : '';
        if (sDateStr) {
          const sTime = new Date(sDateStr).getTime();
          const targetTime = new Date(selectedDate).getTime();
          const diffDays = (targetTime - sTime) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays >= 7) return false;
        }
      } else if (reportPeriod === 'monthly') {
        const sMonth = s.createdAt ? s.createdAt.substring(0, 7) : '';
        if (sMonth && sMonth !== selectedMonth) return false;
      }

      // Hub filter
      if (selectedHub !== 'all' && s.assignedHub !== selectedHub) {
        return false;
      }

      // Courier filter
      if (selectedCourierId !== 'all' && s.assignedCourier?.id !== selectedCourierId && s.assignedCourierId !== selectedCourierId) {
        return false;
      }

      // Merchant filter
      if (selectedMerchant !== 'all' && s.sender?.storeName !== selectedMerchant) {
        return false;
      }

      return true;
    });
  }, [shipments, reportPeriod, selectedDate, selectedMonth, selectedHub, selectedCourierId, selectedMerchant]);

  // Build Merchant Performance & Settlement List based on filtered shipments
  const merchantPerformanceList = useMemo(() => {
    const merchantMap = new Map<string, { storeName: string; contactName: string; phone: string }>();

    // Collect all unique merchants
    shipments.forEach(s => {
      const storeName = s.sender?.storeName || 'تاجر عام';
      if (!merchantMap.has(storeName)) {
        merchantMap.set(storeName, {
          storeName,
          contactName: s.sender?.contactName || storeName,
          phone: s.sender?.phone || '—',
        });
      }
    });

    let merchants = Array.from(merchantMap.values());

    // Filter by specific selected merchant if applicable
    if (selectedMerchant !== 'all') {
      merchants = merchants.filter(m => m.storeName === selectedMerchant);
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      merchants = merchants.filter(m => 
        m.storeName.toLowerCase().includes(q) || 
        m.contactName.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }

    return merchants.map(merchant => {
      // Find shipments of this merchant in the filtered period
      const merchantShipments = filteredShipments.filter(s => (s.sender?.storeName || 'تاجر عام') === merchant.storeName);

      const delivered = merchantShipments.filter(s => s.status === 'delivered').length;
      const partialDelivery = merchantShipments.filter(s => s.status === 'partial_delivery').length;
      const returned = merchantShipments.filter(s => s.status === 'returned').length;
      const refused = merchantShipments.filter(s => s.status === 'refused').length;
      const failedAttempt = merchantShipments.filter(s => s.status === 'failed_attempt').length;
      const inProgress = merchantShipments.filter(s => 
        ['created', 'pickup_requested', 'picked_up', 'in_hub', 'out_for_delivery'].includes(s.status)
      ).length;

      const totalDeliveredCount = delivered + partialDelivery;
      const totalReturnedCount = returned + refused;
      const totalShipments = merchantShipments.length;

      // Cash Collection COD calculation for Merchant
      const totalCod = merchantShipments.reduce((sum, s) => {
        if (s.status === 'delivered') return sum + (s.financials?.codAmount || 0);
        if (s.status === 'partial_delivery') return sum + ((s.partialDetails?.partialCodAmount ?? s.financials?.codAmount) || 0);
        if ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid)) {
          return sum + (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials?.shippingFee || 0 : 0));
        }
        return sum;
      }, 0);

      // Shipping fees deducted
      const shippingFees = merchantShipments
        .filter(s => s.status === 'delivered' || s.status === 'partial_delivery' || s.status === 'refused' || s.status === 'returned')
        .reduce((sum, s) => sum + (s.financials?.shippingFee || 0), 0);

      // Net Payout to merchant across statuses
      const netPayout = merchantShipments.reduce((sum, s) => {
        if (s.status === 'delivered') {
          return sum + Math.max(0, (s.financials?.codAmount || 0) - (s.financials?.shippingFee || 0));
        }
        if (s.status === 'partial_delivery') {
          const cod = s.partialDetails?.partialCodAmount ?? (s.financials?.codAmount || 0);
          return sum + Math.max(0, cod - (s.financials?.shippingFee || 0));
        }
        if (s.status === 'refused' || s.status === 'returned') {
          const collected = s.refusedDetails?.amountCollected || 0;
          const fee = s.financials?.shippingFee || 0;
          if (s.refusedDetails?.shippingFeePaid || collected >= fee) {
            return sum; // Customer paid shipping, no deduction on merchant
          } else if (s.refusedDetails?.partialShippingFeePaid || collected > 0) {
            const deducted = s.refusedDetails?.merchantDeductedAmount ?? (fee - collected);
            return sum - deducted;
          } else {
            return sum - fee; // Customer didn't pay shipping, deduct fee from merchant
          }
        }
        return sum;
      }, 0);

      // Paid Out / Settled to merchant from company transactions or wallet
      const merchantExpenseTxns = companyTransactions.filter(
        t => t.type === 'expense' && (t.category === 'تسليم مستحقات تجار' || t.relatedMerchant) &&
        (t.relatedMerchant?.toLowerCase() === merchant.storeName.toLowerCase() || merchantMap.size === 1)
      );
      const paidOutTxnsSum = merchantExpenseTxns.reduce((sum, t) => sum + t.amount, 0);
      const paidOut = (wallet?.merchantName === merchant.storeName || merchantMap.size === 1)
        ? Math.max(paidOutTxnsSum, wallet?.totalPaidOut || 0)
        : paidOutTxnsSum;

      const remainingBalance = Math.max(0, netPayout - paidOut);

      // Success Rate Calculation
      let successRate = 100;
      if (totalShipments > 0) {
        const resolvedCount = totalDeliveredCount + totalReturnedCount + failedAttempt;
        if (resolvedCount > 0) {
          successRate = Math.round((totalDeliveredCount / resolvedCount) * 100);
        } else {
          successRate = 100;
        }
      }

      return {
        ...merchant,
        totalShipments,
        delivered,
        partialDelivery,
        totalDeliveredCount,
        returned,
        refused,
        totalReturnedCount,
        failedAttempt,
        inProgress,
        totalCod,
        shippingFees,
        netPayout,
        paidOut,
        remainingBalance,
        successRate,
      };
    });
  }, [filteredShipments, shipments, selectedMerchant, searchQuery, companyTransactions, wallet]);

  // Build Courier Performance Map based on filtered shipments
  const courierPerformanceList = useMemo(() => {
    const courierMap = new Map();

    // Populate active system couriers passed as prop or fallback mock
    const activeCouriers = (couriersProp && couriersProp.length > 0) ? couriersProp : BOSTA_COURIERS;
    activeCouriers.forEach(c => courierMap.set(c.id, c));
    
    // Also capture any custom courier attached to shipments
    shipments.forEach(s => {
      if (s.assignedCourier) {
        courierMap.set(s.assignedCourier.id, s.assignedCourier);
      }
    });

    let couriers = Array.from(courierMap.values());

    // Filter by specific selected courier if applicable
    if (selectedCourierId !== 'all') {
      couriers = couriers.filter(c => c.id === selectedCourierId);
    }

    // Filter by selected hub if applicable
    if (selectedHub !== 'all') {
      couriers = couriers.filter(c => c.assignedHub === selectedHub);
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      couriers = couriers.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.phone.includes(q) ||
        (c.assignedHub && c.assignedHub.toLowerCase().includes(q))
      );
    }

    return couriers.map(courier => {
      // Find shipments assigned to this courier in the selected period
      const courierShipments = filteredShipments.filter(s => s.assignedCourier?.id === courier.id || s.assignedCourierId === courier.id);

      const delivered = courierShipments.filter(s => s.status === 'delivered').length;
      const partialDelivery = courierShipments.filter(s => s.status === 'partial_delivery').length;
      const returned = courierShipments.filter(s => s.status === 'returned').length;
      const refused = courierShipments.filter(s => s.status === 'refused').length;
      const failedAttempt = courierShipments.filter(s => s.status === 'failed_attempt').length;
      const inProgress = courierShipments.filter(s => 
        s.status === 'out_for_delivery' || s.status === 'picked_up' || s.status === 'in_hub'
      ).length;

      const totalDeliveredCount = delivered + partialDelivery;
      const totalReturnedCount = returned + refused;
      const totalAssigned = courierShipments.length;

      // Cash Collection COD calculation
      const codCollected = courierShipments.reduce((sum, s) => {
        if (s.status === 'delivered') return sum + (s.financials?.codAmount || 0);
        if (s.status === 'partial_delivery') return sum + ((s.partialDetails?.partialCodAmount ?? s.financials?.codAmount) || 0);
        if ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid)) {
          return sum + (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials?.shippingFee || 0 : 0));
        }
        return sum;
      }, 0);

      // Settled COD (Already handed over to treasury)
      const settledCod = courierShipments
        .filter(s => s.isCourierSettled)
        .reduce((sum, s) => {
          if (s.status === 'delivered') return sum + (s.financials?.codAmount || 0);
          if (s.status === 'partial_delivery') return sum + ((s.partialDetails?.partialCodAmount ?? s.financials?.codAmount) || 0);
          if ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid)) {
            return sum + (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials?.shippingFee || 0 : 0));
          }
          return sum;
        }, 0);

      // Pending Custody (Still with courier)
      const pendingCustody = courierShipments
        .filter(s => !s.isCourierSettled && ['delivered', 'partial_delivery', 'refused', 'returned'].includes(s.status))
        .reduce((sum, s) => {
          if (s.status === 'delivered') return sum + (s.financials?.codAmount || 0);
          if (s.status === 'partial_delivery') return sum + ((s.partialDetails?.partialCodAmount ?? s.financials?.codAmount) || 0);
          if ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid)) {
            return sum + (s.refusedDetails?.amountCollected ?? (s.refusedDetails?.shippingFeePaid ? s.financials?.shippingFee || 0 : 0));
          }
          return sum;
        }, 0);

      // Shipping fees collected
      const shippingFees = courierShipments
        .filter(s => s.status === 'delivered' || s.status === 'partial_delivery')
        .reduce((sum, s) => sum + (s.financials?.shippingFee || 0), 0);

      // Courier Commission Earned calculation
      const commType = courier.commissionType || 'fixed';
      const commVal = courier.commissionValue ?? 20;

      // Pending commission specifically earned on unsettled shipments
      const pendingCommission = courierShipments
        .filter(s => !s.isCourierSettled && ['delivered', 'partial_delivery', 'refused', 'returned'].includes(s.status))
        .reduce((sum, s) => {
          if (
            s.status === 'delivered' ||
            s.status === 'partial_delivery' ||
            ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid))
          ) {
            if (commType === 'percentage') {
              return sum + ((s.financials?.shippingFee || 0) * commVal) / 100;
            }
            return sum + commVal;
          }
          return sum;
        }, 0);

      const pendingNetRequired = Math.max(0, pendingCustody - pendingCommission);

      const earnedCommission = courierShipments.reduce((sum, s) => {
        if (
          s.status === 'delivered' ||
          s.status === 'partial_delivery' ||
          ((s.status === 'refused' || s.status === 'returned') && ((s.refusedDetails?.amountCollected || 0) > 0 || s.refusedDetails?.shippingFeePaid))
        ) {
          if (commType === 'percentage') {
            return sum + ((s.financials?.shippingFee || 0) * commVal) / 100;
          }
          return sum + commVal;
        }
        return sum;
      }, 0);

      const netCod = codCollected || (reportPeriod === 'daily' && courierShipments.length === 0 ? courier.codCollectedToday : codCollected);
      const netRequiredCash = Math.max(0, netCod - earnedCommission);

      // Success Rate Calculation
      let successRate = 100;
      if (totalAssigned > 0) {
        const resolvedCount = totalDeliveredCount + totalReturnedCount + failedAttempt;
        if (resolvedCount > 0) {
          successRate = Math.round((totalDeliveredCount / resolvedCount) * 100);
        } else {
          successRate = 100;
        }
      } else {
        successRate = Math.round(courier.rating * 20); // Fallback estimate
      }

      return {
        ...courier,
        totalAssigned: totalAssigned || (reportPeriod === 'all' ? courier.activeShipmentsCount : 0),
        delivered,
        partialDelivery,
        totalDeliveredCount,
        returned,
        refused,
        failedAttempt,
        totalReturnedCount,
        inProgress,
        codCollected: netCod,
        settledCod,
        pendingCustody,
        pendingCommission,
        pendingNetRequired,
        shippingFees,
        earnedCommission,
        netRequiredCash,
        commissionType: commType,
        commissionValue: commVal,
        successRate,
      };
    });
  }, [filteredShipments, shipments, selectedCourierId, selectedHub, searchQuery, reportPeriod, couriersProp]);

  // Aggregates for Courier Reports
  const totalPeriodAssigned = courierPerformanceList.reduce((acc, c) => acc + c.totalAssigned, 0);
  const totalPeriodDelivered = courierPerformanceList.reduce((acc, c) => acc + c.totalDeliveredCount, 0);
  const totalPeriodReturned = courierPerformanceList.reduce((acc, c) => acc + c.totalReturnedCount, 0);
  const totalPeriodFailed = courierPerformanceList.reduce((acc, c) => acc + c.failedAttempt, 0);
  const totalPeriodCod = courierPerformanceList.reduce((acc, c) => acc + c.codCollected, 0);
  const totalPeriodSettledCod = courierPerformanceList.reduce((acc, c) => acc + c.settledCod, 0);
  const totalPeriodPendingCustody = courierPerformanceList.reduce((acc, c) => acc + c.pendingCustody, 0);
  const totalPeriodPendingCommission = courierPerformanceList.reduce((acc, c) => acc + c.pendingCommission, 0);
  const totalPeriodPendingNetRequired = courierPerformanceList.reduce((acc, c) => acc + c.pendingNetRequired, 0);
  const totalPeriodShippingFees = courierPerformanceList.reduce((acc, c) => acc + c.shippingFees, 0);
  const totalPeriodCommission = courierPerformanceList.reduce((acc, c) => acc + c.earnedCommission, 0);
  const totalPeriodNetRequired = courierPerformanceList.reduce((acc, c) => acc + c.netRequiredCash, 0);
  
  const overallSuccessRate = totalPeriodDelivered + totalPeriodReturned > 0 
    ? Math.round((totalPeriodDelivered / (totalPeriodDelivered + totalPeriodReturned)) * 100)
    : 100;

  // Aggregates for Merchant Reports
  const totalMerchantShipmentsCount = merchantPerformanceList.reduce((acc, m) => acc + m.totalShipments, 0);
  const totalMerchantDeliveredCount = merchantPerformanceList.reduce((acc, m) => acc + m.totalDeliveredCount, 0);
  const totalMerchantReturnedCount = merchantPerformanceList.reduce((acc, m) => acc + m.totalReturnedCount, 0);
  const totalMerchantCod = merchantPerformanceList.reduce((acc, m) => acc + m.totalCod, 0);
  const totalMerchantShippingFees = merchantPerformanceList.reduce((acc, m) => acc + m.shippingFees, 0);
  const totalMerchantNetPayout = merchantPerformanceList.reduce((acc, m) => acc + m.netPayout, 0);
  const totalMerchantPaidOut = merchantPerformanceList.reduce((acc, m) => acc + m.paidOut, 0);
  const totalMerchantRemainingBalance = merchantPerformanceList.reduce((acc, m) => acc + m.remainingBalance, 0);

  // Bar Chart Data for Couriers
  const courierChartData = courierPerformanceList.map(c => ({
    name: c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || ''),
    'تسليم ناجح': c.totalDeliveredCount,
    'مرتجع / رفض': c.totalReturnedCount,
    'محاولة فاشلة': c.failedAttempt,
    'جاري التسليم': c.inProgress,
  }));

  // Bar Chart Data for Merchants
  const merchantChartData = merchantPerformanceList.map(m => ({
    name: m.storeName.length > 15 ? m.storeName.substring(0, 15) + '...' : m.storeName,
    'تسليم ناجح': m.totalDeliveredCount,
    'مرتجع ورفض': m.totalReturnedCount,
    'الصافي المستحق': m.netPayout,
    'تحصيل الكاش': m.totalCod,
  }));

  // Daily/Monthly Timeline Data Trend Chart
  const trendData = useMemo(() => {
    const map = new Map<string, { dateLabel: string; delivered: number; returned: number; cod: number }>();

    filteredShipments.forEach(s => {
      const dateKey = s.createdAt ? s.createdAt.substring(0, 10) : 'غير محدد';
      if (!map.has(dateKey)) {
        map.set(dateKey, { dateLabel: dateKey, delivered: 0, returned: 0, cod: 0 });
      }
      const entry = map.get(dateKey)!;
      if (s.status === 'delivered' || s.status === 'partial_delivery') {
        entry.delivered += 1;
        entry.cod += s.financials?.codAmount || 0;
      } else if (s.status === 'returned' || s.status === 'refused') {
        entry.returned += 1;
      }
    });

    const result = Array.from(map.values()).sort((a, b) => a.dateLabel.localeCompare(b.dateLabel));
    return result.length > 0 ? result : [
      { dateLabel: selectedDate || 'اليوم', delivered: totalPeriodDelivered, returned: totalPeriodReturned, cod: totalPeriodCod }
    ];
  }, [filteredShipments, selectedDate, totalPeriodDelivered, totalPeriodReturned, totalPeriodCod]);

  // General Logistics (Governorate & Status Distribution)
  const statusCounts = shipments.reduce((acc: Record<string, number>, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'تم التسليم', value: statusCounts['delivered'] || 0, color: '#10B981' },
    { name: 'استلام جزئي', value: statusCounts['partial_delivery'] || 0, color: '#D97706' },
    { name: 'مع المندوب', value: statusCounts['out_for_delivery'] || 0, color: '#F59E0B' },
    { name: 'في المستودع', value: statusCounts['in_hub'] || 0, color: '#3B82F6' },
    { name: 'جديدة', value: statusCounts['created'] || 0, color: '#8B5CF6' },
    { name: 'رفض الاستلام', value: statusCounts['refused'] || 0, color: '#DC2626' },
    { name: 'محاولة فاشلة', value: statusCounts['failed_attempt'] || 0, color: '#F43F5E' },
    { name: 'مرتجع', value: statusCounts['returned'] || 0, color: '#EF4444' },
  ].filter(item => item.value > 0 || item.name === 'تم التسليم' || item.name === 'مع المندوب');

  const govCounts = shipments.reduce((acc: Record<string, number>, s) => {
    const gov = s.recipient.governorate || 'القاهرة';
    acc[gov] = (acc[gov] || 0) + 1;
    return acc;
  }, {});

  const govBarData = Object.keys(govCounts).map((gov) => ({
    governorate: gov,
    shipmentsCount: govCounts[gov],
  }));

  // CSV Export Handler
  const handleExportCSV = () => {
    if (activeSubTab === 'merchant_reports') {
      const headers = [
        'اسم التاجر / المتجر',
        'اسم المسؤول والتواصل',
        'الهاتف',
        'إجمالي الأوردرات',
        'التسليم الناجح',
        'استلام جزئي',
        'المرتجع والرفض',
        'محاولات فاشلة',
        'مبالغ الكاش COD (ج.م)',
        'مصاريف الشحن (ج.م)',
        'الصافي المستحق للتاجر (ج.م)',
        'نسبة النجاح %'
      ];

      const rows = merchantPerformanceList.map(m => [
        `"${m.storeName}"`,
        `"${m.contactName}"`,
        `"${m.phone}"`,
        m.totalShipments,
        m.delivered,
        m.partialDelivery,
        m.totalReturnedCount,
        m.failedAttempt,
        m.totalCod,
        m.shippingFees,
        m.netPayout,
        `${m.successRate}%`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `تقرير_تسويات_وأداء_التجار_${selectedMerchant !== 'all' ? selectedMerchant : 'كافة_التجار'}_${reportPeriod === 'daily' ? selectedDate : reportPeriod === 'monthly' ? selectedMonth : 'الكل'}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'اسم المندوب',
        'المستودع',
        'رقم الهاتف',
        'إجمالي الشحنات المسندة',
        'التسليم الناجح',
        'استلام جزئي',
        'المرتجع والرفض',
        'محاولات فاشلة',
        'المبالغ المحصلة COD (ج.م)',
        'نوع العمولة',
        'عمولة المندوب المستحقة (ج.م)',
        'الصافي المطلوب توريده (ج.م)',
        'رسوم الشحن (ج.م)',
        'نسبة النجاح %',
        'التقييم'
      ];

      const rows = courierPerformanceList.map(c => [
        `"${c.name}"`,
        `"${c.assignedHub}"`,
        `"${c.phone}"`,
        c.totalAssigned,
        c.delivered,
        c.partialDelivery,
        c.totalReturnedCount,
        c.failedAttempt,
        c.codCollected,
        `"${c.commissionType === 'percentage' ? `${c.commissionValue}% من الشحن` : `${c.commissionValue} ج.م/أوردر`}"`,
        c.earnedCommission,
        c.netRequiredCash,
        c.shippingFees,
        `${c.successRate}%`,
        c.rating
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `تقرير_تسليمات_المناديب_${reportPeriod === 'daily' ? selectedDate : reportPeriod === 'monthly' ? selectedMonth : 'الكل'}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Printable Header - visible only when printing */}
      <div className="hidden print:block text-right mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-black text-slate-900">شركة A&M Shipping للخدمات اللوجستية</h1>
        <h2 className="text-lg font-bold text-slate-700 mt-1">
          {activeSubTab === 'merchant_reports' ? 'تقرير كشوفات حسابات وتسويات التجار الرسمية' : 'تقرير تسليمات وتحصيلات المناديب الرسمية'} — الفترة ({reportPeriod === 'daily' ? `اليوم: ${selectedDate}` : reportPeriod === 'monthly' ? `الشهر: ${selectedMonth}` : 'إجمالي كافة الفترات'})
          {selectedMerchant !== 'all' ? ` — التاجر: ${selectedMerchant}` : ''}
        </h2>
        <div className="text-xs text-slate-500 mt-2 flex justify-between">
          <span>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</span>
          <span>
            {activeSubTab === 'merchant_reports'
              ? `إجمالي المستحق للتجار: ${totalMerchantNetPayout.toLocaleString()} ج.م`
              : `إجمالي الكاش المحصل: ${totalPeriodCod.toLocaleString()} ج.م`}
          </span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            منظومة التقارير والتحليلات اللوجستية
          </div>
          <h3 className="font-black text-xl sm:text-2xl flex items-center gap-2.5 text-white">
            <BarChart3 className="w-7 h-7 text-red-500 shrink-0" />
            تقارير التجار والمناديب والتحصيل اليومي والشهري
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            فلترة متكاملة لتقارير أداء ومحاسبة التجار، مع إظهار اسم التاجر بجانب الأوردرات، والتحصيل المالي والصافي المستحق.
          </p>
        </div>

        {/* Action Controls: Export & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            تصدير ملف إكسيل CSV
          </button>

          <button
            onClick={handlePrintReport}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            طباعة التقرير الرسمية
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 print:hidden overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('merchant_reports')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'merchant_reports'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Store className="w-4 h-4" />
          تقارير التجار والمتاجر (التسويات وأسماء التجار)
        </button>

        <button
          onClick={() => setActiveSubTab('courier_reports')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'courier_reports'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          تقارير تسليمات وتحصيل المناديب
        </button>

        <button
          onClick={() => setActiveSubTab('logistics_overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'logistics_overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          تحليلات المستودعات وتوزيع المحافظات
        </button>
      </div>

      {/* Common Filter Control Panel (Visible in Courier & Merchant Tabs) */}
      {(activeSubTab === 'merchant_reports' || activeSubTab === 'courier_reports') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Filter className="w-4 h-4 text-red-600" />
              تحديد فترة ومعايير الفلترة
            </div>

            {/* Period Type Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setReportPeriod('daily')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  reportPeriod === 'daily'
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                تقرير يومي
              </button>

              <button
                onClick={() => setReportPeriod('weekly')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  reportPeriod === 'weekly'
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                تقرير أسبوعي
              </button>

              <button
                onClick={() => setReportPeriod('monthly')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  reportPeriod === 'monthly'
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                تقرير شهري
              </button>

              <button
                onClick={() => setReportPeriod('all')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  reportPeriod === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جميع الفترات
              </button>
            </div>
          </div>

          {/* Filter Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Merchant Dropdown Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-red-600" />
                تصفية بحسب التاجر / المتجر:
              </label>
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full text-xs font-extrabold p-2.5 bg-red-50/60 border border-red-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="all">جميع التجار والمتاجر ({availableMerchants.length})</option>
                {availableMerchants.map(m => (
                  <option key={m} value={m}>التاجر: {m}</option>
                ))}
              </select>
            </div>

            {/* Daily & Weekly Picker */}
            <div className={`space-y-1 ${reportPeriod !== 'daily' && reportPeriod !== 'weekly' ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {reportPeriod === 'weekly' ? 'الأسبوع المنتهي في:' : 'اختيار اليوم:'}
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                {availableDates.map(d => (
                  <option key={d} value={d}>
                    {d} {d === new Date().toISOString().split('T')[0] ? '(اليوم)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Picker */}
            <div className={`space-y-1 ${reportPeriod !== 'monthly' ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                اختيار الشهر المحدد:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Hub Dropdown Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                تصفية بحسب المستودع:
              </label>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="all">جميع المستودعات والفروع</option>
                {BOSTA_HUBS.map(h => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: MERCHANT REPORTS (REPORT BY MERCHANT + SHOW MERCHANT NAME ON ORDERS) */}
      {activeSubTab === 'merchant_reports' && (
        <div className="space-y-6">
          {/* Merchant Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* Total Merchant Orders */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500">إجمالي شحنات التجار</span>
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalMerchantShipmentsCount} <span className="text-xs font-extrabold text-slate-500">أوردر</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1">
                <span>المتاجر:</span>
                <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full font-extrabold">
                  {merchantPerformanceList.length} تاجر
                </span>
              </div>
            </div>

            {/* Delivered Count & Success Rate */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500">التسليم الناجح</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {totalMerchantDeliveredCount} <span className="text-xs font-extrabold text-slate-500">تسليم</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold pt-1">
                <span>المرتجع: {totalMerchantReturnedCount}</span>
                <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold">
                  %{totalMerchantDeliveredCount + totalMerchantReturnedCount > 0 ? Math.round((totalMerchantDeliveredCount / (totalMerchantDeliveredCount + totalMerchantReturnedCount)) * 100) : 100} نجاح
                </span>
              </div>
            </div>

            {/* Total COD Collection */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500">إجمالي كاش التحصيل (COD)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-700">
                {totalMerchantCod.toLocaleString()} <span className="text-xs font-extrabold text-slate-500">ج.م</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>خصم الشحن: {totalMerchantShippingFees.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Net Payout Earned */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-600">إجمالي المستحقات المكتسبة</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-blue-800 font-mono">
                {totalMerchantNetPayout.toLocaleString()} <span className="text-xs font-extrabold text-slate-500">ج.م</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold pt-1">
                الصافي الإجمالي للتجار
              </div>
            </div>

            {/* Paid Out to Merchant */}
            <div className="bg-white border border-emerald-200 bg-emerald-50/30 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900">المسدد/المحول للتجار بالفعل</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-700 font-mono">
                {totalMerchantPaidOut.toLocaleString()} <span className="text-xs font-extrabold text-slate-600">ج.م</span>
              </div>
              <div className="text-[10px] text-emerald-800 font-bold pt-1">
                المسحوبات المسلمة
              </div>
            </div>

            {/* Remaining Balance */}
            <div className="bg-white border border-amber-300 bg-amber-50/40 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900">المستحقات المعلقة المتاحة</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-800 font-mono">
                {totalMerchantRemainingBalance.toLocaleString()} <span className="text-xs font-extrabold text-slate-600">ج.م</span>
              </div>
              <div className="text-[10px] text-amber-800 font-bold pt-1">
                متاح للسحب والتسوية
              </div>
            </div>
          </div>

          {/* Merchant Comparison Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 print:hidden">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-red-600" />
                مقارنة أداء وتسويات المتاجر والتجار في الفترة المختارة
              </h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {merchantPerformanceList.length} تاجر
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchantChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="تسليم ناجح" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="مرتجع ورفض" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="الصافي المستحق" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table 1: Merchant Performance & Settlement Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-red-600" />
                  تقرير كشف حساب وتسويات التجار المحدث باللحظة
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  تقرير رسمي يوضح إجمالي الشحنات، التحصيل، الصافي المكتسب، المسدد بالفعل، والرصيد المتبقي المعلق لكل تاجر
                </p>
              </div>

              <div className="relative w-full sm:w-64 print:hidden">
                <input
                  type="text"
                  placeholder="ابحث باسم المتجر، المسؤول، أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">اسم المتجر / التاجر</th>
                    <th className="p-3">المسؤول والتواصل</th>
                    <th className="p-3 text-center">إجمالي الأوردرات</th>
                    <th className="p-3 text-center bg-emerald-950/60 text-emerald-400">التسليم الناجح</th>
                    <th className="p-3 text-center bg-rose-950/60 text-rose-400">المرتجع والرفض</th>
                    <th className="p-3 bg-amber-950/60 text-amber-400">الكاش (COD)</th>
                    <th className="p-3 text-center">خصم الشحن</th>
                    <th className="p-3 bg-blue-950 text-blue-300">الصافي المكتسب</th>
                    <th className="p-3 bg-emerald-900 text-emerald-300">المسدد بالفعل 💸</th>
                    <th className="p-3 bg-amber-900 text-amber-300">المتبقي بالسحب ⏳</th>
                    <th className="p-3 text-center">حالة السداد</th>
                    <th className="p-3 text-center">نسبة النجاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                  {merchantPerformanceList.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-10 text-slate-500 font-bold">
                        لا توجد بيانات تجار مطابقة للفلترة والبحث المختارة.
                      </td>
                    </tr>
                  ) : (
                    merchantPerformanceList.map((m) => (
                      <tr key={m.storeName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                              <Store className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-xs">{m.storeName}</div>
                              <span className="text-[10px] text-slate-500 font-bold block">تاجر معتمد</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="font-extrabold text-slate-800">{m.contactName}</div>
                          <div className="text-[11px] text-slate-500 font-mono dir-ltr text-right">{m.phone}</div>
                        </td>
                        <td className="p-3 text-center font-black text-slate-900">{m.totalShipments}</td>
                        <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                          {m.totalDeliveredCount}
                        </td>
                        <td className="p-3 text-center font-extrabold text-rose-600 bg-rose-50/40">
                          {m.totalReturnedCount}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 bg-amber-50/40">
                          <span className="text-amber-800 font-black">{m.totalCod.toLocaleString()} ج.م</span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-600">
                          {m.shippingFees.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 font-black text-blue-900 bg-blue-50/50 font-mono">
                          {m.netPayout.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 font-black text-emerald-800 bg-emerald-50/60 font-mono">
                          {m.paidOut.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 font-black text-amber-900 bg-amber-100/60 font-mono">
                          {m.remainingBalance.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 text-center">
                          {m.remainingBalance <= 0 && m.netPayout > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              مُسدد بالكامل ✅
                            </span>
                          ) : m.remainingBalance > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              متبقي للسحب ⏳
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            m.successRate >= 90 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : m.successRate >= 70
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            %{m.successRate}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-extrabold text-xs">
                  <tr>
                    <td colSpan={2} className="p-3 text-right font-black">
                      الإجمالي الكلي للتجار ({reportPeriod === 'daily' ? selectedDate : reportPeriod === 'monthly' ? selectedMonth : 'الكل'}):
                    </td>
                    <td className="p-3 text-center font-black text-white">{totalMerchantShipmentsCount}</td>
                    <td className="p-3 text-center font-black text-emerald-400 bg-emerald-950/80">{totalMerchantDeliveredCount}</td>
                    <td className="p-3 text-center font-black text-rose-400 bg-rose-950/80">{totalMerchantReturnedCount}</td>
                    <td className="p-3 font-black text-amber-400 bg-amber-950/80">{totalMerchantCod.toLocaleString()} ج.م</td>
                    <td className="p-3 text-center font-black text-slate-300">{totalMerchantShippingFees.toLocaleString()} ج.م</td>
                    <td className="p-3 font-black text-blue-300 bg-blue-950/90 font-mono">{totalMerchantNetPayout.toLocaleString()} ج.م</td>
                    <td className="p-3 font-black text-emerald-300 bg-emerald-950/90 font-mono">{totalMerchantPaidOut.toLocaleString()} ج.م</td>
                    <td className="p-3 font-black text-amber-300 bg-amber-950/90 font-mono">{totalMerchantRemainingBalance.toLocaleString()} ج.م</td>
                    <td className="p-3" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table 2: Detailed Orders Table with Merchant Name displayed next to each order */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-red-600" />
                  جدول أوردرات وتفاصيل شحنات التجار (ظهور اسم التاجر بجانب الأوردر)
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  قائمة تفصيلية لكافة أوردرات التجار المطابقة للفلترة مع إظهار اسم التاجر، المستلم، المندوب، والماليات
                </p>
              </div>

              <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-xl font-extrabold text-xs">
                إجمالي {filteredShipments.length} أوردر
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-slate-200 font-black">
                  <tr>
                    <th className="p-3">رقم البوليصة (AWB)</th>
                    <th className="p-3 bg-red-950 text-red-300">اسم التاجر (المرسل)</th>
                    <th className="p-3">المستلم والتواصل</th>
                    <th className="p-3">المحافظة والفرع</th>
                    <th className="p-3">المندوب المخصص</th>
                    <th className="p-3">تحصيل (COD)</th>
                    <th className="p-3">مصاريف الشحن</th>
                    <th className="p-3 bg-emerald-950 text-emerald-300">الصافي للتاجر</th>
                    <th className="p-3 text-center">حالة الأوردر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-500 font-bold">
                        لا توجد أوردرات مطابقة للفلترة المختارة.
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-black text-slate-900">
                          {s.trackingNumber}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal">
                            {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </td>
                        <td className="p-3 bg-red-50/40 font-extrabold text-slate-900">
                          <div className="inline-flex items-center gap-1.5 bg-white border border-red-200 px-2.5 py-1 rounded-lg text-xs font-black text-red-900 shadow-2xs">
                            <Store className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            {s.sender?.storeName || 'تاجر عام'}
                          </div>
                          {s.sender?.phone && (
                            <span className="block text-[10px] text-slate-500 font-normal dir-ltr text-right mt-0.5">
                              {s.sender.phone}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{s.recipient.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{s.recipient.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block">{s.recipient.governorate}</span>
                          <span className="text-[10px] text-slate-500">{s.assignedHub}</span>
                        </td>
                        <td className="p-3">
                          {s.assignedCourier ? (
                            <span className="font-bold text-slate-800 inline-flex items-center gap-1">
                              <Truck className="w-3 h-3 text-red-600" />
                              {s.assignedCourier.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">غير مسند</span>
                          )}
                        </td>
                        <td className="p-3 font-black text-slate-900">
                          {s.financials.codAmount.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 text-slate-600 font-bold">
                          {s.financials.shippingFee} ج.م
                        </td>
                        <td className="p-3 bg-emerald-50/50 font-black text-emerald-800">
                          {Math.max(0, s.financials.codAmount - s.financials.shippingFee).toLocaleString()} ج.م
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            s.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'partial_delivery'
                              ? 'bg-amber-100 text-amber-900'
                              : s.status === 'returned' || s.status === 'refused'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {s.status === 'delivered' ? 'تم التسليم' : s.status === 'partial_delivery' ? 'استلام جزئي' : s.status === 'returned' ? 'مرتجع' : s.status === 'refused' ? 'رفض' : 'جاري التوصيل'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COURIER REPORTS (DAILY & MONTHLY) */}
      {activeSubTab === 'courier_reports' && (
        <div className="space-y-6">
          {/* Period Summary Metric Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Delivered Shipments Metric */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500">التسليم الناجح</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalPeriodDelivered} <span className="text-xs font-extrabold text-slate-500">طرد</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold pt-1">
                <span>إجاز المندوبين</span>
                <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  %{overallSuccessRate} نجاح
                </span>
              </div>
            </div>

            {/* Cash COD Collected Metric */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500">الكاش المحصل (COD)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-700">
                {totalPeriodCod.toLocaleString()} <span className="text-xs font-extrabold text-slate-500">ج.م</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>رسوم شحن: {totalPeriodShippingFees.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Settled COD (Handed over to Treasury) */}
            <div className="bg-white border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900">المورد بالفعل للخزينة</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-700 font-mono">
                {totalPeriodSettledCod.toLocaleString()} <span className="text-xs font-extrabold text-slate-600">ج.م</span>
              </div>
              <div className="text-[10px] text-emerald-800 font-bold pt-1">
                تم الاستلام وتوريد العهدة
              </div>
            </div>

            {/* Pending Custody (Gross Cash with Courier) */}
            <div className="bg-white border border-amber-300 bg-amber-50/30 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900">العهدة المعلقة باليد (كاش)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-800 font-mono">
                {totalPeriodPendingCustody.toLocaleString()} <span className="text-xs font-extrabold text-slate-600">ج.م</span>
              </div>
              <div className="text-[10px] text-amber-900 font-bold pt-1 flex items-center justify-between">
                <span>إجمالي الكاش باليد</span>
              </div>
            </div>

            {/* Deducted Pending Commission */}
            <div className="bg-white border border-rose-200 bg-rose-50/20 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-900">خصم عمولة العهدة</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-rose-700 font-mono">
                -{totalPeriodPendingCommission.toLocaleString()} <span className="text-xs font-extrabold text-slate-500">ج.م</span>
              </div>
              <div className="text-[10px] text-rose-800 font-bold pt-1">
                تستقطع لصالح المندوب
              </div>
            </div>

            {/* Net Required Custody Handover */}
            <div className="bg-white border border-blue-300 bg-blue-50/30 p-4 rounded-2xl shadow-2xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950">الصافي المطلوب توريده 🎯</span>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-black text-blue-900 font-mono">
                {totalPeriodPendingNetRequired.toLocaleString()} <span className="text-xs font-extrabold text-slate-600">ج.م</span>
              </div>
              <div className="text-[10px] text-blue-800 font-bold pt-1">
                الصافي المطلوب استلامه بالخزينة
              </div>
            </div>
          </div>

          {/* Trend & Comparison Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Courier Comparison Stacked Bar Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-600" />
                  مقارنة تسليمات ومرتجعات المناديب في الفترة المختارة
                </h4>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {courierPerformanceList.length} مندوب
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courierChartData} barSize={26}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="تسليم ناجح" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="مرتجع / رفض" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="محاولة فاشلة" fill="#F43F5E" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="جاري التسليم" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* COD Cash Collection Trend Area Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  معدل التراكم المالي للتحصيل (COD EGP) عبر الأيام
                </h4>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  إجمالي {totalPeriodCod.toLocaleString()} ج.م
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCod" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(value: any) => [`${value.toLocaleString()} ج.م`, 'الكاش المحصل']}
                    />
                    <Area type="monotone" dataKey="cod" stroke="#F59E0B" fillOpacity={1} fill="url(#colorCod)" name="التحصيل المالي COD" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Courier Reports Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-red-600" />
                  جدول تقرير أداء وتسليمات وتحصيل وتوريد عهدة المناديب
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  تقرير رسمي يوضح الكاش المحصل، المورد للخزينة بالفعل، والعهدة المتبقية باليد لكل مندوب توصيل
                </p>
              </div>

              {/* Courier Search Input */}
              <div className="relative w-full sm:w-64 print:hidden">
                <input
                  type="text"
                  placeholder="ابحث باسم المندوب أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* The Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">المندوب (الكابتن)</th>
                    <th className="p-3">المستودع / الفرع</th>
                    <th className="p-3 text-center">إجمالي المسند</th>
                    <th className="p-3 text-center bg-emerald-950/60 text-emerald-400">التسليم الناجح</th>
                    <th className="p-3 text-center bg-rose-950/60 text-rose-400">المرتجع والرفض</th>
                    <th className="p-3 bg-amber-950/60 text-amber-400">الكاش المحصل (COD)</th>
                    <th className="p-3 bg-emerald-900 text-emerald-300">المورد للخزينة ✅</th>
                    <th className="p-3 bg-amber-900 text-amber-300">العهدة المتبقية (كاش) ⏳</th>
                    <th className="p-3 text-center bg-rose-950 text-rose-300">خصم عمولة العهدة 💸</th>
                    <th className="p-3 bg-blue-900 text-blue-200">الصافي المطلوب 🎯</th>
                    <th className="p-3 text-center">حالة التوريد</th>
                    <th className="p-3 text-center">نسبة النجاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                  {courierPerformanceList.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-10 text-slate-500 font-bold">
                        لا توجد بيانات تسليمات مناديب مطابقة للفترة والفلترة المختارة.
                      </td>
                    </tr>
                  ) : (
                    courierPerformanceList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={c.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                              alt={c.name} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs">{c.name}</div>
                              <div className="text-[10px] text-slate-500 dir-ltr text-right font-mono">{c.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 text-xs font-semibold">{c.assignedHub}</td>
                        <td className="p-3 text-center font-extrabold text-slate-900">{c.totalAssigned}</td>
                        <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                          {c.totalDeliveredCount}
                        </td>
                        <td className="p-3 text-center font-extrabold text-rose-600 bg-rose-50/40">
                          {c.totalReturnedCount}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 bg-amber-50/40">
                          <span className="text-amber-800 text-xs font-black block">{c.codCollected.toLocaleString()} ج.م</span>
                          <span className="text-[9px] text-slate-500 block">شحن: {c.shippingFees} ج.م</span>
                        </td>
                        <td className="p-3 font-black text-emerald-800 bg-emerald-50/60 font-mono text-xs">
                          {c.settledCod.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 font-black text-amber-900 bg-amber-100/60 font-mono text-xs">
                          {c.pendingCustody.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 text-center font-black text-rose-700 bg-rose-50/60 font-mono text-xs">
                          -{c.pendingCommission.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 font-black text-blue-950 bg-blue-50 font-mono text-xs">
                          {c.pendingNetRequired.toLocaleString()} ج.م
                        </td>
                        <td className="p-3 text-center">
                          {c.pendingCustody <= 0 && c.codCollected > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              تم التوريد بالكامل ✅
                            </span>
                          ) : c.pendingCustody > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              مطلوب {c.pendingNetRequired.toLocaleString()} ج.م ⏳
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            c.successRate >= 90 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : c.successRate >= 70
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            %{c.successRate}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {/* Summary Row */}
                <tfoot className="bg-slate-900 text-white font-extrabold text-xs">
                  <tr>
                    <td colSpan={2} className="p-3 text-right font-black">
                      الإجمالي الكلي بالفترة ({reportPeriod === 'daily' ? selectedDate : reportPeriod === 'weekly' ? `أسبوع ${selectedDate}` : reportPeriod === 'monthly' ? selectedMonth : 'الكل'}):
                    </td>
                    <td className="p-3 text-center font-black text-white">{totalPeriodAssigned}</td>
                    <td className="p-3 text-center font-black text-emerald-400 bg-emerald-950/80">{totalPeriodDelivered}</td>
                    <td className="p-3 text-center font-black text-rose-400 bg-rose-950/80">{totalPeriodReturned}</td>
                    <td className="p-3 font-black text-amber-400 bg-amber-950/80">
                      {totalPeriodCod.toLocaleString()} ج.م
                    </td>
                    <td className="p-3 font-black text-emerald-300 bg-emerald-950/90 font-mono">
                      {totalPeriodSettledCod.toLocaleString()} ج.م
                    </td>
                    <td className="p-3 font-black text-amber-300 bg-amber-950/90 font-mono">
                      {totalPeriodPendingCustody.toLocaleString()} ج.م
                    </td>
                    <td className="p-3 text-center font-black text-rose-400 bg-rose-950/80 font-mono">
                      -{totalPeriodPendingCommission.toLocaleString()} ج.م
                    </td>
                    <td className="p-3 font-black text-blue-200 bg-blue-950 font-mono">
                      {totalPeriodPendingNetRequired.toLocaleString()} ج.م
                    </td>
                    <td className="p-3 text-center font-black text-emerald-400">
                      %{overallSuccessRate}
                    </td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Stamp & Signature area for Print */}
            <div className="hidden print:grid grid-cols-3 gap-4 pt-10 text-center text-xs text-slate-700 font-bold border-t border-slate-300">
              <div>
                <p>توقيع مسؤول المستودع / الحركة</p>
                <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
              </div>
              <div>
                <p>اعتماد الحسابات والشؤون المالية</p>
                <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
              </div>
              <div>
                <p>خاتم الشركة والإدارة اللوجستية</p>
                <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LOGISTICS OVERVIEW (GOVERNORATES & STATUSES) */}
      {activeSubTab === 'logistics_overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Governorate Distribution Bar Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                توزيع الشحنات حسب المحافظات المصرية
              </h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {govBarData.length} محافظة
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={govBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="governorate" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="shipmentsCount" fill="#DC2626" radius={[6, 6, 0, 0]} name="عدد الشحنات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                نسب توزيع حالات الشحنات اللوجستية العامة
              </h4>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                إجمالي {shipments.length} شحنة
              </span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
