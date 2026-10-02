import { UserSession, CourierInfo, CompanyTransaction, Shipment, MerchantWallet, FinancialDetails, PaidStatus, AppUserRole } from '../types';
import { INITIAL_SHIPMENTS } from '../data/mockData';

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
// 1 Admin, 1 Merchant (approved)
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
];

export const SUPABASE_SYNCED_USERS: UserSession[] = AUTHORIZED_SYSTEM_USERS;

// Legacy corrupt test IDs that were removed from the initial setup
export const DEPRECATED_DUMMY_IDS = new Set<string>([
  '15c6e6d1-df23-4e20-a464-e4df09590e4d',
  '16256cfa-8044-4607-abce-9de1335f311a',
  '234aa881-d193-42a3-b86a-5408ba92146e',
  'b251467a-76c7-4afa-93bd-762a1bffc340',
  '51dd3367-fffa-4f2e-af58-5503ff2bc7c5',
]);

// Empty set - all phone numbers can be registered if the user registers them again
export const DEPRECATED_DUMMY_PHONES = new Set<string>();

// Empty set - no valid shipments are purged
export const PURGED_OLD_SHIPMENT_TRACKING_NUMBERS = new Set<string>();

export function isDeprecatedDummyUser(u: any): boolean {
  if (!u) return true;
  // Always protect the primary admin and confirmed legitimate merchant
  if (u.id === 'admin_root' || u.phone === '01000000001' || u.email === 'mohamedsalah565657@icloud.com' || u.email === 'mohamedsalah565657@gmail.com') {
    return false;
  }
  if (u.id === 'USR-1788361785496-4492' || u.phone === '01017266727') return false; // ام فاتن

  // Only reject old legacy corrupt test IDs; allow ANY user to register again if re-registered
  if (u.id && DEPRECATED_DUMMY_IDS.has(String(u.id))) return true;
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
  };

  return result.map((u) => {
    if (KNOWN_ROLES[u.id]) {
      return { ...u, role: KNOWN_ROLES[u.id] };
    }
    return u;
  });
}

// Couriers are now dynamic and managed by the admin/user without hardcoded zombie couriers
export const AUTHORIZED_COURIERS: CourierInfo[] = [];

export function sanitizeCouriers(couriers?: CourierInfo[], users?: UserSession[]): CourierInfo[] {
  const list = Array.isArray(couriers) ? couriers : [];
  const map = new Map<string, CourierInfo>();

  for (const c of list) {
    if (!c || typeof c !== 'object' || !c.id || !c.name) continue;
    if (DEPRECATED_DUMMY_IDS.has(String(c.id))) continue;
    map.set(String(c.id), c);
  }

  // Also include any user whose role is courier so new delegate registrations are never lost
  if (Array.isArray(users)) {
    for (const u of users) {
      if (!u || u.role !== 'courier' || isDeprecatedDummyUser(u)) continue;
      const uId = String(u.id);
      const cleanPhone = u.phone ? String(u.phone).trim() : '';
      const existing = map.get(uId) || (cleanPhone ? Array.from(map.values()).find((x) => x.phone === cleanPhone) : undefined);
      if (existing) {
        map.set(existing.id, {
          ...existing,
          name: u.name || existing.name,
          phone: u.phone || existing.phone,
          avatarUrl: u.avatarUrl || existing.avatarUrl,
          photoUrl: u.avatarUrl || existing.photoUrl,
          isConfirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : existing.isConfirmed,
        });
      } else {
        map.set(uId, {
          id: uId,
          name: u.name,
          phone: u.phone || '',
          vehicle: u.courierVehicle === 'سيارة فان' ? 'van' : 'motocycle',
          assignedHub: u.hubName || 'المستودع الرئيسي',
          rating: 5.0,
          activeDeliveriesCount: 0,
          avatarUrl: u.avatarUrl,
          photoUrl: u.avatarUrl,
          isConfirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : false,
        });
      }
    }
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
      // Heal and restore original COD amount if it was zeroed or overwritten by partial shipping fee
      let financials = s.financials ? { ...s.financials } : ({} as any);
      let refusedDetails = s.refusedDetails ? { ...s.refusedDetails } : undefined;

      const isRefusedOrReturned = s.status === 'refused' || s.status === 'returned';
      const initialMatch = INITIAL_SHIPMENTS.find(
        (init) => init.id === s.id || init.trackingNumber === s.trackingNumber
      );

      if (isRefusedOrReturned) {
        const collectedAmt = Number(refusedDetails?.amountCollected || 0);
        const currentCod = Number(financials.codAmount || 0);
        const initialCod = Number(initialMatch?.financials?.codAmount || 0);
        const storedOriginalCod = Number(refusedDetails?.originalCodAmount || 0);

        // If COD was zeroed (customer cancellation) or overwritten by the collected shipping fee:
        let trueCod = storedOriginalCod > 0 ? storedOriginalCod : 0;
        if (initialCod > 0 && (trueCod <= 0 || trueCod === collectedAmt || currentCod <= 0 || currentCod === collectedAmt)) {
          trueCod = initialCod;
        } else if (trueCod <= 0) {
          trueCod = currentCod > 0 && currentCod !== collectedAmt ? currentCod : initialCod;
        }

        const trueFee =
          Number(financials.shippingFee) > 0
            ? Number(financials.shippingFee)
            : Number(initialMatch?.financials?.shippingFee || 80);

        const isCancelExempt = Boolean(
          refusedDetails?.isCustomerCancellationWithoutFee ||
          refusedDetails?.reason?.includes('إلغاء') ||
          refusedDetails?.reason?.includes('إعفاء') ||
          s.timeline?.some((t: any) => t?.description?.includes('إعفاء') || t?.description?.includes('طلب إلغاء'))
        );

        if (trueCod > 0) {
          financials.codAmount = trueCod;
          financials.shippingFee = trueFee;
          if (!refusedDetails) {
            refusedDetails = {
              shippingFeePaid: false,
              amountCollected: 0,
              reason: isCancelExempt ? 'العميل طلب إلغاء الأوردر (إعفاء من مصاريف الشحن)' : 'مرتجع للتاجر',
            };
          }
          refusedDetails.originalCodAmount = trueCod;
          refusedDetails.originalGoodsValue = Math.max(0, trueCod - trueFee);

          if (isCancelExempt) {
            refusedDetails.isCustomerCancellationWithoutFee = true;
            refusedDetails.amountCollected = 0;
            refusedDetails.merchantDeductedAmount = 0;
            refusedDetails.shippingFeePaid = false;
            refusedDetails.partialShippingFeePaid = false;
            financials.netPayout = 0;
          } else if (refusedDetails.amountCollected > 0 && refusedDetails.amountCollected < trueFee) {
            refusedDetails.partialShippingFeePaid = true;
            refusedDetails.merchantDeductedAmount = Math.max(0, trueFee - refusedDetails.amountCollected);
            financials.netPayout = -refusedDetails.merchantDeductedAmount;
          } else if (refusedDetails.amountCollected >= trueFee && trueFee > 0) {
            refusedDetails.shippingFeePaid = true;
            refusedDetails.merchantDeductedAmount = 0;
            financials.netPayout = 0;
          } else {
            refusedDetails.shippingFeePaid = false;
            refusedDetails.merchantDeductedAmount = trueFee;
            financials.netPayout = -trueFee;
          }
        }
      }

      return {
        ...s,
        recipient,
        financials,
        refusedDetails,
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

  let mergedRefused = winningObj.refusedDetails || current.refusedDetails || incoming.refusedDetails;
  const mergedPartial = winningObj.partialDetails || current.partialDetails || incoming.partialDetails;
  const mergedCourier = winningObj.assignedCourier || current.assignedCourier || incoming.assignedCourier;

  let trueCod = Number(winningObj.financials?.codAmount ?? incoming.financials?.codAmount ?? current.financials?.codAmount ?? 0);
  if (effectiveStatus === 'returned' || effectiveStatus === 'refused') {
    const origCodCandidate = mergedRefused?.originalCodAmount || current.refusedDetails?.originalCodAmount || incoming.refusedDetails?.originalCodAmount;
    const initialMatch = INITIAL_SHIPMENTS.find((init) => init.id === current.id || init.trackingNumber === current.trackingNumber);
    const initialCod = Number(initialMatch?.financials?.codAmount || 0);

    if (origCodCandidate && origCodCandidate > 0) {
      trueCod = origCodCandidate;
    } else if (initialCod > 0 && (trueCod <= 0 || trueCod === (mergedRefused?.amountCollected || 0))) {
      trueCod = initialCod;
    }

    if (trueCod > 0 && mergedRefused) {
      mergedRefused = {
        ...mergedRefused,
        originalCodAmount: trueCod,
        originalGoodsValue: mergedRefused.originalGoodsValue || Math.max(0, trueCod - (winningObj.financials?.shippingFee || 80)),
      };
    }
  }

  const mergedFinancials: FinancialDetails = {
    codAmount: trueCod,
    shippingFee: Number(winningObj.financials?.shippingFee ?? incoming.financials?.shippingFee ?? current.financials?.shippingFee ?? 0),
    codFee: Number(winningObj.financials?.codFee ?? incoming.financials?.codFee ?? current.financials?.codFee ?? 0),
    insuranceFee: Number(winningObj.financials?.insuranceFee ?? incoming.financials?.insuranceFee ?? current.financials?.insuranceFee ?? 0),
    netPayout: Number(winningObj.financials?.netPayout ?? incoming.financials?.netPayout ?? current.financials?.netPayout ?? 0),
    paidStatus: (winningObj.financials?.paidStatus ?? incoming.financials?.paidStatus ?? current.financials?.paidStatus ?? 'unpaid') as any,
    settlementDate: winningObj.financials?.settlementDate ?? incoming.financials?.settlementDate ?? current.financials?.settlementDate,
  };

  const mergedProof = winningObj.proofOfDelivery || current.proofOfDelivery || incoming.proofOfDelivery;

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

