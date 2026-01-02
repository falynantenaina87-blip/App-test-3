import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, ArrowRight, ScrollText, Mail, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

interface AuthProps {
  onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useMutation(api.main.login);
  const registerMutation = useMutation(api.main.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await loginMutation({ email, password });
        if (!user) throw new Error("Email ou mot de passe incorrect");
      } else {
        // Par défaut, tout le monde est étudiant pour l'instant
        user = await registerMutation({ email, password, name, role: UserRole.STUDENT });
      }
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de connexion. Vérifiez le terminal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mandarin-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full glass-panel p-8 md:p-10 rounded-3xl shadow-2xl z-10 border border-white/10">
        <div className="flex flex-col items-center mb-8">
           <div className="relative bg-black p-5 rounded-full border border-white/10">
              <ScrollText size={48} className="text-mandarin-blue" />
           </div>
           <h1 className="text-4xl font-bold text-center text-white mt-6 academia-serif tracking-tight">
            Mandarin <span className="text-mandarin-blue">Connect</span>
          </h1>
        </div>

        <div className="flex bg-black/60 p-1.5 rounded-xl mb-8 border border-white/5 relative">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 rounded-lg transition-all duration-300 ${isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
          <button className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider relative z-10 ${isLogin ? 'text-white' : 'text-gray-500'}`} onClick={() => setIsLogin(true)}>Connexion</button>
          <button className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider relative z-10 ${!isLogin ? 'text-white' : 'text-gray-500'}`} onClick={() => setIsLogin(false)}>Inscription</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                  <UserIcon size={18} className="absolute left-4 top-4 text-gray-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none" placeholder="Nom Complet" required={!isLogin} />
              </div>
            )}
            <div className="relative group">
                <Mail size={18} className="absolute left-4 top-4 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none" placeholder="Email" required />
            </div>
            <div className="relative group">
                <Lock size={18} className="absolute left-4 top-4 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none" placeholder="Mot de passe" required />
            </div>

            {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-mandarin-blue to-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 mt-4">
              {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Se connecter' : "S'inscrire")}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;