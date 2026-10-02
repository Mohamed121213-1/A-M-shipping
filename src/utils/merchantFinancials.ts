import { Shipment, CompanyTransaction } from '../types';

export interface MerchantFinancialStats {
  // 0. حساب الشغل كامل (بدون الشحن) لكل أوردرات التاجر
  totalAllShipmentsCount: number;
  totalAllWorkCod: number;           // إجمالي COD لكل شحنات التاجر بلا استثناء
  totalAllWorkShippingFees: number;  // إجمالي مصاريف الشحن الكلية
  totalAllWorkNetGoods: number;      // إجمالي حساب الشغل كامل بدون الشحن (صافي البضائع الكلي)

  // 1. شغل المتجر المسلم الإجمالي
  deliveredCount: number;
  deliveredCod: number;           // إجمالي التحصيل الفعلي كاش من العملاء
  deliveredShippingFees: number;  // مصاريف الشحن للشحنات المسلمة
  deliveredNetGoods: number;      // صافي قيمة البضاعة المسلمة للتاجر (شغله المسلم بدون الشحن)

  // 1.أ. تفاصيل الشحنات الكاملة (Delivered)
  fullDeliveredCount: number;
  fullDeliveredCod: number;
  fullDeliveredShippingFees: number;
  fullDeliveredNetGoods: number;  // صافي الشحنات الكاملة بتاعت التاجر

  // 1.ب. تفاصيل الاستلام الجزئي (Partial Delivery)
  partialDeliveredCount: number;
  partialDeliveredCod: number;
  partialDeliveredShippingFees: number;
  partialDeliveredNetGoods: number;

  // 2. قيد التوصيل (قيد التسليم مع المناديب)
  inTransitCount: number;
  inTransitCod: number;           // إجمالي مبالغ COD قيد التوصيل مع المناديب والمستودع
  inTransitShippingFees: number;  // مصاريف الشحن المتوقعة
  inTransitNetExpected: number;   // الصافي المتوقع للتاجر عند التسليم (حساب قيد التسليم بدون الشحن)

  // 3. المرتجعات
  returnsCount: number;
  returnsGoodsValue: number;      // إجمالي قيمة بضائع المرتجعات بحساب عادي (من غير الشحن)
  returnsTotalCod: number;        // إجمالي مبالغ المرتجعات بحساب عادي
  returnsShippingDeducted: number;// مصاريف شحن المرتجعات المخصومة من التاجر (تتخصم من الفلوس اللي ليه)

  // 3.أ. دفع جزء من الشحن
  partialShippingPaidCount: number;
  partialShippingCollected: number;
  partialShippingMerchantDeducted: number;

  // 3.ب. إلغاء بطلب العميل (معفى من الشحن)
  customerCancellationCount: number;
  customerCancellationGoodsValue: number;

  // 4. السلف والدفعات المقدمة والمسحوبات
  totalAdvancePaid: number;       // دفعات مقدمة / سلف نقدية أخذها التاجر تحت الحساب
  totalRegularPaidOut: number;    // سحب أرباح عادية
  totalPaidOut: number;           // إجمالي ما تم صرفه للتاجر (مقدمات + سحوبات سابقة)
  advanceTransactions: CompanyTransaction[];
  payoutTransactions: CompanyTransaction[];

  // 5. الصافي اللي ليه (حساب التاجر النهائي)
  totalEarnedNet: number;         // إجمالي المستحق عن الشغل المنجز (صافي البضاعة المسلمة - خصم شحن المرتجع)
  netDueBalance: number;          // الصافي اللي ليه المتبقي بعد خصم السلف والدفعات المقدمة
  hasDebt: boolean;               // هل التاجر عليه مديونية (سحب أكثر مما تم تسليمه)
}

export function isAdvanceTransaction(txn: CompanyTransaction): boolean {
  if (txn.type !== 'expense') return false;
  const cat = (txn.category || '').toLowerCase();
  const title = (txn.title || '').toLowerCase();
  const notes = (txn.notes || '').toLowerCase();
  return (
    cat.includes('سلف') ||
    cat.includes('مقدم') ||
    title.includes('سلف') ||
    title.includes('مقدم') ||
    notes.includes('سلف') ||
    notes.includes('مقدم')
  );
}

export function matchesMerchant(
  txn: CompanyTransaction,
  identifier?: { id?: string; storeName?: string; name?: string; phone?: string }
): boolean {
  if (!identifier) return true;
  const rel = (txn.relatedMerchant || '').trim().toLowerCase();
  const notes = (txn.notes || '').trim().toLowerCase();
  const title = (txn.title || '').trim().toLowerCase();
  if (!rel && !notes && !title) return false;

  const store = (identifier.storeName || '').trim().toLowerCase();
  const name = (identifier.name || '').trim().toLowerCase();
  const phone = identifier.phone ? String(identifier.phone).replace(/\D/g, '') : '';
  const id = (identifier.id || '').trim().toLowerCase();

  if (store && (rel.includes(store) || store.includes(rel) || notes.includes(store) || title.includes(store))) return true;
  if (name && (rel.includes(name) || name.includes(rel) || notes.includes(name) || title.includes(name))) return true;
  if (phone && phone.length >= 7 && (rel.includes(phone) || notes.includes(phone) || title.includes(phone))) return true;
  if (id && (rel.includes(id) || notes.includes(id))) return true;

  return false;
}

export function calculateMerchantFinancials(
  shipments: Shipment[],
  companyTransactions: CompanyTransaction[] = [],
  merchantIdentifier?: { id?: string; storeName?: string; name?: string; phone?: string }
): MerchantFinancialStats {
  let totalAllShipmentsCount = 0;
  let totalAllWorkCod = 0;
  let totalAllWorkShippingFees = 0;
  let totalAllWorkNetGoods = 0;

  let deliveredCount = 0;
  let deliveredCod = 0;
  let deliveredShippingFees = 0;
  let deliveredNetGoods = 0;

  let fullDeliveredCount = 0;
  let fullDeliveredCod = 0;
  let fullDeliveredShippingFees = 0;
  let fullDeliveredNetGoods = 0;

  let partialDeliveredCount = 0;
  let partialDeliveredCod = 0;
  let partialDeliveredShippingFees = 0;
  let partialDeliveredNetGoods = 0;

  let inTransitCount = 0;
  let inTransitCod = 0;
  let inTransitShippingFees = 0;
  let inTransitNetExpected = 0;

  let returnsCount = 0;
  let returnsGoodsValue = 0;
  let returnsTotalCod = 0;
  let returnsShippingDeducted = 0;

  let partialShippingPaidCount = 0;
  let partialShippingCollected = 0;
  let partialShippingMerchantDeducted = 0;

  let customerCancellationCount = 0;
  let customerCancellationGoodsValue = 0;

  for (const s of shipments) {
    if (!s) continue;
    const cod = Number(s.financials?.codAmount) || 0;
    const fee = Number(s.financials?.shippingFee) || 0;

    totalAllShipmentsCount += 1;
    totalAllWorkCod += cod;
    totalAllWorkShippingFees += fee;
    totalAllWorkNetGoods += Math.max(0, cod - fee);

    if (s.status === 'delivered') {
      deliveredCount += 1;
      fullDeliveredCount += 1;
      const net = Number(s.financials?.netPayout) ?? Math.max(0, cod - fee);
      deliveredCod += cod;
      deliveredShippingFees += fee;
      deliveredNetGoods += net;

      fullDeliveredCod += cod;
      fullDeliveredShippingFees += fee;
      fullDeliveredNetGoods += net;
    } else if (s.status === 'partial_delivery') {
      deliveredCount += 1;
      partialDeliveredCount += 1;
      const partialCod = Number(s.partialDetails?.partialCodAmount ?? cod) || 0;
      const net = Math.max(0, partialCod - fee);
      deliveredCod += partialCod;
      deliveredShippingFees += fee;
      deliveredNetGoods += net;

      partialDeliveredCod += partialCod;
      partialDeliveredShippingFees += fee;
      partialDeliveredNetGoods += net;
    } else if (s.status === 'returned' || s.status === 'refused') {
      returnsCount += 1;
      const orderCod = s.refusedDetails?.originalCodAmount || cod;
      returnsTotalCod += orderCod;
      // قيمة بضاعة المرتجع (من غير الشحن بحساب عادي)
      const goodsVal = s.refusedDetails?.originalGoodsValue ?? (orderCod > fee ? orderCod - fee : orderCod);
      const effectiveGoodsVal = (goodsVal > 0 ? goodsVal : orderCod);
      returnsGoodsValue += effectiveGoodsVal;

      let collectedShipping = 0;
      if (s.refusedDetails?.amountCollected !== undefined) {
        collectedShipping = Number(s.refusedDetails.amountCollected) || 0;
      } else if (s.refusedDetails?.shippingFeePaid) {
        collectedShipping = fee;
      }

      const isCancellationExempt = s.refusedDetails?.isCustomerCancellationWithoutFee === true ||
        s.refusedDetails?.reason?.includes('إلغاء') ||
        s.refusedDetails?.reason?.includes('إعفاء');

      if (isCancellationExempt) {
        customerCancellationCount += 1;
        customerCancellationGoodsValue += effectiveGoodsVal;
      } else if (s.refusedDetails?.partialShippingFeePaid || (collectedShipping > 0 && collectedShipping < fee)) {
        const deduction = Math.max(0, fee - collectedShipping);
        partialShippingPaidCount += 1;
        partialShippingCollected += collectedShipping;
        partialShippingMerchantDeducted += deduction;
        returnsShippingDeducted += deduction;
      } else if (collectedShipping >= fee && fee > 0) {
        // دفع كامل الشحن -> خصم 0
      } else {
        // لم يدفع شحن -> خصم كامل الشحن
        const deduction = fee;
        returnsShippingDeducted += deduction;
      }
    } else {
      // Out for delivery, in hub, picked up, created, failed attempt
      inTransitCount += 1;
      inTransitCod += cod;
      inTransitShippingFees += fee;
      inTransitNetExpected += Math.max(0, cod - fee);
    }
  }

  // Transactions (Advance payments and payouts)
  const advanceTransactions: CompanyTransaction[] = [];
  const payoutTransactions: CompanyTransaction[] = [];
  let totalAdvancePaid = 0;
  let totalRegularPaidOut = 0;

  for (const txn of companyTransactions) {
    if (!txn || txn.type !== 'expense') continue;
    if (merchantIdentifier && !matchesMerchant(txn, merchantIdentifier)) continue;

    const amt = Number(txn.amount) || 0;
    if (isAdvanceTransaction(txn)) {
      totalAdvancePaid += amt;
      advanceTransactions.push(txn);
    } else if (
      txn.category === 'تسليم مستحقات تجار' ||
      txn.category === 'صرف أرباح/تجار' ||
      (txn.title && txn.title.includes('التاجر'))
    ) {
      totalRegularPaidOut += amt;
      payoutTransactions.push(txn);
    }
  }

  const totalPaidOut = totalAdvancePaid + totalRegularPaidOut;
  const totalEarnedNet = Math.max(0, deliveredNetGoods - returnsShippingDeducted);
  const netDueBalance = totalEarnedNet - totalPaidOut;
  const hasDebt = netDueBalance < 0;

  return {
    totalAllShipmentsCount,
    totalAllWorkCod,
    totalAllWorkShippingFees,
    totalAllWorkNetGoods,
    deliveredCount,
    deliveredCod,
    deliveredShippingFees,
    deliveredNetGoods,
    fullDeliveredCount,
    fullDeliveredCod,
    fullDeliveredShippingFees,
    fullDeliveredNetGoods,
    partialDeliveredCount,
    partialDeliveredCod,
    partialDeliveredShippingFees,
    partialDeliveredNetGoods,
    inTransitCount,
    inTransitCod,
    inTransitShippingFees,
    inTransitNetExpected,
    returnsCount,
    returnsGoodsValue,
    returnsTotalCod,
    returnsShippingDeducted,
    partialShippingPaidCount,
    partialShippingCollected,
    partialShippingMerchantDeducted,
    customerCancellationCount,
    customerCancellationGoodsValue,
    totalAdvancePaid,
    totalRegularPaidOut,
    totalPaidOut,
    advanceTransactions,
    payoutTransactions,
    totalEarnedNet,
    netDueBalance,
    hasDebt,
  };
}
