import { createClient } from '@supabase/supabase-js';

// Canonical Cendrix Capital Supabase project keys
const DEFAULT_SUPABASE_URL = 'https://isjdvpmiipqxyhrhgqke.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzamR2cG1paXBxeHlocmhncWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NjQ5MzAsImV4cCI6MjEwNDE0MDkzMH0.wRWN4M04ZQAkgCL5Y3xqBVI3oJWYeDbggN1DdaEQu-M';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'https://your-project-ref.supabase.co' &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('lmmbjwvytqdcxifgjwsi') // Dead endpoint without migrated schema
);

export const supabase = createClient(rawUrl, rawKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

