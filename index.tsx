import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const App = React.lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("No root element");

const root = ReactDOM.createRoot(rootElement);

// Connexion stricte : Si pas d'URL, l'app ne démarre pas (écran blanc ou erreur console)
const convexUrl = (import.meta as any).env.VITE_CONVEX_URL;

if (!convexUrl) {
    console.error("ERREUR CRITIQUE: VITE_CONVEX_URL est manquant.");
}

const convex = new ConvexReactClient(convexUrl as string);

root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
       <Suspense fallback={
          <div className="fixed inset-0 bg-[#020204] flex items-center justify-center">
             <div className="text-blue-500 font-serif italic">Chargement du système...</div>
          </div>
       }>
          <App />
       </Suspense>
    </ConvexProvider>
  </React.StrictMode>
);