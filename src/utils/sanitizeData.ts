import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet } from '../types';

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
  const filtered = list.filter((u) => u && typeof u === 'object' && u.id && u.name);

  // Ensure primary admin always exists in the user list
  const hasAdmin = filtered.some((u) => u.role === 'admin' || u.email === PRIMARY_ADMIN_USER.email);
  if (!hasAdmin) {
    return [PRIMARY_ADMIN_USER, ...filtered];
  }
  return filtered;
}

export function sanitizeCouriers(couriers?: CourierInfo[]): CourierInfo[] {
  const list = Array.isArray(couriers) ? couriers : [];
  return list.filter((c) => c && typeof c === 'object' && c.id && c.name);
}

export function sanitizeCompanyTxns(txns?: CompanyTransaction[]): CompanyTransaction[] {
  const list = Array.isArray(txns) ? txns : [];
  return list.filter((t) => t && typeof t === 'object' && t.id);
}

export function sanitizeShipments(shipments?: Shipment[]): Shipment[] {
  const list = Array.isArray(shipments) ? shipments : [];
  return list.filter((s) => s && typeof s === 'object' && (s.id || s.trackingNumber));
}

export function sanitizeWallet(wallet?: MerchantWallet): MerchantWallet {
  if (!wallet) return { merchantId: 'merch-admin-default', merchantName: 'المحفظة الرئيسية', availableBalance: 0, pendingCod: 0, totalPaidOut: 0 };
  return {
    ...wallet,
    availableBalance: wallet.availableBalance ?? 0,
    totalPaidOut: wallet.totalPaidOut ?? 0,
    pendingCod: wallet.pendingCod ?? 0,
  };
}

