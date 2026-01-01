import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Announcements from './components/Announcements';
import Quiz from './components/Quiz';
import Schedule from './components/Schedule';
import { User } from './types';
import { MessageSquare, Bell, BookOpen, LogOut, Calendar, CloudLightning } from 'lucide-react';

import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
import { Id } from "./convex/_generated/dataModel";

type View = 'CHAT' | 'ANNOUNCEMENTS' | 'QUIZ' | 'SCHEDULE';

const App: React.FC = () => {
  // Gestion d'état utilisateur simplifiée via LocalStorage pour l'ID
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    return localStorage.getItem("convex_user_id") as Id<"users"> | null;
  });

  const [currentView, setCurrentView] = useState<View>('CHAT');
  
  // Convex Query: Récupère l'utilisateur. Si userId est null, la query est "skipped"
  const user = useQuery(api.main.getUser, userId ? { id: userId } : "skip");
  
  // Si on a un ID mais que la query renvoie null (ex: user supprimé), on logout
  useEffect(() => {
    if (userId && user === null) {
        localStorage.removeItem("convex_user_id");
        setUserId(null);
    }
  }, [user, userId]);

  const handleLogin = (u: any) => {
      // 'u' vient du composant Auth (objet user complet)
      localStorage.setItem("convex_user_id", u._id);
      setUserId(u._id);
  };

  const handleLogout = () => {
      localStorage.removeItem("convex_user_id");
      setUserId(null);
      // Force reload to clean states
      window.location.reload();
  };

  // Tant qu'on n'a pas déterminé l'état de l'utilisateur
  if (userId && user === undefined) {
      return (
        <div className="h-screen bg-mandarin-black flex items-center justify-center">
            <div className="animate-spin text-mandarin-blue"><CloudLightning size={40} /></div>
        </div>
      );
  }

  // Si pas connecté
  if (!userId || !user) {
      return <Auth onLogin={handleLogin} />;
  }

  // Conversion du user Convex vers notre type User frontend
  const currentUser: User = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role as any
  };

  const renderContent = () => {
    switch (currentView) {
      case 'CHAT': return <Chat currentUser={currentUser} />;
      case 'ANNOUNCEMENTS': return <Announcements currentUser={currentUser} />;
      case 'QUIZ': return <Quiz currentUser={currentUser} />;
      case 'SCHEDULE': return <Schedule currentUser={currentUser} />;
      default: return <Chat currentUser={currentUser} />;
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