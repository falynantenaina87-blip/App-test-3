import React, { useState, useEffect } from 'react';
import { User, Announcement, UserRole } from '../types';
import { db } from '../services/databaseService';
import { Bell, AlertTriangle, Plus } from 'lucide-react';

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
    // Load initial
    const loadData = async () => {
      const data = await db.getAnnouncements();
      setAnnouncements(data);
    };
    loadData();

    // Subscribe to realtime updates
    const subscription = db.subscribeToAnnouncements(() => {
        // Refresh full list to ensure order (simplest strategy)
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
        alert("Erreur lors de la publication");
    }
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="h-full bg-mandarin-black p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-mandarin-red academia-serif flex items-center gap-2">
          <Bell size={24} />
          Tableau d'Affichage
        </h2>
        {isAdmin && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-mandarin-red/20 text-mandarin-red border border-mandarin-red px-3 py-1 rounded hover:bg-mandarin-red/30 transition flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvelle Annonce
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-mandarin-surface border border-mandarin-red/50 rounded-lg p-4 mb-6 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <h3 className="text-mandarin-red font-bold mb-3">Créer une annonce (Admin)</h3>
          <input
            type="text"
            placeholder="Titre de l'annonce"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-black border border-mandarin-border rounded p-2 mb-2 text-white"
          />
          <textarea
            placeholder="Contenu du message..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-black border border-mandarin-border rounded p-2 mb-3 text-white h-24"
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-mandarin-red cursor-pointer">
              <input 
                type="checkbox" 
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="accent-mandarin-red"
              />
              Marquer comme URGENT
            </label>
            <button
              onClick={handlePost}
              className="bg-mandarin-red text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
            >
              Publier
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-gray-500 text-center italic mt-10">Aucune annonce pour le moment.</p>
        )}

        {announcements.map((ann) => (
          <div 
            key={ann.id} 
            className={`border-l-4 rounded-r-lg p-4 bg-mandarin-surface relative ${
              ann.priority === 'URGENT' 
                ? 'border-mandarin-red shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' 
                : 'border-mandarin-blue'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold text-lg ${ann.priority === 'URGENT' ? 'text-mandarin-red' : 'text-mandarin-blue'}`}>
                {ann.priority === 'URGENT' && <AlertTriangle size={16} className="inline mr-2 mb-1"/>}
                {ann.title}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
