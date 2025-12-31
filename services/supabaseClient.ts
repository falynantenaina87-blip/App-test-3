import { createClient } from '@supabase/supabase-js';

// Cast import.meta to any to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
// Provide fallbacks to prevent crash during initialization if variables are missing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if ((import.meta as any).env.VITE_SUPABASE_URL === undefined) {
  console.error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment variables. Using placeholder values.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);