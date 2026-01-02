import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Announcements from './components/Announcements';
import Quiz from './components/Quiz';
import Schedule from './components/Schedule';
import { User, UserRole } from './types';
import { MessageSquare, Bell, BookOpen, LogOut, Calendar, CloudLightning } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
import { Id } from "./convex/_generated/dataModel";

type View = 'CHAT' | 'ANNOUNCEMENTS' | 'QUIZ' | 'SCHEDULE';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("convex_user_id"));
  const [currentView, setCurrentView] = useState<View>('CHAT');
  
  const userQuery = useQuery(api.main.getUser, userId ? { id: userId as Id<"users"> } : "skip");

  const handleLogin = (u: any) => {
      localStorage.setItem("convex_user_id", u._id);
      setUserId(u._id);
  };

  const handleLogout = () => {
      localStorage.removeItem("convex_user_id");
      setUserId(null);
      window.location.reload();
  };

  // Si on a un ID mais pas encore les données utilisateur (chargement)
  if (userId && userQuery === undefined) {
      return (
        <div className="h-screen bg-mandarin-black flex items-center justify-center">
            <div className="animate-spin text-mandarin-blue"><CloudLightning size={40} /></div>
        </div>
      );
  }

  // Si pas connecté ou utilisateur introuvable
  if (!userId || !userQuery) {
      return <Auth onLogin={handleLogin} />;
  }

  const currentUser: User = {
      id: userQuery._id,
      name: userQuery.name,
      email: userQuery.email,
      role: userQuery.role as any || UserRole.STUDENT
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
        <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-float"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-red-600/5 rounded-full blur-[150px] pointer-events-none animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="flex-1 overflow-hidden relative z-10">{renderContent()}</div>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <nav className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl pointer-events-auto flex items-center gap-4">
            <NavButton active={currentView === 'CHAT'} onClick={() => setCurrentView('CHAT')} icon={<MessageSquare size={24} />} activeColor="text-mandarin-blue" />
            <div className="w-[1px] h-6 bg-white/10"></div>
            <NavButton active={currentView === 'ANNOUNCEMENTS'} onClick={() => setCurrentView('ANNOUNCEMENTS')} icon={<Bell size={24} />} activeColor="text-mandarin-red" />
            <div className="w-[1px] h-6 bg-white/10"></div>
            <NavButton active={currentView === 'SCHEDULE'} onClick={() => setCurrentView('SCHEDULE')} icon={<Calendar size={24} />} activeColor="text-mandarin-yellow" />
            <div className="w-[1px] h-6 bg-white/10"></div>
            <NavButton active={currentView === 'QUIZ'} onClick={() => setCurrentView('QUIZ')} icon={<BookOpen size={24} />} activeColor="text-mandarin-green" />
            <div className="w-[1px] h-6 bg-white/10"></div>
            <button onClick={handleLogout} className="p-3 text-gray-500 hover:text-white transition-all"><LogOut size={22} /></button>
            </nav>
        </div>
      </div>
    </HashRouter>
  );
};

const NavButton: React.FC<any> = ({ active, onClick, icon, activeColor }) => (
  <button onClick={onClick} className={`p-3 rounded-full transition-all ${active ? `${activeColor} bg-white/10 scale-110` : 'text-gray-500'}`}>{icon}</button>
);

export default App;