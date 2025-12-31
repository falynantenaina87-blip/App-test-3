import React, { useState } from 'react';
import { db } from '../services/databaseService';
import { User } from '../types';
import { Lock, ArrowRight, BookOpen, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await db.login(email, password);
      if (error) throw error;
      
      // The onLogin will actually be handled by the App.tsx session listener, 
      // but we can manually trigger a fetch here to speed up UI if needed.
    } catch (err: any) {
      setError("Identifiants incorrects ou problème de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mandarin-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-mandarin-blue/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-mandarin-red/10 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full bg-mandarin-surface/80 backdrop-blur-md border border-mandarin-border p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-mandarin-yellow/10 p-4 rounded-full">
            <BookOpen size={40} className="text-mandarin-yellow" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2 academia-serif">L1 G5 Mandarin Connect</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Portail Numérique Universitaire</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading ? 'Connexion...' : <>Entrer <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-600">
            Connexion sécurisée via Supabase.
        </div>
      </div>
    </div>
  );
};

export default Auth;
