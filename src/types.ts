/**
 * Bosta System Types & Interfaces
 */

export type ShipmentStatus = 
  | 'pending_approval'   // بانتظار موافقة الأدمن
  | 'created'            // تم إنشاء وتأكيد الشحنة
  | 'pickup_requested'   // طلب الاستلام من التاجر
  | 'picked_up'          // تم الاستلام من التاجر
  | 'in_hub'             // في المستودع الرئيسي
  | 'out_for_delivery'   // خرجت للتسليم مع المندوب
  | 'delivered'          // تم التسليم للعميل
  | 'partial_delivery'   // استلام جزئي (تسليم جزء وارتجاع الباقي)
  | 'refused'            // رفض الاستلام من العميل
  | 'failed_attempt'     // محاولة تسليم فاشلة
  | 'returned'           // مرتجع للتاجر
  | 'cancelled';         // ملغاة

export type DeliveryType = 
  | 'standard'       // شحن عادي (24-48 ساعة)
  | 'express'        // شحن سريع (نفس اليوم / اليوم التالي)
  | 'exchange'       // استبدال طرد
  | 'return'         // إرجاع طرد
  | 'customer_pickup'; // استلام من الفرع

export type PaidStatus = 'pending' | 'collected' | 'settled';

export interface AddressInfo {
  name: string;
  phone: string;
  secondaryPhone?: string;
  governorate: string; // المحافظة
  city: string;        // المدينة / المركز
  district: string;    // الحي / المنطقة
  streetAddress: string; // اسم الشارع وتفاصيل العنوان
  buildingNo?: string;  // رقم المبنى
  apartmentNo?: string; // رقم الشقة/الدور
  notes?: string;       // ملاحظات العنوان
}

export interface SenderInfo {
  id: string;
  storeName: string;
  contactName: string;
  phone: string;
  governorate: string;
  city: string;
  pickupAddress: string;
}

export interface PackageDetails {
  description: string;
  itemsCount: number;
  weightKg: number;
  dimensions?: string; // L x W x H cm
  allowOpening: boolean; // السماح بمعاينة الطرد قبل الدفع
  isFragile?: boolean;  // قابل للكسر
}

export interface FinancialDetails {
  codAmount: number;     // مبلغ التحصيل عند الاستلام
  shippingFee: number;   // مصاريف الشحن
  codFee: number;        // رسوم تحصيل الكاش
  insuranceFee: number;  // رسوم التأمين
  netPayout: number;     // الصافي للتاجر (COD - Fees)
  paidStatus: PaidStatus; // حالة التسوية المالية
  settlementDate?: string;
}

export interface TimelineEvent {
  id: string;
  status: ShipmentStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  actorRole: 'merchant' | 'system' | 'hub' | 'courier' | 'customer';
  notes?: string;
}

export interface ProofOfDelivery {
  verifiedPin?: string;
  recipientName?: string;
  signatureDate?: string;
  photoUrl?: string;
  note?: string;
}

export interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: 'motocycle' | 'van' | 'car';
  assignedHub: string;
  rating: number;
  activeShipmentsCount: number;
  codCollectedToday: number;
  photoUrl?: string;
  commissionType?: 'fixed' | 'percentage'; // نوع العمولة (مبلغ ثابت لكل شحنة أو نسبة من سعر الشحن)
  commissionValue?: number;                // قيمة العمولة (مثلا 20 ج.م أو 15%)
  totalCommissionEarned?: number;          // إجمالي العمولات المستحقة للمندوب
}

export interface HubInfo {
  id: string;
  name: string;
  governorate: string;
  address: string;
  managerName: string;
  phone: string;
}

export interface Shipment {
  id: string; // e.g. BST-902184
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  status: ShipmentStatus;
  deliveryType: DeliveryType;
  sender: SenderInfo;
  recipient: AddressInfo;
  packageDetails: PackageDetails;
  financials: FinancialDetails;
  assignedHub: string;
  assignedCourier?: CourierInfo;
  timeline: TimelineEvent[];
  proofOfDelivery?: ProofOfDelivery;
  partialDetails?: {
    acceptedItemsCount: number;
    returnedItemsCount?: number;
    partialCodAmount: number;
    remainingCodAmount?: number;
    originalCodAmount?: number;
    notes?: string;
  };
  refusedDetails?: {
    shippingFeePaid: boolean;
    partialShippingFeePaid?: boolean;
    amountCollected: number;
    merchantDeductedAmount?: number;
    reason: string;
  };
  noResponseDetails?: {
    isNoResponse: boolean;
    reportedAt: string;
    courierNote?: string;
    merchantResponse?: {
      contacted: boolean;
      responseNote: string;
      respondedAt: string;
    };
  };
  isCourierSettled?: boolean;
  courierSettledAt?: string;
  estimatedDeliveryDate: string;
}

export interface GovernorateRate {
  code: string;
  nameAr: string;
  nameEn: string;
  baseRate: number;      // Price up to 3kg
  additionalKgRate: number; // Price per extra kg
  estDays: string;
  cities?: string[];     // أهم المدن / المراكز التابعة للمحافظة
}

export interface MerchantWallet {
  merchantId: string;
  merchantName: string;
  availableBalance: number;  // الرصيد الجاهز للسحب
  pendingCod: number;        // مبالغ مع المندوبين/المستودع قيد التسليم
  totalPaidOut: number;      // إجمالي المبالغ المحولة
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
  vodafoneCashNumber?: string;
  instaPayHandle?: string;
}

export type AppUserRole = 'admin' | 'merchant' | 'hub_manager' | 'courier' | 'public_tracker';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  avatarUrl?: string;
  storeName?: string;
  hubName?: string;
  courierVehicle?: string;
  isConfirmed?: boolean; // حالة تأكيد وتفعيل الحساب من خلال الأدمن في Supabase
}

export interface CourierNotification {
  id: string;
  courierId: string;
  courierName: string;
  shipmentId: string;
  trackingNumber: string;
  recipientName: string;
  governorate: string;
  city: string;
  streetAddress?: string;
  codAmount: number;
  createdAt: string;
  timestamp: string;
  read: boolean;
  type?: string;
  statusTitle?: string;
  statusNote?: string;
}

export type CompanyTransactionType = 'income' | 'expense';

export interface CompanyTransaction {
  id: string;
  type: CompanyTransactionType; // 'income' (وارد / إيراد) | 'expense' (صادر / مصروف)
  title: string;                 // البيان / الوصف
  amount: number;                // المبلغ (ج.م)
  category: string;              // التصنيف
  date: string;                  // التاريخ (YYYY-MM-DD or ISO)
  paymentMethod: 'cash' | 'bank_transfer' | 'vodafone_cash' | 'instapay' | 'check' | 'other';
  relatedMerchant?: string;      // التاجر المرتبط (اختياري)
  relatedCourier?: string;       // المندوب المرتبط (اختياري)
  notes?: string;                // ملاحظات إضافية
  createdBy?: string;            // اسم الموظف/الأدمن
  createdAt: string;
  updatedAt?: string;
}
