import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet } from '../types';

export const PRIMARY_ADMIN_USER: UserSession = {
  id: 'admin_root',
  name: 'محمد صلاح (أدمن الرئيسية)',
  email: 'mohamedsalah565657@icloud.com',
  phone: '01000000001',
  role: 'admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
  isConfirmed: true,
  registeredAt: '2026-08-30T00:00:00.000Z',
};

// Base users list only contains the primary admin
export const SUPABASE_SYNCED_USERS: UserSession[] = [
  PRIMARY_ADMIN_USER,
];

export function sanitizeUsers(users?: UserSession[]): UserSession[] {
  const list = Array.isArray(users) ? users : [];
  const usersById = new Map<string, UserSession>();
  const phoneToId = new Map<string, string>();
  const emailToId = new Map<string, string>();

  const registerUser = (u: UserSession) => {
    if (!u || !u.id) return;
    usersById.set(u.id, u);
    if (u.phone) {
      const cleanPhone = String(u.phone).replace(/\D/g, '');
      if (cleanPhone) phoneToId.set(cleanPhone, u.id);
    }
    if (u.email) {
      emailToId.set(String(u.email).toLowerCase(), u.id);
    }
  };

  // 1. Seed Admin user
  for (const sUser of SUPABASE_SYNCED_USERS) {
    registerUser(sUser);
  }

  // 2. Merge incoming users with full state priority
  for (const u of list) {
    if (!u || typeof u !== 'object') continue;

    let existingId = u.id && usersById.has(u.id) ? u.id : undefined;
    if (!existingId && u.phone) {
      const cleanPhone = String(u.phone).replace(/\D/g, '');
      if (cleanPhone) existingId = phoneToId.get(cleanPhone);
    }
    if (!existingId && u.email) {
      existingId = emailToId.get(String(u.email).toLowerCase());
    }

    if (existingId) {
      const existing = usersById.get(existingId)!;
      // If either has isConfirmed === true, preserve true so an activated user never reverts!
      const isConfirmedFinal = u.isConfirmed !== undefined 
        ? Boolean(u.isConfirmed) 
        : (existing.isConfirmed !== undefined ? Boolean(existing.isConfirmed) : true);

      const merged: UserSession = {
        ...existing,
        ...u,
        id: existing.id,
        isConfirmed: isConfirmedFinal,
      };
      registerUser(merged);
    } else if (u.id && u.name) {
      registerUser({
        ...u,
        isConfirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : true,
      });
    }
  }

  const result = Array.from(usersById.values());

  // Ensure admin always exists and is always confirmed
  const adminIndex = result.findIndex((u) => u.role === 'admin' || u.email === PRIMARY_ADMIN_USER.email);
  if (adminIndex >= 0) {
    result[adminIndex] = { ...result[adminIndex], isConfirmed: true, role: 'admin' };
  } else {
    result.unshift(PRIMARY_ADMIN_USER);
  }

  return result;
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

