import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hard fallback check to see what Vercel is actually reading
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Vercel cannot read your environment variables!");
}

export const supabase = createClient(
  supabaseUrl || 'https://fxigghylrfyshzpbxjuz.supabase.co', 
  supabaseAnonKey || 'sb_publishable_unM4GwnyP6hM758kb--3Xg_PO5LMB6L'
);
