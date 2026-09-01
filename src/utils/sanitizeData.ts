import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet } from '../types';

export const PRIMARY_ADMIN_USER: UserSession = {
  id: '10fdf171-fb33-4ede-9d27-2fae8a2c2d4b',
  name: 'محمد صلاح (أدمن الرئيسية)',
  email: 'mohamedsalah565657@icloud.com',
  phone: '01000000001',
  role: 'admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
  isConfirmed: true,
  registeredAt: '2026-08-30T00:00:00.000Z',
};

// Connected accounts from Supabase Authentication
export const SUPABASE_SYNCED_USERS: UserSession[] = [
  PRIMARY_ADMIN_USER,
  {
    id: '15c6e6d1-df23-4e20-a464-e4df09590e4d',
    name: 'Amr',
    email: '01015674681@am-shipping.eg',
    phone: '01015674681',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Amr&background=dc2626&color=ffffff',
    storeName: 'متجر Amr',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:00:00.000Z',
  },
  {
    id: 'b009b128-b1f5-4c03-b6ec-842d35cca9b0',
    name: 'ام فاتن',
    email: '01017266727@am-shipping.eg',
    phone: '01017266727',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%85+%D9%81%D8%A7%D8%AA%D9%86&background=dc2626&color=ffffff',
    storeName: 'متجر ام فاتن',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:05:00.000Z',
  },
  {
    id: '16cfabd6-f309-4c09-ad2e-3ddc10338d67',
    name: 'حسن علي',
    email: '01093383328@am-shipping.eg',
    phone: '01093383328',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86+%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff',
    storeName: 'متجر حسن علي',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:10:00.000Z',
  },
  {
    id: '8b151dbb-660d-4169-903a-647c12967504',
    name: 'Oo',
    email: '01121212121@am-shipping.eg',
    phone: '01121212121',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Oo&background=dc2626&color=ffffff',
    storeName: 'متجر Oo',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:15:00.000Z',
  },
  {
    id: '169880e0-ba38-416e-ab42-9ae66d67b5c3',
    name: 'محمد',
    email: '01125465248@am-shipping.eg',
    phone: '01125465248',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF&background=dc2626&color=ffffff',
    storeName: 'متجر محمد',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:20:00.000Z',
  },
  {
    id: 'd5892b9e-760c-4a7b-a428-04916faf5513',
    name: 'Pp',
    email: '01125465676@am-shipping.eg',
    phone: '01125465676',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Pp&background=dc2626&color=ffffff',
    storeName: 'متجر Pp',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:25:00.000Z',
  },
  {
    id: '16256cfa-8044-4607-abce-9de1335f311a',
    name: 'ابراهيم شريف',
    email: '01155219660@am-shipping.eg',
    phone: '01155219660',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D8%A8%D8%B1%D8%A7%D9%87%D9%8A%D9%85+%D8%B4%D8%B1%D9%8A%D9%81&background=dc2626&color=ffffff',
    storeName: 'متجر ابراهيم شريف',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:30:00.000Z',
  },
  {
    id: '234aa881-d193-42a3-b86a-5408ba92146e',
    name: 'ام فاتن',
    email: '01234567891@am-shipping.eg',
    phone: '01234567891',
    password: '••••••••',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%85+%D9%81%D8%A7%D8%AA%D9%86&background=dc2626&color=ffffff',
    storeName: 'متجر ام فاتن 2',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:35:00.000Z',
  },
];

export function sanitizeUsers(users?: UserSession[]): UserSession[] {
  const list = Array.isArray(users) ? users : [];
  const usersMap = new Map<string, UserSession>();

  // 1. Seed all known Supabase synced users first
  for (const sUser of SUPABASE_SYNCED_USERS) {
    usersMap.set(sUser.id, sUser);
    if (sUser.phone) usersMap.set(sUser.phone.replace(/\D/g, ''), sUser);
    if (sUser.email) usersMap.set(sUser.email.toLowerCase(), sUser);
  }

  // 2. Overlay incoming users
  for (const u of list) {
    if (u && typeof u === 'object' && (u.id || u.phone || u.email)) {
      const matchKey = u.id || (u.phone ? u.phone.replace(/\D/g, '') : '') || (u.email ? u.email.toLowerCase() : '');
      const existing = usersMap.get(matchKey) || (u.id ? usersMap.get(u.id) : undefined);
      if (existing) {
        const merged = { ...existing, ...u };
        usersMap.set(existing.id, merged);
      } else if (u.id && u.name) {
        usersMap.set(u.id, u);
      }
    }
  }

  // Deduplicate by ID
  const finalUsersMap = new Map<string, UserSession>();
  for (const val of usersMap.values()) {
    if (val && val.id) {
      finalUsersMap.set(val.id, val);
    }
  }

  const result = Array.from(finalUsersMap.values());

  // Ensure admin always exists
  const hasAdmin = result.some((u) => u.role === 'admin' || u.email === PRIMARY_ADMIN_USER.email);
  if (!hasAdmin) {
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

