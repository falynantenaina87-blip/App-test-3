import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// L'URL sera automatiquement remplie par Vite lors du 'npx convex dev'
// ou via les variables d'environnement VITE_CONVEX_URL
// Fix: Cast import.meta to any to resolve TypeScript error regarding missing 'env' property
const convex = new ConvexReactClient((import.meta as any).env.VITE_CONVEX_URL as string);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);