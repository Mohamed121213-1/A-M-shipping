import { supabase, isSupabaseConfigured } from './supabase';
import { Shipment, MerchantWallet, UserSession, CourierInfo, HubInfo, GovernorateRate, CourierNotification, CompanyTransaction } from '../types';
import { sanitizeUsers, sanitizeCouriers, sanitizeCompanyTxns, sanitizeShipments, sanitizeWallet } from '../utils/sanitizeData';

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

  constructor() {
    // 0. Initialize latest timestamp from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedTime = localStorage.getItem('bosta_last_updated');
        if (savedTime) {
          this.latestTimestamp = Number(savedTime) || 0;
        }
      } catch (e) {
        console.warn('Error reading bosta_last_updated:', e);
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
      
      // Poll server state every 2.5 seconds to guarantee multi-device updates
      setInterval(() => {
        this.fetchPersistedStateFromServer();
      }, 2500);

      // Re-check state immediately on window focus or online status change
      window.addEventListener('focus', () => this.fetchPersistedStateFromServer());
      window.addEventListener('online', () => this.fetchPersistedStateFromServer());
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
          .on('broadcast', { event: 'request_state_sync' }, (payload: any) => {
            if (payload?.payload?.senderId !== this.instanceId && this.latestStateCache) {
              this.broadcastState(this.latestStateCache);
            }
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('⚡ Connected to Global Cross-Device Sync Service');
              this.requestStateSync();
            }
          });

        this.fetchPersistedStateFromSupabase();
        setInterval(() => {
          this.fetchPersistedStateFromSupabase();
        }, 3000);
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
              this.latestStateCache = { ...this.latestStateCache, ...incomingState };
              this.listeners.forEach((cb) => cb(incomingState));
            }
          } catch (err) {
            console.warn('Storage sync parse error:', err);
          }
        }
      });
    }
  }

  private isInitialized = false;

  private async fetchPersistedStateFromServer() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/sync/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.state && data.timestamp) {
        const remoteTime = Number(data.timestamp) || 0;

        // Check if local storage currently has no shipments
        const localShipmentsRaw = localStorage.getItem('bosta_shipments');
        const localShipments = localShipmentsRaw ? JSON.parse(localShipmentsRaw) : [];
        const isLocalEmpty = !Array.isArray(localShipments) || localShipments.length === 0;

        // If local is empty OR remoteTime >= latestTimestamp, adopt server state!
        if (remoteTime > this.latestTimestamp || isLocalEmpty) {
          this.handleIncomingUpdate({
            ...data.state,
            timestamp: remoteTime || Date.now(),
            senderId: 'server_initial_sync',
          });
        } else if (this.latestTimestamp > remoteTime && this.latestStateCache) {
          // Local client has newer state than server, push to server
          this.postStateToServer(this.latestStateCache, this.latestTimestamp);
        }
      } else if (data && !data.state && this.latestStateCache) {
        // Server empty, push client state
        this.postStateToServer(this.latestStateCache, this.latestTimestamp);
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
    if (data.shipments) data.shipments = sanitizeShipments(data.shipments);
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
        if (data.shipments && Array.isArray(data.shipments) && data.shipments.length > 0) {
          localStorage.setItem('bosta_shipments', JSON.stringify(data.shipments));
        }
        if (data.wallet) localStorage.setItem('bosta_wallet', JSON.stringify(data.wallet));
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          localStorage.setItem('bosta_users', JSON.stringify(data.users));
        }
        if (data.couriers) localStorage.setItem('bosta_couriers', JSON.stringify(data.couriers));
        if (data.hubs) localStorage.setItem('bosta_hubs', JSON.stringify(data.hubs));
        if (data.governorates) localStorage.setItem('bosta_governorates', JSON.stringify(data.governorates));
        if (data.notifications) localStorage.setItem('bosta_courier_notifications', JSON.stringify(data.notifications));
        if (data.companyTransactions) localStorage.setItem('bosta_company_txns', JSON.stringify(data.companyTransactions));
      } catch (e) {}
    }

    if (data.shipments || data.users || data.couriers || data.wallet || data.hubs || data.governorates || data.notifications || data.companyTransactions) {
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
        const remoteTime = data.state.timestamp || 0;
        // CRITICAL FIX: Apply state ONLY if remote timestamp is strictly newer than our local timestamp!
        if (remoteTime > this.latestTimestamp && data.state.senderId !== this.instanceId) {
          this.handleIncomingUpdate(data.state);
        } else if (this.latestTimestamp > remoteTime && this.latestStateCache) {
          // Local state is NEWER than Supabase DB! Push local state to Supabase.
          await supabase
            .from('bosta_app_state')
            .upsert({ id: 'global_state', state: this.latestStateCache, updated_at: new Date().toISOString() });
        }
      } else if (!error && !data && this.latestStateCache) {
        // First time initialization in Supabase DB
        await supabase
          .from('bosta_app_state')
          .upsert({ id: 'global_state', state: this.latestStateCache, updated_at: new Date().toISOString() });
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

    const payload: SyncedAppState = {
      ...state,
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

    // 2. Broadcast to all connected devices via Supabase Realtime
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

    // 3. Always persist to Supabase DB table asynchronously if Supabase is configured
    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase
            .from('bosta_app_state')
            .upsert({ id: 'global_state', state: payload, updated_at: new Date().toISOString() });
        } catch (e) {
          // Ignore DB upsert errors
        }
      })();
    }
  }
}

export const syncEngine = new SyncEngine();

