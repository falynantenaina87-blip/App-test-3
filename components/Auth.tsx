import React, { useState } from 'react';
import { db } from '../services/databaseService';
import { User, UserRole } from '../types';
import { Lock, ArrowRight, BookOpen, Mail, User as UserIcon, Key, CheckCircle } from 'lucide-react';

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
  // Sign Up only fields
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
        // --- LOGIN ---
        const { error } = await db.login(email, password);
        if (error) throw error;
      } else {
        // --- SIGN UP ---
        // 1. Validate Secret Code
        let role: UserRole | null = null;
        if (secretCode === SECRET_CODES.STUDENT) {
          role = UserRole.STUDENT;
        } else if (secretCode === SECRET_CODES.ADMIN) {
          role = UserRole.ADMIN;
        } else {
          throw new Error("Code secret invalide. Demandez le code à votre professeur.");
        }

        if (!name.trim()) throw new Error("Veuillez entrer votre nom.");

        // 2. Perform Registration
        const { data, error } = await db.signUp(email, password, name, role);
        if (error) throw error;

        // 3. Check if session was established immediately
        if (data.user && !data.session) {
          setSuccessMsg("Compte créé avec succès ! Veuillez vérifier votre boîte mail (et spams) pour confirmer votre inscription avant de vous connecter.");
          setIsLoading(false);
          return; // Stop here, do not expect auto-login
        }
      }
      
      // onLogin is triggered by the App.tsx session listener automatically if session exists
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login')) {
        setError("Email ou mot de passe incorrect.");
      } else if (err.message.includes('User already registered')) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      // Only stop loading if we are not waiting for a redirect/session change
      // or if we hit an error/success message state manually
      if (!isLogin && !successMsg) {
         setIsLoading(false);
      } else if (error) {
         setIsLoading(false);
      }
      // If login success, we keep spinning until App.tsx unmounts this component
    }
  };

  return (
    <div className="min-h-screen bg-mandarin-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-mandarin-blue/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-mandarin-red/10 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full bg-mandarin-surface/80 backdrop-blur-md border border-mandarin-border p-8 rounded-2xl shadow-2xl z-10 transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="bg-mandarin-yellow/10 p-4 rounded-full">
            <BookOpen size={40} className="text-mandarin-yellow" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 academia-serif">L1 G5 Mandarin Connect</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {isLogin ? "Portail Numérique Universitaire" : "Rejoindre la classe"}
        </p>

        {/* Toggle Login/Signup */}
        <div className="flex bg-black p-1 rounded-lg mb-6 border border-mandarin-border">
          <button 
            className={`flex-1 py-2 rounded text-sm font-medium transition-all ${isLogin ? 'bg-mandarin-surface text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
          >
            Connexion
          </button>
          <button 
            className={`flex-1 py-2 rounded text-sm font-medium transition-all ${!isLogin ? 'bg-mandarin-surface text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
          >
            Inscription
          </button>
        </div>

        {successMsg ? (
          <div className="bg-mandarin-green/10 border border-mandarin-green p-6 rounded-lg text-center animate-fade-in">
            <CheckCircle className="mx-auto text-mandarin-green mb-4" size={48} />
            <h3 className="text-white font-bold mb-2">Inscription Réussie</h3>
            <p className="text-gray-300 text-sm">{successMsg}</p>
            <button 
              onClick={() => { setIsLogin(true); setSuccessMsg(null); }}
              className="mt-6 w-full bg-mandarin-surface border border-mandarin-border hover:bg-gray-800 text-white py-2 rounded transition"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Nom Complet</label>
                  <div className="relative">
                      <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black border border-mandarin-border rounded-lg p-3 pl-10 text-white focus:border-mandarin-yellow focus:ring-1 focus:ring-mandarin-yellow outline-none transition"
                      placeholder="Jean Dupont"
                      required={!isLogin}
                      />
                      <UserIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Code Secret (Classe)</label>
                  <div className="relative">
                      <input
                      type="text"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      className="w-full bg-black border border-mandarin-border rounded-lg p-3 pl-10 text-white focus:border-mandarin-red focus:ring-1 focus:ring-mandarin-red outline-none transition font-mono tracking-wider"
                      placeholder="XXXX-XXXX-XXXX"
                      required={!isLogin}
                      />
                      <Key size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 ml-1">Le code est fourni par votre professeur.</p>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">E-mail</label>
              <div className="relative">
                  <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-mandarin-border rounded-lg p-3 pl-10 text-white focus:border-mandarin-blue focus:ring-1 focus:ring-mandarin-blue outline-none transition"
                  placeholder="etudiant@univ.fr"
                  required
                  />
                  <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-mandarin-border rounded-lg p-3 pl-10 text-white focus:border-mandarin-yellow focus:ring-1 focus:ring-mandarin-yellow outline-none transition"
                  required
                  minLength={6}
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {error && (
              <div className="bg-mandarin-red/10 border border-mandarin-red/50 p-3 rounded text-mandarin-red text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition flex justify-center items-center gap-2 mt-2"
            >
              {isLoading 
                ? 'Traitement...' 
                : isLogin 
                  ? <>Entrer <ArrowRight size={18} /></>
                  : 'Créer le compte'
              }
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-600">
            Protégé par Supabase Auth.
        </div>
      </div>
    </div>
  );
};

export default Auth;