import { createClient } from '@supabase/supabase-js';

// Cast import.meta to any to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);