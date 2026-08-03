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

  constructor() {
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
      } catch (err) {
        console.warn('Supabase Realtime Channel error:', err);
      }
    }

    // 3. Fallback Storage event listener for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('bosta_')) {
          this.handleIncomingUpdate({ timestamp: Date.now() });
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
    this.isProcessingIncoming = true;
    if (data.shipments || data.users || data.couriers || data.wallet) {
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
        this.handleIncomingUpdate(data.state);
      }
    } catch (e) {
      // Table may not exist yet in Supabase project, ignore
    }
  }

  public broadcastState(state: SyncedAppState) {
    if (this.isProcessingIncoming) return;

    const payload: SyncedAppState = {
      ...state,
      senderId: this.instanceId,
      timestamp: Date.now(),
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

      // Also persist to Supabase DB table asynchronously if table exists
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

