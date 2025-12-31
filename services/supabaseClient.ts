import { createClient } from '@supabase/supabase-js';

// Cast import.meta to any to resolve TypeScript error
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR CRITIQUE : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont manquants. Vérifiez vos variables d'environnement sur Vercel.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');