import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { CloudLightning, AlertTriangle } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Sécurité : On vérifie si l'URL Convex est présente
const convexUrl = (import.meta as any).env.VITE_CONVEX_URL;

if (!convexUrl) {
  // Si l'URL manque, on affiche un écran d'aide joli au lieu de planter
  root.render(
    <div style={{
      height: '100vh',
      backgroundColor: '#020204',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ color: '#F59E0B', marginBottom: '20px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Connexion Convex manquante</h1>
      <p style={{ color: '#9CA3AF', maxWidth: '400px', lineHeight: '1.5' }}>
        L'application ne trouve pas son serveur.
      </p>
      <div style={{ 
        marginTop: '30px', 
        backgroundColor: '#18181b', 
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid #3f3f46',
        textAlign: 'left' 
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3B82F6' }}>Solution :</p>
        <ol style={{ paddingLeft: '20px', color: '#D1D5DB', listStyleType: 'decimal', space: 'y-2' }}>
          <li style={{ marginBottom: '8px' }}>Assurez-vous que <code>npx convex dev</code> tourne dans un terminal.</li>
          <li style={{ marginBottom: '8px' }}>Coupez le terminal où tourne <code>npm run dev</code> (Ctrl+C).</li>
          <li>Relancez <code>npm run dev</code>.</li>
        </ol>
      </div>
    </div>
  );
} else {
  // Si l'URL est là, on lance l'app normalement
  const convex = new ConvexReactClient(convexUrl as string);
  
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </React.StrictMode>
  );
}