import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Error Boundary Component pour attraper les crashs
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', 
          color: '#EF4444', 
          backgroundColor: '#020204', 
          height: '100vh',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Une erreur est survenue</h1>
          <div style={{
            backgroundColor: '#18181b',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #3f3f46',
            color: '#e5e5e5',
            fontFamily: 'monospace',
            maxWidth: '90%',
            overflow: 'auto'
          }}>
            {this.state.error?.toString() || "Erreur inconnue"}
          </div>
          <p style={{marginTop: '2rem', color: '#6B7280'}}>Essayez de rafraîchir la page ou relancez 'npm run dev'.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Sécurité : On vérifie si l'URL Convex est présente
const convexUrl = (import.meta as any).env.VITE_CONVEX_URL;

if (!convexUrl) {
  // Mode Aide : Si pas d'URL
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
        Le lien avec le serveur n'est pas établi.
      </p>
      <div style={{ 
        marginTop: '30px', 
        backgroundColor: '#18181b', 
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid #3f3f46',
        textAlign: 'left' 
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3B82F6' }}>Pour corriger :</p>
        <ol style={{ paddingLeft: '20px', color: '#D1D5DB', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '8px' }}>Arrêtez le terminal actuel (Ctrl+C).</li>
          <li style={{ marginBottom: '8px' }}>Tapez <code>npx convex login</code> (cliquez sur le lien).</li>
          <li style={{ marginBottom: '8px' }}>Tapez <code>npx convex dev</code>.</li>
          <li>Relancez <code>npm run dev</code>.</li>
        </ol>
      </div>
    </div>
  );
} else {
  // Mode Normal
  const convex = new ConvexReactClient(convexUrl as string);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}