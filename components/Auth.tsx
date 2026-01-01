import React, { useState } from 'react';
import { db } from '../services/databaseService';
import { User, UserRole } from '../types';
import { Lock, ArrowRight, ScrollText, Mail, User as UserIcon, Key, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const SECRET_CODES = {
  STUDENT: 'G5L1-2025-CHINE-X',
  ADMIN: 'ADMIN-G5-MASTER'
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await db.login(email, password);
        if (error) throw error;
      } else {
        let role: UserRole | null = null;
        if (secretCode === SECRET_CODES.STUDENT) {
          role = UserRole.STUDENT;
        } else if (secretCode === SECRET_CODES.ADMIN) {
          role = UserRole.ADMIN;
        } else {
          throw new Error("Code secret invalide.");
        }

        if (!name.trim()) throw new Error("Veuillez entrer votre nom.");

        const { data, error } = await db.signUp(email, password, name, role);
        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMsg("Vérifiez votre boîte mail pour confirmer.");
          setIsLoading(false);
          return; 
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login')) {
        setError("Identifiants incorrects.");
      } else {
        setError(err.message || "Erreur inconnue.");
      }
    } finally {
      if (!isLogin && !successMsg) setIsLoading(false);
      else if (error) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mandarin-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-mandarin-blue/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-mandarin-red/5 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full glass-panel p-8 md:p-10 rounded-3xl shadow-2xl z-10 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-slide-up border border-white/10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-mandarin-blue to-blue-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
             <div className="relative bg-black p-5 rounded-full border border-white/10">
                <ScrollText size={48} className="text-mandarin-blue group-hover:scale-110 transition-transform duration-300" />
             </div>
             <Sparkles size={20} className="absolute -top-2 -right-2 text-mandarin-yellow animate-bounce-slight" />
          </div>
          
          <h1 className="text-4xl font-bold text-center text-white mt-6 academia-serif tracking-tight">
            Mandarin <span className="text-mandarin-blue">Connect</span>
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-mandarin-blue to-transparent mt-3 mb-1"></div>
          <p className="text-center text-gray-400 text-xs uppercase tracking-[0.3em]">L1 G5 &bull; Université</p>
        </div>

        {/* Toggle Pills */}
        <div className="flex bg-black/60 p-1.5 rounded-xl mb-8 border border-white/5 relative">
          <div 
             className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 rounded-lg transition-all duration-300 ease-out border border-white/5 shadow-inner ${isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
          ></div>
          <button 
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
          >
            Connexion
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative z-10 ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
          >
            Inscription
          </button>
        </div>

        {successMsg ? (
          <div className="bg-mandarin-green/10 border border-mandarin-green/50 p-6 rounded-2xl text-center animate-fade-in shadow-glow-blue">
            <CheckCircle className="mx-auto text-mandarin-green mb-4" size={56} />
            <h3 className="text-white font-bold mb-2 text-lg">Inscription Réussie</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{successMsg}</p>
            <button 
              onClick={() => { setIsLogin(true); setSuccessMsg(null); }}
              className="mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition font-medium"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              <div className="animate-fade-in space-y-5">
                <div className="relative group">
                    <UserIcon size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-mandarin-yellow transition-colors" />
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none"
                    placeholder="Nom Complet"
                    required={!isLogin}
                    />
                </div>
                <div className="relative group">
                    <Key size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-mandarin-red transition-colors" />
                    <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none font-mono text-sm tracking-widest uppercase"
                    placeholder="CODE-SECRET"
                    required={!isLogin}
                    />
                </div>
              </div>
            )}

            <div className="relative group">
                <Mail size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-mandarin-blue transition-colors" />
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none"
                placeholder="Email Universitaire"
                required
                />
            </div>

            <div className="relative group">
                <Lock size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-mandarin-blue transition-colors" />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full input-premium rounded-xl p-3.5 pl-12 text-white placeholder-gray-600 outline-none"
                placeholder="Mot de passe"
                required
                minLength={6}
                />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-mandarin-blue to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-glow-blue transition-all duration-300 flex justify-center items-center gap-3 active:scale-[0.98] mt-4 group"
            >
              {isLoading 
                ? <Loader2 className="animate-spin" /> 
                : isLogin 
                  ? <>Entrer <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  : 'Créer le compte'
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;