
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Announcements from './components/Announcements';
import Quiz from './components/Quiz';
import Schedule from './components/Schedule';
import { db } from './services/databaseService';
import { supabase } from './services/supabaseClient';
import { User } from './types';
import { MessageSquare, Bell, BookOpen, LogOut, Calendar, AlertTriangle, Settings, RefreshCw } from 'lucide-react';

type View = 'CHAT' | 'ANNOUNCEMENTS' | 'QUIZ' | 'SCHEDULE';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('CHAT');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');

  const initApp = async () => {
    setIsLoading(true);
    setInitError(null);
    try {
      // Augmentation du timeout à 15s pour les "cold starts" de Supabase (Free Tier)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Délai d'attente dépassé (Connexion lente)")), 15000)
      );
      const sessionCheckPromise = db.getCurrentUser();
      const u = await Promise.race([sessionCheckPromise, timeoutPromise]) as User | null;
      setUser(u);
    } catch (err: any) {
      console.error("Init Error:", err);
      setInitError(err.message || "Impossible de connecter à Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initApp();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
         try { const u = await db.getCurrentUser(); setUser(u); } catch(e) { console.error(e); }
      } else if (event === 'SIGNED_OUT') { setUser(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => db.logout();

  const saveConfig = () => {
    if (manualUrl && manualKey) {
        localStorage.setItem('VITE_SUPABASE_URL', manualUrl);
        localStorage.setItem('VITE_SUPABASE_ANON_KEY', manualKey);
        window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-mandarin-black flex flex-col items-center justify-center text-white gap-6 relative z-20">
        <div className="relative">
             <div className="w-16 h-16 border-4 border-white/10 rounded-full"></div>
             <div className="w-16 h-16 border-4 border-mandarin-blue border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="animate-pulse text-xs tracking-[0.3em] font-bold text-mandarin-blue">CONNEXION...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="h-screen bg-mandarin-black flex flex-col items-center justify-center text-mandarin-red p-6 text-center overflow-auto relative z-20">
        <AlertTriangle size={64} className="mb-6 animate-bounce-slight" />
        <h2 className="text-2xl font-bold mb-2 text-white">Erreur de Connexion</h2>
        <p className="text-gray-400 mb-6 max-w-xs mx-auto">{initError}</p>
        
        <button 
          onClick={initApp}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition mb-8 flex items-center gap-2"
        >
          <RefreshCw size={18} /> Réessayer
        </button>

        <div className="bg-mandarin-surface border border-mandarin-border p-8 rounded-2xl w-full max-w-md text-left shadow-2xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                <Settings size={20} /> Configuration Manuelle
            </h3>
            <p className="text-xs text-gray-500 mb-4">Si le problème persiste, vérifiez les clés API.</p>
            <div className="space-y-4">
                <input type="text" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="Project URL" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-mandarin-blue outline-none" />
                <input type="text" value={manualKey} onChange={(e) => setManualKey(e.target.value)} placeholder="Anon Key" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-mandarin-blue outline-none" />
                <button onClick={saveConfig} disabled={!manualUrl || !manualKey} className="w-full bg-mandarin-blue text-white py-3 rounded-xl hover:shadow-glow-blue transition font-bold text-sm mt-2">Sauvegarder</button>
            </div>
        </div>
      </div>
    );
  }

  if (!user) return <Auth onLogin={setUser} />;

  const renderContent = () => {
    switch (currentView) {
      case 'CHAT': return <Chat currentUser={user} />;
      case 'ANNOUNCEMENTS': return <Announcements currentUser={user} />;
      case 'QUIZ': return <Quiz currentUser={user} />;
      case 'SCHEDULE': return <Schedule currentUser={user} />;
      default: return <Chat currentUser={user} />;
    }
  };

  return (
    <HashRouter>
      <div className="flex flex-col h-screen overflow-hidden font-sans relative bg-mandarin-black">
        
        {/* Background Gradients */}
        <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-float"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-red-600/5 rounded-full blur-[150px] pointer-events-none animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative z-10">
          {renderContent()}
        </div>

        {/* Floating Navigation Island */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <nav className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center gap-2 md:gap-6 transform transition-all hover:scale-[1.02]">
            
            <NavButton 
                active={currentView === 'CHAT'} 
                onClick={() => setCurrentView('CHAT')} 
                icon={<MessageSquare size={26} strokeWidth={currentView === 'CHAT' ? 2.5 : 2} />} 
                label="Chat"
                activeColor="text-mandarin-blue"
            />
            
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

            <NavButton 
                active={currentView === 'ANNOUNCEMENTS'} 
                onClick={() => setCurrentView('ANNOUNCEMENTS')} 
                icon={<Bell size={26} strokeWidth={currentView === 'ANNOUNCEMENTS' ? 2.5 : 2} />} 
                label="Infos"
                activeColor="text-mandarin-red"
            />
            
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

            <NavButton 
                active={currentView === 'SCHEDULE'} 
                onClick={() => setCurrentView('SCHEDULE')} 
                icon={<Calendar size={26} strokeWidth={currentView === 'SCHEDULE' ? 2.5 : 2} />} 
                label="Planning"
                activeColor="text-mandarin-yellow"
            />

            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

            <NavButton 
                active={currentView === 'QUIZ'} 
                onClick={() => setCurrentView('QUIZ')} 
                icon={<BookOpen size={26} strokeWidth={currentView === 'QUIZ' ? 2.5 : 2} />} 
                label="Quiz"
                activeColor="text-mandarin-green"
            />
            
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            
            <button 
                onClick={handleLogout}
                className="p-3 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all group active:scale-90"
                title="Déconnexion"
            >
                <LogOut size={24} className="group-hover:rotate-12 transition-transform"/>
            </button>
            </nav>
        </div>
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
    className={`relative group flex items-center justify-center p-3 rounded-full transition-all duration-300 ${active ? `${activeColor} bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]` : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    {/* Active Glow Dot */}
    {active && <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full shadow-[0_0_10px_currentColor]"></span>}
  </button>
);

export default App;
