import { createClient } from '@supabase/supabase-js';
import { AppUserRole, UserSession } from '../types';

const DEFAULT_SUPABASE_URL = 'https://mnovqngjipmqniipwnif.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ub3ZxbmdqaXBtcW5paXB3bmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODExODksImV4cCI6MjEwMDc1NzE4OX0.LZXvJlJ5XeAIpfLKBp74_Vxq9heBWCgHs4QcnbpO2wE';

const env = (import.meta as any).env || {};

function resolveValidUrl(urlCandidate: any, fallback: string): string {
  if (typeof urlCandidate === 'string') {
    const trimmed = urlCandidate.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
  }
  return fallback;
}

function resolveValidKey(keyCandidate: any, fallback: string): string {
  if (typeof keyCandidate === 'string' && keyCandidate.trim().length > 10) {
    return keyCandidate.trim();
  }
  return fallback;
}

const rawUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const rawKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const supabaseUrl = resolveValidUrl(rawUrl, DEFAULT_SUPABASE_URL);
const supabaseAnonKey = resolveValidKey(rawKey, DEFAULT_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') 
);

// Create Supabase Client instance with strictly valid HTTPS URL
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Map Supabase User to App UserSession
export function mapSupabaseUserToSession(user: any, fallbackRole: AppUserRole = 'merchant'): UserSession {
  const metadata = user.user_metadata || {};
  const email = (user.email || '').toLowerCase();

  // Admin emails list
  const ADMIN_EMAILS = ['admin@am-shipping.eg', 'mohamedsalah565657@icloud.com'];
  const isAdminEmail = ADMIN_EMAILS.includes(email);

  const name = metadata.name || metadata.full_name || (isAdminEmail && email.includes('mohamedsalah') ? 'محمد صلاح (أدمن)' : email.split('@')[0]) || 'مستخدم Supabase';
  const role: AppUserRole = isAdminEmail ? 'admin' : (metadata.role || fallbackRole);

  return {
    id: user.id,
    name,
    email: user.email || email,
    phone: metadata.phone || user.phone || '01000000000',
    role,
    avatarUrl: metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=ffffff`,
    storeName: metadata.storeName || (role === 'merchant' ? `متجر ${name}` : undefined),
    courierVehicle: metadata.courierVehicle || (role === 'courier' ? 'سيارة نقل' : undefined),
    hubName: metadata.hubName || (role === 'hub_manager' ? 'المستودع الرئيسي' : undefined),
    isConfirmed: isAdminEmail ? true : (metadata.isConfirmed !== undefined ? Boolean(metadata.isConfirmed) : true),
  };
}
