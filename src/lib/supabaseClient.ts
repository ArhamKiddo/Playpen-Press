import { createClient } from "@supabase/supabase-js";

// Fetch the variables from Vite environment variables (will look in process.env or .env secrets)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

// Verify configuration status
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Safely construct the client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
