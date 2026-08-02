import { createClient } from '@supabase/supabase-js';
import { AppUserRole, UserSession } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_SUPABASE')
);

// Create Supabase Client instance (fallback to placeholder if not configured to prevent runtime crash)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

// Map Supabase User to App UserSession
export function mapSupabaseUserToSession(user: any, fallbackRole: AppUserRole = 'merchant'): UserSession {
  const metadata = user.user_metadata || {};
  const email = user.email || '';
  const name = metadata.name || metadata.full_name || email.split('@')[0] || 'مستخدم Supabase';
  const role: AppUserRole = metadata.role || fallbackRole;

  return {
    id: user.id,
    name,
    email,
    phone: metadata.phone || user.phone || '01000000000',
    role,
    avatarUrl: metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=ffffff`,
    storeName: metadata.storeName || (role === 'merchant' ? `متجر ${name}` : undefined),
    courierVehicle: metadata.courierVehicle || (role === 'courier' ? 'سيارة نقل' : undefined),
    hubName: metadata.hubName || (role === 'hub_manager' ? 'المستودع الرئيسي' : undefined),
  };
}
