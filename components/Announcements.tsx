
import React, { useState, useEffect } from 'react';
import { User, Announcement, UserRole } from '../types';
import { db } from '../services/databaseService';
import { Bell, AlertTriangle, Plus, Pin, Trash2 } from 'lucide-react';

interface AnnouncementsProps {
  currentUser: User;
}

const Announcements: React.FC<AnnouncementsProps> = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await db.getAnnouncements();
      setAnnouncements(data);
    };
    loadData();

    // Subscribe to ALL changes (Insert, Update, Delete)
    const subscription = db.subscribeToAnnouncements(() => {
        loadData();
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const handlePost = async () => {
    if (!newTitle || !newContent) return;
    try {
        await db.postAnnouncement(newTitle, newContent, isUrgent ? 'URGENT' : 'NORMAL');
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
        setIsUrgent(false);
    } catch (e) {
        console.error("Failed to post", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
      try {
        await db.deleteAnnouncement(id);
      } catch (e) {
        console.error("Failed to delete", e);
      }
    }
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="h-full p-6 overflow-y-auto pb-32">
      <div className="flex justify-between items-center mb-8 sticky top-0 z-10 glass p-4 -mx-4 rounded-b-2xl shadow-lg border-b border-white/5">
        <div>
            <h2 className="text-3xl font-black text-white academia-serif">Tableau</h2>
            <p className="text-xs text-mandarin-red font-bold uppercase tracking-widest">Annonces Officielles</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-mandarin-red text-white p-3 rounded-full hover:bg-red-600 transition shadow-glow-red active:scale-95"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {isCreating && (
        <div className="glass-panel border-l-4 border-l-mandarin-red p-6 rounded-xl mb-8 animate-slide-up">
          <h3 className="text-mandarin-red font-bold mb-4 flex items-center gap-2 text-lg">
             <AlertTriangle size={20} /> Nouvelle Annonce
          </h3>
          <input
            type="text"
            placeholder="Titre..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 mb-3 text-white focus:border-mandarin-red outline-none"
          />
          <textarea
            placeholder="Message..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 mb-4 text-white h-32 focus:border-mandarin-red outline-none"
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer select-none bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">
              <input 
                type="checkbox" 
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="accent-mandarin-red w-4 h-4"
              />
              <span className="font-bold text-mandarin-red">URGENT</span>
            </label>
            <button
              onClick={handlePost}
              className="bg-gradient-to-r from-mandarin-red to-red-700 text-white px-6 py-2 rounded-lg font-bold hover:shadow-glow-red transition"
            >
              Publier
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {announcements.map((ann, idx) => (
          <div 
            key={ann.id} 
            className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
              ann.priority === 'URGENT' 
                ? 'bg-gradient-to-br from-red-900/20 to-black border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                : 'glass-panel border-white/5'
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Pin Icon */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform z-10">
                <Pin size={14} className={ann.priority === 'URGENT' ? 'text-mandarin-red' : 'text-mandarin-blue'} fill="currentColor"/>
            </div>

            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
              
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                  title="Supprimer l'annonce"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h3 className={`font-serif text-xl font-bold mb-2 ${ann.priority === 'URGENT' ? 'text-mandarin-red' : 'text-white'}`}>
              {ann.title}
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-light">
              {ann.content}
            </p>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="text-center text-gray-500 mt-20 italic font-serif">
            Aucune annonce officielle pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
