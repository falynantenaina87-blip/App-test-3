import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Announcements from './components/Announcements';
import Quiz from './components/Quiz';
import { db } from './services/databaseService';
import { supabase } from './services/supabaseClient';
import { User } from './types';
import { MessageSquare, Bell, BookOpen, LogOut, BarChart2 } from 'lucide-react';

type View = 'CHAT' | 'ANNOUNCEMENTS' | 'QUIZ' | 'DASHBOARD';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('CHAT');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    db.getCurrentUser().then(u => {
      setUser(u);
      setIsLoading(false);
    });

    // Listen for auth changes (Login/Logout anywhere)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
         const u = await db.getCurrentUser();
         setUser(u);
      } else if (event === 'SIGNED_OUT') {
         setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    db.logout();
  };

  if (isLoading) {
    return <div className="h-screen bg-mandarin-black flex items-center justify-center text-white">Chargement...</div>;
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
