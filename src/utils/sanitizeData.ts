import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet } from '../types';

const DUMMY_USER_IDS = new Set(['USR-ADMIN-1', 'USR-MERCH-1', 'c1', 'USR-HUB-1']);
const DUMMY_USER_EMAILS = new Set([
  'admin@am-shipping.eg',
  'merchant@am-shipping.eg',
  'ahmed@am-shipping.eg',
  'hub.cairo@am-shipping.eg'
]);
const DUMMY_COURIER_IDS = new Set(['c1', 'c2', 'c3']);
const DUMMY_TXN_IDS = new Set(['TXN-1001', 'TXN-1002', 'TXN-1003', 'TXN-1004']);
const DUMMY_SHIPMENT_IDS = new Set(['BST-804101', 'BST-804102', 'BST-804103', 'BST-804104', 'BST-804105', 'BST-804106']);

export const PRIMARY_ADMIN_USER: UserSession = {
  id: 'USR-ADMIN-2',
  name: 'محمد صلاح (أدمن الرئيسية)',
  email: 'mohamedsalah565657@icloud.com',
  phone: '01000000001',
  role: 'admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
  isConfirmed: true,
};

export function sanitizeUsers(users?: UserSession[]): UserSession[] {
  const list = Array.isArray(users) ? users : [];
  const filtered = list.filter((u) => {
    if (!u) return false;
    if (DUMMY_USER_IDS.has(u.id)) return false;
    if (u.email && DUMMY_USER_EMAILS.has(u.email.toLowerCase())) return false;
    if (['المدير العام', 'متجر التاجر المسجل', 'كابتن / أحمد محمود', 'مدير مستودع القاهرة'].includes(u.name)) return false;
    return true;
  });

  // Ensure primary admin always exists
  const hasAdmin = filtered.some((u) => u.role === 'admin' || u.email === PRIMARY_ADMIN_USER.email);
  if (!hasAdmin) {
    return [PRIMARY_ADMIN_USER, ...filtered];
  }
  return filtered;
}

export function sanitizeCouriers(couriers?: CourierInfo[]): CourierInfo[] {
  const list = Array.isArray(couriers) ? couriers : [];
  return list.filter((c) => {
    if (!c) return false;
    if (DUMMY_COURIER_IDS.has(c.id)) return false;
    if (['كابتن / أحمد محمود', 'كابتن / محمود السيد', 'كابتن / إبراهيم حسن'].includes(c.name)) return false;
    return true;
  });
}

export function sanitizeCompanyTxns(txns?: CompanyTransaction[]): CompanyTransaction[] {
  const list = Array.isArray(txns) ? txns : [];
  return list.filter((t) => {
    if (!t) return false;
    if (DUMMY_TXN_IDS.has(t.id)) return false;
    return true;
  });
}

export function sanitizeShipments(shipments?: Shipment[]): Shipment[] {
  const list = Array.isArray(shipments) ? shipments : [];
  return list.filter((s) => {
    if (!s) return false;
    if (DUMMY_SHIPMENT_IDS.has(s.id) || DUMMY_SHIPMENT_IDS.has(s.trackingNumber)) return false;
    return true;
  });
}

export function sanitizeWallet(wallet?: MerchantWallet): MerchantWallet {
  if (!wallet) return { merchantId: 'merch-admin-default', merchantName: 'المحفظة الرئيسية', availableBalance: 0, pendingCod: 0, totalPaidOut: 0 };
  return {
    ...wallet,
    availableBalance: wallet.availableBalance === 14250 ? 0 : (wallet.availableBalance ?? 0),
    totalPaidOut: wallet.totalPaidOut === 98500 ? 0 : (wallet.totalPaidOut ?? 0),
    pendingCod: wallet.pendingCod === 6800 ? 0 : (wallet.pendingCod ?? 0),
  };
}
