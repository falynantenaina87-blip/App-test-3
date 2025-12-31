import { createClient } from '@supabase/supabase-js';

// Fonction utilitaire pour récupérer les variables d'environnement de manière sécurisée
// Compatible avec Vite (import.meta.env) et les environnements classiques (process.env)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Si les clés sont manquantes, on utilise des valeurs fictives pour ne pas bloquer le chargement du script.
// Les appels API échoueront gracieusement (ou via timeout) au lieu de causer une page blanche.
const safeUrl = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder-project.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

if (safeKey === 'placeholder-key') {
  console.warn("Supabase Warning: Variables d'environnement manquantes. L'authentification ne fonctionnera pas.");
}

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});