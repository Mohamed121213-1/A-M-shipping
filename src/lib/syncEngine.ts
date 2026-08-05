import { supabase, isSupabaseConfigured } from './supabase';
import { Shipment, MerchantWallet, UserSession, CourierInfo, HubInfo, GovernorateRate, CourierNotification } from '../types';

export interface SyncedAppState {
  shipments?: Shipment[];
  wallet?: MerchantWallet;
  users?: UserSession[];
  couriers?: CourierInfo[];
  hubs?: HubInfo[];
  governorates?: GovernorateRate[];
  notifications?: CourierNotification[];
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

    // 2. Initialize Supabase Realtime Broadcast Channel for cross-device & cross-account syncing
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
              // Request current state from other active sessions
              this.requestStateSync();
            }
          });

        // Try initial fetch from Supabase database table if available
        this.fetchPersistedStateFromSupabase();

        // Periodically poll Supabase DB every 3 seconds to guarantee updates reach Admin
        setInterval(() => {
          this.fetchPersistedStateFromSupabase();
        }, 3000);
      } catch (err) {
        console.warn('Supabase Realtime Channel error:', err);
      }
    }

    // 3. Fallback Storage event listener for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('bosta_')) {
          const storedTime = localStorage.getItem('bosta_last_updated');
          const timeNum = storedTime ? Number(storedTime) : Date.now();
          if (timeNum > this.latestTimestamp) {
            this.latestTimestamp = timeNum;
          }
        }
      });
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

    // Filter out old mock shipments if present in incoming state payload
    if (data.shipments && Array.isArray(data.shipments)) {
      const mockIds = new Set(['BST-804101', 'BST-804102', 'BST-804103', 'BST-804104', 'BST-804105', 'BST-804106']);
      data.shipments = data.shipments.filter((s) => s && !mockIds.has(s.id) && !mockIds.has(s.trackingNumber));
    }

    const incomingTime = data.timestamp || 0;
    const isFromOtherSender = Boolean(data.senderId && data.senderId !== this.instanceId);

    // If it's from our own instance and not strictly newer, ignore
    if (!isFromOtherSender && incomingTime > 0 && incomingTime <= this.latestTimestamp) {
      return;
    }

    this.isProcessingIncoming = true;

    if (incomingTime > this.latestTimestamp) {
      this.latestTimestamp = incomingTime;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bosta_last_updated', String(incomingTime));
        } catch (e) {}
      }
    }

    if (data.shipments || data.users || data.couriers || data.wallet || data.hubs || data.governorates || data.notifications) {
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
        // Apply state if remote is newer or from another session
        if (remoteTime > this.latestTimestamp || (data.state.senderId && data.state.senderId !== this.instanceId)) {
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

    // 1. Broadcast to local tabs/windows
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

