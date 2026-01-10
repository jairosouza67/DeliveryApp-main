import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function normalizeSupabaseUrl(raw: string | undefined) {
  if (!raw) return raw;
  const value = raw.trim();
  if (!value) return value;

  // Already a full URL
  if (/^https?:\/\//i.test(value)) return value;

  // Accept "<project-ref>.supabase.co" (missing protocol)
  if (/^[a-z0-9-]+\.supabase\.co$/i.test(value)) return `https://${value}`;

  // Accept "<project-ref>" (common mistake)
  if (/^[a-z0-9-]+$/i.test(value)) return `https://${value}.supabase.co`;

  return value;
}

const SUPABASE_URL_RAW = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_URL = normalizeSupabaseUrl(SUPABASE_URL_RAW);
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Supabase Client: Initializing with URL:', SUPABASE_URL);
console.log('Supabase Client: Key present:', !!SUPABASE_PUBLISHABLE_KEY);

if (SUPABASE_URL_RAW && SUPABASE_URL && SUPABASE_URL !== SUPABASE_URL_RAW) {
  console.warn('Supabase Client: Normalized VITE_SUPABASE_URL (adicione https://... na sua .env para evitar este aviso).');
}

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Supabase Client: Missing configuration! Check environment variables.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
