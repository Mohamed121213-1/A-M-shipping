import { supabase, isSupabaseConfigured } from './supabase';
import { Shipment, MerchantWallet, UserSession, CourierInfo, HubInfo, GovernorateRate, CourierNotification, CompanyTransaction } from '../types';
import { sanitizeUsers, sanitizeCouriers, sanitizeCompanyTxns, sanitizeShipments, sanitizeWallet, isDeprecatedDummyUser, mergeShipmentsLists, mergeSingleShipment } from '../utils/sanitizeData';

export interface SyncedAppState {
  shipments?: Shipment[];
  wallet?: MerchantWallet;
  users?: UserSession[];
  couriers?: CourierInfo[];
  hubs?: HubInfo[];
  governorates?: GovernorateRate[];
  notifications?: CourierNotification[];
  companyTransactions?: CompanyTransaction[];
  timestamp?: number;
  senderId?: string;
}

type SyncCallback = (newState: SyncedAppState) => void;

class SyncEngine {
  private localChannel: BroadcastChannel | null = null;
  private realtimeChannel: any = null;
  private listeners: Set<SyncCallback> = new Set();
  private isProcessingIncoming = false;
  private instanceId = `CLIENT-${Math.random().toString(36).substring(2, 9)}`;
  private latestStateCache: SyncedAppState | null = null;
  private latestTimestamp: number = 0;
  private localStatusLocks: Map<string, { status: string; timestamp: number; fullShipment?: any }> = new Map();

  private loadSavedLocks() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('bosta_status_locks');
      if (raw) {
        const parsed = JSON.parse(raw);
        const now = Date.now();
        for (const [id, lock] of Object.entries(parsed) as any) {
          if (lock && now - lock.timestamp < 900000) { // 15 minutes lock
            this.localStatusLocks.set(id, lock);
          }
        }
      }
    } catch (e) {}
  }

  private saveLocks() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, any> = {};
      const now = Date.now();
      for (const [id, lock] of this.localStatusLocks.entries()) {
        if (now - lock.timestamp < 900000) {
          obj[id] = lock;
        }
      }
      localStorage.setItem('bosta_status_locks', JSON.stringify(obj));
    } catch (e) {}
  }

  public lockShipmentStatus(shipmentId: string, status: string, fullShipment?: any) {
    this.localStatusLocks.set(shipmentId, { status, timestamp: Date.now(), fullShipment });
    this.saveLocks();
    setTimeout(() => {
      const lock = this.localStatusLocks.get(shipmentId);
      if (lock && Date.now() - lock.timestamp >= 890000) {
        this.localStatusLocks.delete(shipmentId);
        this.saveLocks();
      }
    }, 900000);
  }

  constructor() {
    this.loadSavedLocks();
    // 0. Initialize latest timestamp & full state cache from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedTime = localStorage.getItem('bosta_last_updated');
        if (savedTime) {
          this.latestTimestamp = Number(savedTime) || 0;
        }

        const shipmentsRaw = localStorage.getItem('bosta_shipments');
        const walletRaw = localStorage.getItem('bosta_wallet');
        const usersRaw = localStorage.getItem('bosta_users');
        const couriersRaw = localStorage.getItem('bosta_couriers');
        const hubsRaw = localStorage.getItem('bosta_hubs');
        const governoratesRaw = localStorage.getItem('bosta_governorates');
        const notificationsRaw = localStorage.getItem('bosta_courier_notifications');
        const txnsRaw = localStorage.getItem('bosta_company_txns');

        this.latestStateCache = {
          shipments: shipmentsRaw ? sanitizeShipments(JSON.parse(shipmentsRaw)) : undefined,
          wallet: walletRaw ? sanitizeWallet(JSON.parse(walletRaw)) : undefined,
          users: usersRaw ? sanitizeUsers(JSON.parse(usersRaw)) : undefined,
          couriers: couriersRaw ? sanitizeCouriers(JSON.parse(couriersRaw)) : undefined,
          hubs: hubsRaw ? JSON.parse(hubsRaw) : undefined,
          governorates: governoratesRaw ? JSON.parse(governoratesRaw) : undefined,
          notifications: notificationsRaw ? JSON.parse(notificationsRaw) : undefined,
          companyTransactions: txnsRaw ? sanitizeCompanyTxns(JSON.parse(txnsRaw)) : undefined,
          timestamp: this.latestTimestamp || Date.now(),
          senderId: this.instanceId,
        };
      } catch (e) {
        console.warn('Error reading bosta local state cache:', e);
      }
    }

    // 1. Initialize local BroadcastChannel for same-device multi-window / multi-tab syncing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localChannel = new BroadcastChannel('bosta_app_sync_channel');
        this.localChannel.onmessage = (event) => {
          if (event.data && event.data.senderId !== this.instanceId) {
            this.handleIncomingUpdate(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Initialize Server-Side API Sync (cross-device & cross-browser synchronization)
    if (typeof window !== 'undefined') {
      this.fetchPersistedStateFromServer();
      this.initSseStream();
      
      // Safety fallback poll every 5 seconds
      setInterval(() => {
        this.fetchPersistedStateFromServer();
      }, 5000);

      // Re-check and sync state immediately when phone is unlocked, tab becomes visible, or on focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchPersistedStateFromServer();
          if (!this.sseSource || this.sseSource.readyState !== EventSource.OPEN) {
            this.initSseStream();
          }
        }
      });

      window.addEventListener('focus', () => {
        this.fetchPersistedStateFromServer();
        if (!this.sseSource || this.sseSource.readyState !== EventSource.OPEN) {
          this.initSseStream();
        }
      });

      window.addEventListener('pageshow', () => {
        this.fetchPersistedStateFromServer();
      });

      window.addEventListener('online', () => {
        this.fetchPersistedStateFromServer();
        this.initSseStream();
      });

      // Listen to Service Worker Background Sync & Push updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'BACKGROUND_STATE_SYNC_COMPLETED' && event.data?.state) {
            this.handleIncomingUpdate({
              ...event.data.state,
              timestamp: event.data.timestamp || Date.now(),
              senderId: 'sw_background_push_sync',
            });
          } else if (event.data?.type === 'NOTIFICATION_CLICKED') {
            this.fetchPersistedStateFromServer();
          }
        });
      }
    }

    // 3. Initialize Supabase Realtime Broadcast Channel for cross-device & cross-account syncing
    if (isSupabaseConfigured) {
      try {
        this.realtimeChannel = supabase.channel('bosta_global_realtime');
        this.realtimeChannel
          .on('broadcast', { event: 'app_state_change' }, (payload: any) => {
            if (payload?.payload && payload.payload.senderId !== this.instanceId) {
              this.handleIncomingUpdate(payload.payload);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bosta_app_state' }, (payload: any) => {
            if (payload?.new?.state && payload.new.state.senderId !== this.instanceId) {
              this.handleIncomingUpdate(payload.new.state);
            }
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('⚡ Connected to Global Realtime Sync');
            }
          });

        this.fetchPersistedStateFromSupabase();
      } catch (err) {
        console.warn('Supabase Realtime Channel error:', err);
      }
    }

    // 4. Fallback Storage event listener for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('bosta_')) {
          try {
            const storedTime = localStorage.getItem('bosta_last_updated');
            const timeNum = storedTime ? Number(storedTime) : Date.now();

            const shipmentsRaw = localStorage.getItem('bosta_shipments');
            const walletRaw = localStorage.getItem('bosta_wallet');
            const usersRaw = localStorage.getItem('bosta_users');
            const couriersRaw = localStorage.getItem('bosta_couriers');
            const hubsRaw = localStorage.getItem('bosta_hubs');
            const governoratesRaw = localStorage.getItem('bosta_governorates');
            const notificationsRaw = localStorage.getItem('bosta_courier_notifications');
            const txnsRaw = localStorage.getItem('bosta_company_txns');

            let shipments: Shipment[] | undefined = shipmentsRaw ? sanitizeShipments(JSON.parse(shipmentsRaw)) : undefined;
            let users: UserSession[] | undefined = usersRaw ? sanitizeUsers(JSON.parse(usersRaw)) : undefined;
            let couriers: CourierInfo[] | undefined = couriersRaw ? sanitizeCouriers(JSON.parse(couriersRaw)) : undefined;
            let wallet: MerchantWallet | undefined = walletRaw ? sanitizeWallet(JSON.parse(walletRaw)) : undefined;
            let companyTransactions: CompanyTransaction[] | undefined = txnsRaw ? sanitizeCompanyTxns(JSON.parse(txnsRaw)) : undefined;

            const incomingState: SyncedAppState = {
              shipments,
              wallet,
              users,
              couriers,
              hubs: hubsRaw ? JSON.parse(hubsRaw) : undefined,
              governorates: governoratesRaw ? JSON.parse(governoratesRaw) : undefined,
              notifications: notificationsRaw ? JSON.parse(notificationsRaw) : undefined,
              companyTransactions,
              timestamp: timeNum,
              senderId: 'storage_sync',
            };

            if (timeNum >= this.latestTimestamp) {
              this.latestTimestamp = timeNum;
              this.handleIncomingUpdate(incomingState);
            }
          } catch (err) {
            console.warn('Storage sync parse error:', err);
          }
        }
      });
    }
  }

  public getInstanceId(): string {
    return this.instanceId;
  }

  public getLatestState(): SyncedAppState | null {
    if (typeof window === 'undefined') return this.latestStateCache;
    try {
      const shipmentsRaw = localStorage.getItem('bosta_shipments');
      const walletRaw = localStorage.getItem('bosta_wallet');
      const usersRaw = localStorage.getItem('bosta_users');
      const couriersRaw = localStorage.getItem('bosta_couriers');
      const hubsRaw = localStorage.getItem('bosta_hubs');
      const governoratesRaw = localStorage.getItem('bosta_governorates');
      const notificationsRaw = localStorage.getItem('bosta_courier_notifications');
      const txnsRaw = localStorage.getItem('bosta_company_txns');

      return {
        shipments: shipmentsRaw ? sanitizeShipments(JSON.parse(shipmentsRaw)) : this.latestStateCache?.shipments,
        wallet: walletRaw ? sanitizeWallet(JSON.parse(walletRaw)) : this.latestStateCache?.wallet,
        users: usersRaw ? sanitizeUsers(JSON.parse(usersRaw)) : this.latestStateCache?.users,
        couriers: couriersRaw ? sanitizeCouriers(JSON.parse(couriersRaw)) : this.latestStateCache?.couriers,
        hubs: hubsRaw ? JSON.parse(hubsRaw) : this.latestStateCache?.hubs,
        governorates: governoratesRaw ? JSON.parse(governoratesRaw) : this.latestStateCache?.governorates,
        notifications: notificationsRaw ? JSON.parse(notificationsRaw) : this.latestStateCache?.notifications,
        companyTransactions: txnsRaw ? sanitizeCompanyTxns(JSON.parse(txnsRaw)) : this.latestStateCache?.companyTransactions,
        timestamp: this.latestTimestamp || Date.now(),
        senderId: this.instanceId,
      };
    } catch (e) {
      return this.latestStateCache;
    }
  }

  private isInitialized = false;
  private sseSource: EventSource | null = null;

  private initSseStream() {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;
    if (this.sseSource) {
      try { this.sseSource.close(); } catch (e) {}
    }

    try {
      this.sseSource = new EventSource('/api/sync/sse');
      this.sseSource.onmessage = (event) => {
        if (!event.data) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.state) {
            const remoteTime = Number(data.timestamp) || Date.now();
            if (data.senderId !== this.instanceId) {
              this.handleIncomingUpdate({
                ...data.state,
                timestamp: remoteTime,
                senderId: data.senderId || 'sse_realtime',
              });
            }
          }
        } catch (e) {
          console.warn('SSE payload parse error:', e);
        }
      };

      this.sseSource.onerror = () => {
        if (this.sseSource) {
          try { this.sseSource.close(); } catch (e) {}
          this.sseSource = null;
        }
        // Auto reconnect after 3s
        setTimeout(() => this.initSseStream(), 3000);
      };
    } catch (e) {
      console.warn('Failed to connect to SSE stream:', e);
    }
  }

  private async fetchPersistedStateFromServer() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/sync/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.state) {
        const remoteTime = Number(data.timestamp) || Date.now();

        // Authoritative server state applied to client
        this.handleIncomingUpdate({
          ...data.state,
          timestamp: remoteTime,
          senderId: 'server_authoritative_sync',
        });
      }
    } catch (e) {
      // Network/Server offline, silently continue
    } finally {
      this.isInitialized = true;
    }
  }

  private async postStateToServer(state: SyncedAppState, timestamp: number, isExplicitClear = false) {
    try {
      await fetch('/api/sync/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state,
          timestamp,
          senderId: this.instanceId,
          isExplicitClear,
        }),
      });
    } catch (e) {
      console.warn('Error posting state to server:', e);
    }
  }

  public subscribe(callback: SyncCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleIncomingUpdate(data: SyncedAppState) {
    if (this.isProcessingIncoming) return;

    // Sanitize state entities to purge dummy accounts and mock data
    if (data.shipments) {
      const sanitizedIncoming = sanitizeShipments(data.shipments);
      const currentList = this.latestStateCache?.shipments || [];
      // Merge intelligently with rollback prevention
      let mergedShipments = mergeShipmentsLists(currentList, sanitizedIncoming);

      // Enforce persistent local locks
      mergedShipments = mergedShipments.map((s: Shipment) => {
        const id = s.id || s.trackingNumber;
        const lock = this.localStatusLocks.get(id);
        if (lock && Date.now() - lock.timestamp < 900000) {
          if (s.status !== lock.status) {
            return lock.fullShipment ? { ...s, ...lock.fullShipment, status: lock.status } : { ...s, status: lock.status as any };
          }
        }
        return s;
      });
      data.shipments = mergedShipments;
    }
    if (data.users) data.users = sanitizeUsers(data.users);
    if (data.couriers) data.couriers = sanitizeCouriers(data.couriers);
    if (data.wallet) data.wallet = sanitizeWallet(data.wallet);
    if (data.companyTransactions) data.companyTransactions = sanitizeCompanyTxns(data.companyTransactions);

    const incomingTime = data.timestamp || Date.now();

    this.isProcessingIncoming = true;
    this.latestTimestamp = Math.max(this.latestTimestamp, incomingTime);

    if (typeof window !== 'undefined' && incomingTime > 0) {
      try {
        localStorage.setItem('bosta_last_updated', String(incomingTime));
        if (data.shipments && Array.isArray(data.shipments)) {
          localStorage.setItem('bosta_shipments', JSON.stringify(data.shipments));
        }
        if (data.wallet) localStorage.setItem('bosta_wallet', JSON.stringify(data.wallet));
        if (data.users && Array.isArray(data.users)) {
          localStorage.setItem('bosta_users', JSON.stringify(data.users));
        }
        if (data.couriers) localStorage.setItem('bosta_couriers', JSON.stringify(data.couriers));
        if (data.hubs) localStorage.setItem('bosta_hubs', JSON.stringify(data.hubs));
        if (data.governorates) localStorage.setItem('bosta_governorates', JSON.stringify(data.governorates));
        if (data.notifications) localStorage.setItem('bosta_courier_notifications', JSON.stringify(data.notifications));
        if (data.companyTransactions) localStorage.setItem('bosta_company_txns', JSON.stringify(data.companyTransactions));
      } catch (e) {}
    }

    if (data.shipments !== undefined || data.users !== undefined || data.couriers !== undefined || data.wallet !== undefined || data.hubs !== undefined || data.governorates !== undefined || data.notifications !== undefined || data.companyTransactions !== undefined) {
      this.latestStateCache = { ...this.latestStateCache, ...data };
    }

    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });

    setTimeout(() => {
      this.isProcessingIncoming = false;
    }, 50);
  }

  public requestStateSync() {
    if (this.realtimeChannel && isSupabaseConfigured) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'request_state_sync',
          payload: { senderId: this.instanceId },
        });
      } catch (e) {
        console.warn('Request state sync failed:', e);
      }
    }
  }

  private async fetchPersistedStateFromSupabase() {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('bosta_app_state')
        .select('state')
        .eq('id', 'global_state')
        .maybeSingle();

      if (!error && data?.state) {
        if (data.state.senderId !== this.instanceId) {
          this.handleIncomingUpdate(data.state);
        }
      }

      // Also sync profiles table rows
      const { data: pRows } = await supabase.from('profiles').select('*');
      if (pRows && Array.isArray(pRows) && pRows.length > 0) {
        const mappedUsers: UserSession[] = pRows
          .filter((p: any) => p && !isDeprecatedDummyUser(p))
          .map((p: any) => ({
            id: String(p.id),
            name: p.name || 'مستخدم',
            email: p.email || (p.phone ? `${p.phone}@am-shipping.eg` : `${p.id}@am-shipping.eg`),
            phone: p.phone ? String(p.phone) : '',
            role: p.role || 'merchant',
            storeName: p.store_name || undefined,
            isConfirmed: p.is_confirmed !== undefined ? Boolean(p.is_confirmed) : true,
            registeredAt: p.created_at || new Date().toISOString(),
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'مستخدم')}&background=dc2626&color=ffffff`
          }));

        const currentUsers = this.getLatestState()?.users || [];
        const merged = sanitizeUsers([...currentUsers, ...mappedUsers]);
        this.handleIncomingUpdate({ users: merged, senderId: 'supabase_profiles_pull' });
      }
    } catch (e) {
      // Table may not exist yet in Supabase project, ignore
    }
  }

  public broadcastState(state: SyncedAppState) {
    const now = Date.now();
    this.latestTimestamp = now;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bosta_last_updated', String(now));
      } catch (e) {}
    }

    let payloadShipments = state.shipments;
    if (payloadShipments && Array.isArray(payloadShipments)) {
      payloadShipments = sanitizeShipments(payloadShipments).map((s: Shipment) => {
        const id = s.id || s.trackingNumber;
        const lock = this.localStatusLocks.get(id);
        if (lock && Date.now() - lock.timestamp < 900000) {
          return lock.fullShipment ? { ...s, ...lock.fullShipment, status: lock.status } : { ...s, status: lock.status as any };
        }
        return s;
      });
    }

    const payload: SyncedAppState = {
      ...state,
      shipments: payloadShipments,
      senderId: this.instanceId,
      timestamp: now,
    };

    this.latestStateCache = payload;

    // 1. Post state to Server-Side API for multi-device sync
    this.postStateToServer(payload, now);

    // 2. Broadcast to local tabs/windows
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(payload);
      } catch (e) {
        console.warn('Local BroadcastChannel send failed:', e);
      }
    }

    // 3. Broadcast to all connected devices via Supabase Realtime
    if (this.realtimeChannel && isSupabaseConfigured) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'app_state_change',
          payload,
        });
      } catch (e) {
        console.warn('Supabase Realtime send failed:', e);
      }
    }

    // 4. Always persist to Supabase DB tables asynchronously if Supabase is configured
    if (isSupabaseConfigured) {
      (async () => {
        try {
          // 1. Sync full state
          await supabase
            .from('bosta_app_state')
            .upsert({ id: 'global_state', state: payload, updated_at: new Date().toISOString() });

          // 2. Sync shipments table
          if (Array.isArray(payload.shipments)) {
            if (payload.shipments.length === 0) {
              try {
                await supabase.from('shipments').delete().neq('id', '___none___');
              } catch (err) {}
            } else {
              const mappedShipments = payload.shipments.map((s: any) => ({
                id: String(s.id || s.trackingNumber),
                tracking_number: String(s.trackingNumber || s.id || ''),
                code: String(s.code || s.trackingNumber || s.id || ''),
                status: String(s.status || 'created'),
                customer_name: String(s.recipient?.name || s.customerName || ''),
                customer_phone: String(s.recipient?.phone || s.customerPhone || ''),
                governorate: String(s.recipient?.governorate || s.governorate || ''),
                city: String(s.recipient?.city || s.city || ''),
                address: String(s.recipient?.streetAddress || s.address || ''),
                cod_amount: Number(s.financials?.codAmount || s.codAmount || 0),
                shipping_fee: Number(s.financials?.shippingFee || s.shippingFee || 0),
                net_payout: Number(s.financials?.netPayout || s.netPayout || 0),
                sender_name: String(s.sender?.storeName || s.sender?.contactName || s.senderName || ''),
                courier_name: String(s.courier?.name || s.courierName || ''),
                notes: String(s.recipient?.notes || s.notes || ''),
                data: s,
                created_at: s.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }));
              try {
                await supabase.from('shipments').upsert(mappedShipments, { onConflict: 'id' });
              } catch (err) {}
            }
          }

          // 3. Sync user profiles to 'profiles' table
          if (Array.isArray(payload.users) && payload.users.length > 0) {
            const mappedProfiles = payload.users.map((u: any) => ({
              id: String(u.id),
              name: String(u.name || ''),
              email: u.email || null,
              phone: String(u.phone || ''),
              role: String(u.role || 'merchant'),
              store_name: u.storeName || null,
              is_confirmed: u.isConfirmed !== undefined ? Boolean(u.isConfirmed) : true,
              created_at: u.registeredAt || new Date().toISOString()
            }));
            try {
              await supabase.from('profiles').upsert(mappedProfiles, { onConflict: 'id' });
            } catch (err) {}
          }

          // 4. Sync couriers
          if (Array.isArray(payload.couriers) && payload.couriers.length > 0) {
            const mappedCouriers = payload.couriers.map((c: any) => ({
              id: String(c.id),
              name: String(c.name || 'مندوب'),
              phone: String(c.phone || ''),
              vehicle: String(c.vehicle || 'motorcycle'),
              assigned_hub: String(c.assignedHub || ''),
              status: 'active',
              created_at: new Date().toISOString()
            }));
            try {
              await supabase.from('couriers').upsert(mappedCouriers, { onConflict: 'id' });
            } catch (err) {}
          }
        } catch (e) {
          // Ignore DB upsert errors
        }
      })();
    }
  }

  public async forceSyncWithSupabase(clientState?: any): Promise<{ success: boolean; message: string; timestamp?: number }> {
    try {
      const stateToSync = clientState || this.latestStateCache;
      
      // 1. Post to Server Endpoint
      const res = await fetch('/api/supabase/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateToSync })
      });
      const data = await res.json();
      
      // 2. Direct Client-side push to Supabase as backup & immediate reflection
      if (isSupabaseConfigured && stateToSync) {
        try {
          await supabase
            .from('bosta_app_state')
            .upsert({ id: 'global_state', state: stateToSync, updated_at: new Date().toISOString() });

          if (Array.isArray(stateToSync.shipments) && stateToSync.shipments.length > 0) {
            const mappedShipments = stateToSync.shipments.map((s: any) => ({
              id: String(s.id || s.trackingNumber),
              tracking_number: String(s.trackingNumber || s.id || ''),
              code: String(s.code || s.trackingNumber || s.id || ''),
              status: String(s.status || 'created'),
              customer_name: String(s.recipient?.name || s.customerName || ''),
              customer_phone: String(s.recipient?.phone || s.customerPhone || ''),
              governorate: String(s.recipient?.governorate || s.governorate || ''),
              city: String(s.recipient?.city || s.city || ''),
              address: String(s.recipient?.streetAddress || s.address || ''),
              cod_amount: Number(s.financials?.codAmount || s.codAmount || 0),
              shipping_fee: Number(s.financials?.shippingFee || s.shippingFee || 0),
              net_payout: Number(s.financials?.netPayout || s.netPayout || 0),
              sender_name: String(s.sender?.storeName || s.sender?.contactName || s.senderName || ''),
              courier_name: String(s.courier?.name || s.courierName || ''),
              notes: String(s.recipient?.notes || s.notes || ''),
              data: s,
              created_at: s.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            for (let i = 0; i < mappedShipments.length; i += 50) {
              const batch = mappedShipments.slice(i, i + 50);
              await supabase.from('shipments').upsert(batch, { onConflict: 'id' });
            }
          }
        } catch (e) {
          console.warn('Client-side direct Supabase sync warning:', e);
        }
      }

      await this.fetchPersistedStateFromServer();
      return { success: true, message: data.message || `تمت مزامنة ${stateToSync?.shipments?.length || 0} شحنة إلى Supabase بنجاح!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'فشلت المزامنة مع الخادم' };
    }
  }
}

export const syncEngine = new SyncEngine();

