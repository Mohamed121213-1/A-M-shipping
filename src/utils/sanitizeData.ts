import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet, FinancialDetails, PaidStatus } from '../types';

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

export const DEPRECATED_DUMMY_IDS = new Set([
  '15c6e6d1-df23-4e20-a464-e4df09590e4d',
  'b009b128-b1f5-4c03-b6ec-842d35cca9b0',
  '16cfabd6-f309-4c09-ad2e-3ddc10338d67',
  '8b151dbb-660d-4169-903a-647c12967504',
  '169880e0-ba38-416e-ab42-9ae66d67b5c3',
  'd5892b9e-760c-4a7b-a428-04916faf5513',
  '16256cfa-8044-4607-abce-9de1335f311a',
  '234aa881-d193-42a3-b86a-5408ba92146e',
  '10fdf171-fb33-4ede-9d27-2fae8a2c2d4b',
  'USR-1788361248924',
]);

export const DEPRECATED_DUMMY_PHONES = new Set([
  '01015674681',
  '01011223344', // محمد علي تاجر (متجر علي) - dummy account to purge
  '01093383328',
  '01121212121',
  '01125465248',
  '01125465676',
  '01155219660',
  '01234567891',
]);

export function isDeprecatedDummyUser(u: any): boolean {
  if (!u) return true;
  if (u.id && DEPRECATED_DUMMY_IDS.has(String(u.id))) return true;
  if (u.phone) {
    const cleanPhone = String(u.phone).replace(/\D/g, '');
    if (cleanPhone && DEPRECATED_DUMMY_PHONES.has(cleanPhone)) return true;
  }
  if (u.name && (u.name.includes('محمد علي تاجر') || u.name === 'محمد علي')) return true;
  if (u.storeName && u.storeName.includes('متجر علي')) return true;
  if (u.store_name && u.store_name.includes('متجر علي')) return true;
  if (u.email && u.email.includes('mohamed.ali@test.com')) return true;
  return false;
}

export function sanitizeUsers(users?: UserSession[]): UserSession[] {
  const list = Array.isArray(users) ? users.filter((u) => !isDeprecatedDummyUser(u)) : [];
  const usersById = new Map<string, UserSession>();
  const phoneToId = new Map<string, string>();
  const emailToId = new Map<string, string>();

  const registerUser = (u: any) => {
    if (!u || !u.id || isDeprecatedDummyUser(u)) return;
    const cleanPhone = u.phone ? String(u.phone).trim() : '';
    const cleanEmail = u.email ? String(u.email).trim() : (cleanPhone ? `${cleanPhone.replace(/\D/g, '')}@am-shipping.eg` : `${u.id}@am-shipping.eg`);
    const cleanName = u.name ? String(u.name).trim() : 'مستخدم';
    
    const cleanUser: UserSession = {
      ...u,
      id: String(u.id),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: u.role || 'merchant',
      storeName: u.storeName || (u.store_name ? String(u.store_name) : undefined),
      hubName: u.hubName || (u.hub_name ? String(u.hub_name) : undefined),
      courierVehicle: u.courierVehicle || (u.courier_vehicle ? String(u.courier_vehicle) : undefined),
      password: u.password ? String(u.password) : '123456',
      isConfirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : (u.is_confirmed !== undefined ? Boolean(u.is_confirmed) : true),
      avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=dc2626&color=ffffff`,
      registeredAt: u.registeredAt || u.created_at || new Date().toISOString(),
      hasCustomShippingRate: u.hasCustomShippingRate !== undefined 
        ? Boolean(u.hasCustomShippingRate) 
        : (u.customShippingRate !== undefined && u.customShippingRate !== null ? true : false),
      customShippingRate: (u.customShippingRate !== undefined && u.customShippingRate !== null && !isNaN(Number(u.customShippingRate)))
        ? Number(u.customShippingRate)
        : (u.custom_shipping_rate !== undefined && u.custom_shipping_rate !== null && !isNaN(Number(u.custom_shipping_rate))
          ? Number(u.custom_shipping_rate)
          : undefined),
      customGovernorateRates: u.customGovernorateRates || u.custom_governorate_rates || undefined,
      shippingPricingType: u.shippingPricingType || u.shipping_pricing_type || (u.customGovernorateRates ? 'governorates' : 'fixed'),
      shippingNotes: u.shippingNotes || u.shipping_notes || undefined,
    };

    usersById.set(cleanUser.id, cleanUser);
    if (cleanPhone) {
      const digits = cleanPhone.replace(/\D/g, '');
      if (digits) phoneToId.set(digits, cleanUser.id);
    }
    if (cleanEmail) {
      emailToId.set(cleanEmail.toLowerCase(), cleanUser.id);
    }
  };

  // 1. Seed Admin user
  registerUser(PRIMARY_ADMIN_USER);

  // 2. Merge incoming users with full state priority
  for (const u of list) {
    if (!u || typeof u !== 'object' || isDeprecatedDummyUser(u)) continue;

    let existingId = u.id && usersById.has(String(u.id)) ? String(u.id) : undefined;
    if (!existingId && u.phone) {
      const digits = String(u.phone).replace(/\D/g, '');
      if (digits) existingId = phoneToId.get(digits);
    }
    if (!existingId && u.email) {
      existingId = emailToId.get(String(u.email).toLowerCase().trim());
    }

    if (existingId) {
      if (existingId === 'admin_root') {
        const existing = usersById.get('admin_root')!;
        registerUser({
          ...existing,
          ...u,
          id: 'admin_root',
          role: 'admin',
          isConfirmed: true,
        });
      } else {
        const existing = usersById.get(existingId)!;
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
      }
    } else if (u.id && (u.name || u.phone)) {
      registerUser({
        ...u,
        isConfirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : false,
      });
    }
  }

  const result = Array.from(usersById.values());

  // Ensure admin always exists and is always confirmed
  const adminIndex = result.findIndex((u) => u.id === 'admin_root' || u.role === 'admin' || (u.email && u.email === PRIMARY_ADMIN_USER.email));
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
  return list.filter((s) => {
    if (!s || typeof s !== 'object' || (!s.id && !s.trackingNumber)) return false;
    if (s.sender) {
      if (isDeprecatedDummyUser(s.sender)) return false;
      const sPhone = (s.sender.phone ? String(s.sender.phone) : '').replace(/\D/g, '');
      if (sPhone === '01011223344') return false;
      if (s.sender.storeName && s.sender.storeName.includes('متجر علي')) return false;
      if (s.sender.contactName && s.sender.contactName.includes('محمد علي تاجر')) return false;
    }
    return true;
  });
}

export const STATUS_RANK: Record<string, number> = {
  'pending_approval': 1,
  'created': 2,
  'in_hub': 3,
  'out_for_delivery': 4,
  'failed_attempt': 5,
  'partial_delivery': 6,
  'refused': 6,
  'returned': 6,
  'delivered': 6,
  'cancelled': 6,
};

export function mergeSingleShipment(current: Shipment, incoming: Shipment): Shipment {
  if (!current) return incoming;
  if (!incoming) return current;

  const currentTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
  const incomingTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();

  const currentRank = STATUS_RANK[current.status] || 0;
  const incomingRank = STATUS_RANK[incoming.status] || 0;

  const currentTimeline = Array.isArray(current.timeline) ? current.timeline : [];
  const incomingTimeline = Array.isArray(incoming.timeline) ? incoming.timeline : [];

  // Merge timelines without losing events
  const timelineMap = new Map<string, any>();
  for (const t of [...currentTimeline, ...incomingTimeline]) {
    if (t) {
      const key = t.id || `${t.status}_${t.timestamp}_${t.title}`;
      timelineMap.set(key, t);
    }
  }
  const mergedTimeline = Array.from(timelineMap.values());

  // PRIORITY RULE 1: Lifecycle progression protection (Anti-Rollback)
  // Higher rank ALWAYS beats lower rank. Under no circumstances can a lower rank status overwrite a higher rank status!
  let winningObj: Shipment;
  if (currentRank > incomingRank) {
    // Current is further along in shipment lifecycle (e.g. delivered/out_for_delivery vs created)
    winningObj = current;
  } else if (incomingRank > currentRank) {
    // Incoming is further along in shipment lifecycle
    winningObj = incoming;
  } else {
    // Ranks are identical (e.g. both rank 6: refused vs delivered, or both delivered)
    // In this case, timestamp decides
    if (incomingTime > currentTime + 50) {
      winningObj = incoming;
    } else if (currentTime > incomingTime + 50) {
      winningObj = current;
    } else if (incomingTimeline.length > currentTimeline.length) {
      winningObj = incoming;
    } else {
      winningObj = current;
    }
  }

  // SECONDARY SAFEGUARD: Check merged timeline for terminal statuses
  // If the timeline contains delivered/returned/refused/partial_delivery, the shipment MUST NOT be downgraded!
  let effectiveStatus = winningObj.status;
  const hasDeliveredInTimeline = mergedTimeline.some((t: any) => t?.status === 'delivered');
  const hasRefusedInTimeline = mergedTimeline.some((t: any) => t?.status === 'refused');
  const hasReturnedInTimeline = mergedTimeline.some((t: any) => t?.status === 'returned');
  const hasPartialInTimeline = mergedTimeline.some((t: any) => t?.status === 'partial_delivery');

  if ((STATUS_RANK[effectiveStatus] || 0) < 6) {
    if (hasDeliveredInTimeline) effectiveStatus = 'delivered';
    else if (hasRefusedInTimeline) effectiveStatus = 'refused';
    else if (hasReturnedInTimeline) effectiveStatus = 'returned';
    else if (hasPartialInTimeline) effectiveStatus = 'partial_delivery';
  }

  const mergedFinancials: FinancialDetails = {
    codAmount: Number(winningObj.financials?.codAmount ?? incoming.financials?.codAmount ?? current.financials?.codAmount ?? 0),
    shippingFee: Number(winningObj.financials?.shippingFee ?? incoming.financials?.shippingFee ?? current.financials?.shippingFee ?? 0),
    codFee: Number(winningObj.financials?.codFee ?? incoming.financials?.codFee ?? current.financials?.codFee ?? 0),
    insuranceFee: Number(winningObj.financials?.insuranceFee ?? incoming.financials?.insuranceFee ?? current.financials?.insuranceFee ?? 0),
    netPayout: Number(winningObj.financials?.netPayout ?? incoming.financials?.netPayout ?? current.financials?.netPayout ?? 0),
    paidStatus: (winningObj.financials?.paidStatus ?? incoming.financials?.paidStatus ?? current.financials?.paidStatus ?? 'unpaid') as any,
    settlementDate: winningObj.financials?.settlementDate ?? incoming.financials?.settlementDate ?? current.financials?.settlementDate,
  };

  const mergedProof = winningObj.proofOfDelivery || current.proofOfDelivery || incoming.proofOfDelivery;
  const mergedRefused = winningObj.refusedDetails || current.refusedDetails || incoming.refusedDetails;
  const mergedPartial = winningObj.partialDetails || current.partialDetails || incoming.partialDetails;
  const mergedCourier = winningObj.assignedCourier || current.assignedCourier || incoming.assignedCourier;

  return {
    ...current,
    ...incoming,
    ...winningObj,
    status: effectiveStatus,
    updatedAt: winningObj.updatedAt || current.updatedAt || incoming.updatedAt || new Date().toISOString(),
    timeline: mergedTimeline.length > 0 ? mergedTimeline : winningObj.timeline,
    financials: mergedFinancials,
    proofOfDelivery: mergedProof,
    refusedDetails: mergedRefused,
    partialDetails: mergedPartial,
    assignedCourier: mergedCourier,
  };
}

export function mergeShipmentsLists(existingList?: Shipment[], incomingList?: Shipment[]): Shipment[] {
  const existingArr = Array.isArray(existingList) ? sanitizeShipments(existingList) : [];
  const incomingArr = Array.isArray(incomingList) ? sanitizeShipments(incomingList) : [];

  const map = new Map<string, Shipment>();

  for (const s of existingArr) {
    if (s && (s.id || s.trackingNumber)) {
      map.set(s.id || s.trackingNumber, s);
    }
  }

  for (const incoming of incomingArr) {
    if (!incoming || (!incoming.id && !incoming.trackingNumber)) continue;
    const key = incoming.id || incoming.trackingNumber;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, incoming);
    } else {
      map.set(key, mergeSingleShipment(existing, incoming));
    }
  }

  return Array.from(map.values());
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

