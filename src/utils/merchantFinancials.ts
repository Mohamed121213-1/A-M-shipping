import { Shipment, CompanyTransaction } from '../types';

export interface MerchantFinancialStats {
  // 1. شغل المتجر المسلم
  deliveredCount: number;
  deliveredCod: number;           // إجمالي التحصيل الفعلي كاش من العملاء
  deliveredShippingFees: number;  // مصاريف الشحن للشحنات المسلمة
  deliveredNetGoods: number;      // صافي قيمة البضاعة المسلمة للتاجر

  // 2. قيد التوصيل
  inTransitCount: number;
  inTransitCod: number;           // إجمالي مبالغ COD قيد التوصيل مع المناديب والمستودع
  inTransitShippingFees: number;  // مصاريف الشحن المتوقعة
  inTransitNetExpected: number;   // الصافي المتوقع للتاجر عند التسليم

  // 3. المرتجعات
  returnsCount: number;
  returnsGoodsValue: number;      // إجمالي قيمة بضائع المرتجعات
  returnsShippingDeducted: number;// مصاريف شحن المرتجعات المخصومة من التاجر

  // 4. السلف والدفعات المقدمة والمسحوبات
  totalAdvancePaid: number;       // دفعات مقدمة / سلف نقدية أخذها التاجر تحت الحساب
  totalRegularPaidOut: number;    // سحب أرباح عادية
  totalPaidOut: number;           // إجمالي ما تم صرفه للتاجر (مقدمات + سحوبات سابقة)
  advanceTransactions: CompanyTransaction[];
  payoutTransactions: CompanyTransaction[];

  // 5. الصافي اللي ليه
  totalEarnedNet: number;         // إجمالي المستحق عن الشغل المنجز (صافي البضاعة - خصم شحن المرتجع)
  netDueBalance: number;          // الصافي اللي ليه المتبقي بعد خصم السلف والدفعات المقدمة
  hasDebt: boolean;               // هل التاجر عليه مديونية (سحب أكثر مما تم تسليمه)
}

export function isAdvanceTransaction(txn: CompanyTransaction): boolean {
  if (txn.type !== 'expense') return false;
  const cat = (txn.category || '').toLowerCase();
  const title = (txn.title || '').toLowerCase();
  const notes = (txn.notes || '').toLowerCase();
  return (
    cat.includes('سلفة') ||
    cat.includes('مقدم') ||
    cat.includes('دفعة مقدمة') ||
    title.includes('سلفة') ||
    title.includes('مقدم') ||
    title.includes('دفعة مقدمة') ||
    notes.includes('سلفة') ||
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
  let deliveredCount = 0;
  let deliveredCod = 0;
  let deliveredShippingFees = 0;
  let deliveredNetGoods = 0;

  let inTransitCount = 0;
  let inTransitCod = 0;
  let inTransitShippingFees = 0;
  let inTransitNetExpected = 0;

  let returnsCount = 0;
  let returnsGoodsValue = 0;
  let returnsShippingDeducted = 0;

  for (const s of shipments) {
    if (!s) continue;
    const cod = Number(s.financials?.codAmount) || 0;
    const fee = Number(s.financials?.shippingFee) || 0;

    if (s.status === 'delivered') {
      deliveredCount += 1;
      const net = Number(s.financials?.netPayout) ?? Math.max(0, cod - fee);
      deliveredCod += cod;
      deliveredShippingFees += fee;
      deliveredNetGoods += net;
    } else if (s.status === 'partial_delivery') {
      deliveredCount += 1;
      const partialCod = Number(s.partialDetails?.partialCodAmount ?? cod) || 0;
      const net = Math.max(0, partialCod - fee);
      deliveredCod += partialCod;
      deliveredShippingFees += fee;
      deliveredNetGoods += net;
    } else if (s.status === 'returned' || s.status === 'refused') {
      returnsCount += 1;
      const orderCod = s.refusedDetails?.originalCodAmount || cod;
      // قيمة بضاعة المرتجع (من غير الشحن طبعاً كما طلب التاجر)
      const goodsVal = s.refusedDetails?.originalGoodsValue ?? (orderCod > fee ? orderCod - fee : orderCod);
      returnsGoodsValue += (goodsVal > 0 ? goodsVal : orderCod);

      let collectedShipping = 0;
      if (s.refusedDetails?.amountCollected !== undefined) {
        collectedShipping = Number(s.refusedDetails.amountCollected) || 0;
      } else if (s.refusedDetails?.shippingFeePaid) {
        collectedShipping = fee;
      }

      const isCancellationExempt = s.refusedDetails?.isCustomerCancellationWithoutFee === true;
      const deduction = isCancellationExempt ? 0 : Math.max(0, fee - collectedShipping);
      returnsShippingDeducted += deduction;
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
    deliveredCount,
    deliveredCod,
    deliveredShippingFees,
    deliveredNetGoods,
    inTransitCount,
    inTransitCod,
    inTransitShippingFees,
    inTransitNetExpected,
    returnsCount,
    returnsGoodsValue,
    returnsShippingDeducted,
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
