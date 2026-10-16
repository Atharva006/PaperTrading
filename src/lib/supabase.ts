import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'https://your-project-ref.supabase.co' &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('lmmbjwvytqdcxifgjwsi') // Dead endpoint without migrated schema
);

// Fallback to safely prevent "Uncaught Error: supabaseUrl is required" in Vercel or local preview without env vars
const safeUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-instance.supabase.co';
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
