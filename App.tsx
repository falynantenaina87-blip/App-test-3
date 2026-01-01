import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Announcements from './components/Announcements';
import Quiz from './components/Quiz';
import { db } from './services/databaseService';
import { supabase } from './services/supabaseClient';
import { User } from './types';
import { MessageSquare, Bell, BookOpen, LogOut, BarChart2, AlertTriangle, Settings } from 'lucide-react';

type View = 'CHAT' | 'ANNOUNCEMENTS' | 'QUIZ' | 'DASHBOARD';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('CHAT');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  // États pour la configuration manuelle en cas d'erreur
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');

  useEffect(() => {
    const initApp = async () => {
      try {
        // Ajout d'un timeout de 5 secondes pour éviter le chargement infini
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Délai d'attente dépassé (Timeout)")), 5000)
        );

        const sessionCheckPromise = db.getCurrentUser();
        
        // On attend soit la réponse de Supabase, soit le timeout
        const u = await Promise.race([sessionCheckPromise, timeoutPromise]) as User | null;
        
        setUser(u);
      } catch (err: any) {
        console.error("Initialization error:", err);
        // On affiche une erreur explicite si la connexion échoue
        setInitError("Impossible de connecter à Supabase. Les clés API semblent manquantes ou incorrectes.");
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // Listen for auth changes (Login/Logout anywhere)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
         // On recharge le profil complet lors du sign-in
         try {
           const u = await db.getCurrentUser();
           setUser(u);
         } catch(e) { console.error(e); }
      } else if (event === 'SIGNED_OUT') {
         setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    db.logout();
  };

  const saveConfig = () => {
    if (manualUrl && manualKey) {
        localStorage.setItem('VITE_SUPABASE_URL', manualUrl);
        localStorage.setItem('VITE_SUPABASE_ANON_KEY', manualKey);
        window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-mandarin-black flex flex-col items-center justify-center text-white gap-4">
        <div className="w-8 h-8 border-4 border-mandarin-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse text-sm">Connexion au serveur...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-mandarin-black flex flex-col items-center justify-center text-mandarin-red p-6 text-center overflow-auto">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Erreur de Configuration</h2>
        <p className="text-gray-400 max-w-md text-sm mb-6">{initError}</p>
        
        <div className="bg-mandarin-surface border border-mandarin-border p-6 rounded-xl w-full max-w-md text-left">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Settings size={18} />
                Configuration Manuelle
            </h3>
            <p className="text-xs text-gray-500 mb-4">
                Si vous n'avez pas accès aux variables d'environnement (ex: Vercel), entrez vos clés Supabase ici. Elles seront sauvegardées dans ce navigateur.
            </p>
            
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Project URL</label>
                    <input 
                        type="text" 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-black border border-mandarin-border rounded p-2 text-white text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Anon Key (Public)</label>
                    <input 
                        type="text" 
                        value={manualKey}
                        onChange={(e) => setManualKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-black border border-mandarin-border rounded p-2 text-white text-sm"
                    />
                </div>
                <button 
                    onClick={saveConfig}
                    disabled={!manualUrl || !manualKey}
                    className="w-full bg-mandarin-blue text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm mt-2"
                >
                    Sauvegarder et Reconnecter
                </button>
            </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="mt-8 text-gray-500 underline text-sm hover:text-white"
        >
          Réessayer sans changer la config
        </button>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'CHAT': return <Chat currentUser={user} />;
      case 'ANNOUNCEMENTS': return <Announcements currentUser={user} />;
      case 'QUIZ': return <Quiz currentUser={user} />;
      case 'DASHBOARD': return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
            <BarChart2 size={64} className="mb-4 text-gray-700"/>
            <h2 className="text-xl text-white mb-2">Statistiques (Bientôt)</h2>
            <p>Le module de suivi de progression sera disponible après le premier partiel.</p>
        </div>
      );
      default: return <Chat currentUser={user} />;
    }
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-mandarin-black overflow-hidden font-sans">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="h-16 bg-mandarin-surface border-t border-mandarin-border flex justify-around items-center px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavButton 
            active={currentView === 'CHAT'} 
            onClick={() => setCurrentView('CHAT')} 
            icon={<MessageSquare size={20} />} 
            label="Chat"
            activeColor="text-mandarin-blue"
          />
          <NavButton 
            active={currentView === 'ANNOUNCEMENTS'} 
            onClick={() => setCurrentView('ANNOUNCEMENTS')} 
            icon={<Bell size={20} />} 
            label="Infos"
            activeColor="text-mandarin-red"
          />
          <NavButton 
            active={currentView === 'QUIZ'} 
            onClick={() => setCurrentView('QUIZ')} 
            icon={<BookOpen size={20} />} 
            label="Quiz"
            activeColor="text-mandarin-yellow"
          />
          <div className="w-[1px] h-8 bg-gray-800 mx-1"></div>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[10px] mt-1 font-medium">Sortir</span>
          </button>
        </nav>
      </div>
    </HashRouter>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeColor: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, activeColor }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 w-16 transition-all duration-300 ${active ? `${activeColor} scale-110` : 'text-gray-500 hover:text-gray-300'}`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
    {active && <span className={`w-1 h-1 rounded-full mt-1 bg-current`}></span>}
  </button>
);

export default App;