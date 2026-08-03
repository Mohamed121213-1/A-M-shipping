import { supabase, isSupabaseConfigured } from './supabase';
import { Shipment, MerchantWallet, UserSession, CourierInfo, HubInfo, GovernorateRate } from '../types';

export interface SyncedAppState {
  shipments?: Shipment[];
  wallet?: MerchantWallet;
  users?: UserSession[];
  couriers?: CourierInfo[];
  hubs?: HubInfo[];
  governorates?: GovernorateRate[];
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
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('⚡ Connected to Global Cross-Device Sync Service');
            }
          });
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

  public broadcastState(state: SyncedAppState) {
    if (this.isProcessingIncoming) return;

    const payload: SyncedAppState = {
      ...state,
      senderId: this.instanceId,
      timestamp: Date.now(),
    };

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
  }
}

export const syncEngine = new SyncEngine();
