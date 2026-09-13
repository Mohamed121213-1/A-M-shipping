import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet, FinancialDetails, PaidStatus, AppUserRole } from '../types';

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

// The exact 5 authorized accounts requested by the user:
// 1 Admin, 1 Merchant, 1 Hub Manager, 2 Couriers
export const AUTHORIZED_SYSTEM_USERS: UserSession[] = [
  PRIMARY_ADMIN_USER,
  {
    id: 'USR-1788361785496-4492',
    name: 'ام فاتن',
    email: '01017266727@am-shipping.eg',
    phone: '01017266727',
    role: 'merchant',
    storeName: 'To you',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%85+%D9%81%D8%A7%D8%AA%D9%86&background=059669&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'USR-1788364629634-8301',
    name: 'Ibrahim',
    email: '01118003293@am-shipping.eg',
    phone: '01118003293',
    role: 'hub_manager',
    hubName: 'مستودع القاهرة الرئيسي - رمسيس',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ibrahim&background=2563eb&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'USR-1788364520004-8809',
    name: 'احمد رشاد',
    email: '01033011862@am-shipping.eg',
    phone: '01033011862',
    role: 'courier',
    courierVehicle: 'دراجة نارية / موتوسيكل',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF+%D8%B1%D8%B4%D8%A7%D8%AF&background=d97706&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'USR-1788364242163-4812',
    name: 'حسن علي',
    email: '01093383328@am-shipping.eg',
    phone: '01093383328',
    role: 'courier',
    courierVehicle: 'دراجة نارية / موتوسيكل',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86+%D8%B9%D9%84%D9%8A&background=d97706&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-09-01T00:00:00.000Z',
  },
];

export const SUPABASE_SYNCED_USERS: UserSession[] = AUTHORIZED_SYSTEM_USERS;

// Blacklist of unknown / fake dummy IDs that were accidentally generated
export const DEPRECATED_DUMMY_IDS = new Set([
  '15c6e6d1-df23-4e20-a464-e4df09590e4d', // Amr
  'b009b128-b1f5-4c03-b6ec-842d35cca9b0', 
  '16cfabd6-f309-4c09-ad2e-3ddc10338d67', 
  '8b151dbb-660d-4169-903a-647c12967504', // Oo
  '169880e0-ba38-416e-ab42-9ae66d67b5c3', // محمد
  'd5892b9e-760c-4a7b-a428-04916faf5513', // Pp
  '16256cfa-8044-4607-abce-9de1335f311a', // ابراهيم شريف
  '234aa881-d193-42a3-b86a-5408ba92146e', // fake duplicate
  '10fdf171-fb33-4ede-9d27-2fae8a2c2d4b', 
  'b251467a-76c7-4afa-93bd-762a1bffc340', // fake client
  '51dd3367-fffa-4f2e-af58-5503ff2bc7c5', // fake client
  'USR-1788361248924',
]);

export const DEPRECATED_DUMMY_PHONES = new Set([
  '01015674681', // Amr
  '01011223344', // test
  '01121212121', // Oo
  '01125465248', // محمد
  '01125465676', // Pp
  '01155219660', // ابراهيم شريف
  '01234567891', // fake duplicate
]);

// Permanent purge list for the 46 old deleted shipments so they can never be resurrected
export const PURGED_OLD_SHIPMENT_TRACKING_NUMBERS = new Set([
  'BST-318207', 'BST-710061', 'BST-596169', 'BST-824992', 'BST-924803', 'BST-747443',
  'BST-331929', 'BST-829765', 'BST-244095', 'BST-339834', 'BST-898354', 'BST-592398',
  'BST-929361', 'BST-200893', 'BST-585071', 'BST-431846', 'BST-480234', 'BST-862573',
  'BST-893139', 'BST-281073', 'BST-212631', 'BST-722692', 'BST-633295', 'BST-313166',
  'BST-543443', 'BST-559796', 'BST-619707', 'BST-152528', 'BST-367621', 'BST-515715',
  'BST-555076', 'BST-620920', 'BST-535734', 'BST-231465', 'BST-237828', 'BST-336905',
  'BST-428675', 'BST-927727', 'BST-136036', 'BST-893238', 'BST-894174', 'BST-311789',
  'BST-460427', 'BST-248160', 'BST-720323', 'BST-991501'
]);

export function isDeprecatedDummyUser(u: any): boolean {
  if (!u) return true;
  // Always protect the 5 authorized accounts
  if (u.id === 'admin_root' || u.phone === '01000000001' || u.email === 'mohamedsalah565657@icloud.com' || u.email === 'mohamedsalah565657@gmail.com') {
    return false;
  }
  if (u.id === 'USR-1788361785496-4492' || u.phone === '01017266727') return false;
  if (u.id === 'USR-1788364629634-8301' || u.phone === '01118003293') return false;
  if (u.id === 'USR-1788364520004-8809' || u.phone === '01033011862') return false;
  if (u.id === 'USR-1788364242163-4812' || u.phone === '01093383328') return false;

  if (u.id && DEPRECATED_DUMMY_IDS.has(String(u.id))) return true;
  if (u.phone) {
    const cleanPhone = String(u.phone).replace(/\D/g, '');
    if (cleanPhone && DEPRECATED_DUMMY_PHONES.has(cleanPhone)) return true;
  }
  if (u.name && (u.name.includes('محمد علي تاجر') || u.name === 'محمد علي تجريبي' || u.name === 'Amr' || u.name === 'Oo' || u.name === 'Pp' || u.name === 'محمد' || u.name === 'ابراهيم شريف')) return true;
  if (u.storeName && (u.storeName.includes('متجر علي') || u.storeName.includes('متجر Amr') || u.storeName.includes('متجر Oo') || u.storeName.includes('متجر Pp') || u.storeName.includes('متجر محمد') || u.storeName.includes('متجر ابراهيم'))) return true;
  if (u.role === 'client') return true;
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
  const adminIndex = result.findIndex((u) => 
    u.id === 'admin_root' || 
    u.role === 'admin' || 
    (u.email && (u.email === PRIMARY_ADMIN_USER.email || u.email.toLowerCase() === 'mohamedsalah565657@gmail.com'))
  );
  if (adminIndex >= 0) {
    result[adminIndex] = { ...result[adminIndex], isConfirmed: true, role: 'admin' };
  } else {
    result.unshift(PRIMARY_ADMIN_USER);
  }

  const KNOWN_ROLES: Record<string, AppUserRole> = {
    'admin_root': 'admin',
    'USR-1788361785496-4492': 'merchant',
    'USR-1788364629634-8301': 'hub_manager',
    'USR-1788364520004-8809': 'courier',
    'USR-1788364242163-4812': 'courier',
  };

  return result.map((u) => {
    if (KNOWN_ROLES[u.id]) {
      return { ...u, role: KNOWN_ROLES[u.id] };
    }
    return u;
  });
}

export const AUTHORIZED_COURIERS: CourierInfo[] = [
  {
    id: 'USR-1788364520004-8809',
    name: 'احمد رشاد',
    phone: '01033011862',
    vehicle: 'motocycle',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF+%D8%B1%D8%B4%D8%A7%D8%AF&background=d97706&color=ffffff',
    activeDeliveriesCount: 0,
    rating: 5.0,
    governorate: 'القاهرة',
    zone: 'القاهرة والجيزة'
  },
  {
    id: 'USR-1788364242163-4812',
    name: 'حسن علي',
    phone: '01093383328',
    vehicle: 'motocycle',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86+%D8%B9%D9%84%D9%8A&background=d97706&color=ffffff',
    activeDeliveriesCount: 12,
    rating: 5.0,
    governorate: 'القاهرة',
    zone: 'القاهرة والجيزة'
  }
];

export function sanitizeCouriers(couriers?: CourierInfo[]): CourierInfo[] {
  const list = Array.isArray(couriers) && couriers.length > 0 ? couriers : AUTHORIZED_COURIERS;
  const filtered = list.filter((c) => {
    if (!c || typeof c !== 'object' || !c.id || !c.name) return false;
    if (c.phone && DEPRECATED_DUMMY_PHONES.has(String(c.phone).replace(/\D/g, ''))) return false;
    return true;
  });

  const map = new Map<string, CourierInfo>();
  for (const c of AUTHORIZED_COURIERS) {
    map.set(c.id, c);
  }
  for (const c of filtered) {
    map.set(c.id, { ...(map.get(c.id) || {}), ...c });
  }
  return Array.from(map.values());
}

export function sanitizeCompanyTxns(txns?: CompanyTransaction[]): CompanyTransaction[] {
  const list = Array.isArray(txns) ? txns : [];
  return list.filter((t) => t && typeof t === 'object' && t.id);
}

export function sanitizeShipments(shipments?: Shipment[]): Shipment[] {
  const list = Array.isArray(shipments) ? shipments : [];
  return list
    .filter((s) => {
      if (!s || typeof s !== 'object' || (!s.id && !s.trackingNumber)) return false;
      const tracking = s.trackingNumber || s.id;
      if (tracking && PURGED_OLD_SHIPMENT_TRACKING_NUMBERS.has(tracking)) return false;
      if (s.id && PURGED_OLD_SHIPMENT_TRACKING_NUMBERS.has(s.id)) return false;
      if (s.createdAt && new Date(s.createdAt).getTime() < new Date('2026-09-07T00:00:00.000Z').getTime()) return false;
      if (s.sender) {
        if (isDeprecatedDummyUser(s.sender)) return false;
        const sPhone = (s.sender.phone ? String(s.sender.phone) : '').replace(/\D/g, '');
        if (sPhone === '01011223344') return false;
        if (s.sender.storeName && s.sender.storeName.includes('متجر علي')) return false;
      }
      return true;
    })
    .map((s) => {
      // Normalize recipient name if it is empty or pure punctuation (e.g. . or , or ،)
      const recipient = s.recipient ? { ...s.recipient } : ({} as any);
      const nameStr = (recipient.name || '').trim();
      if (!nameStr || /^[\s.,'،_\-]*$/.test(nameStr)) {
        recipient.name = recipient.city 
          ? `عميل (${recipient.city})` 
          : `عميل (${recipient.phone || s.trackingNumber})`;
      }
      return {
        ...s,
        recipient,
      };
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

  if (incomingArr.length === 0) return existingArr;
  if (existingArr.length === 0) return incomingArr;

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

