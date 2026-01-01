import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (si en local)
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Permet d'utiliser process.env.API_KEY dans le code client
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    }
  };
});