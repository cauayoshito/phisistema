import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

declare global {
  // eslint-disable-next-line no-var
  var __phi_supabase_client__: SupabaseClient<Database> | undefined;
}

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? globalThis.__phi_supabase_client__ ??
    createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'phi-auth',
      },
    })
  : null;

if (supabase) {
  globalThis.__phi_supabase_client__ = supabase;
}

export { isSupabaseConfigured };
