import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Pin, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface AnnouncementsProps { currentUser: User; }

const Announcements: React.FC<AnnouncementsProps> = ({ currentUser }) => {
  const announcements = useQuery(api.main.listAnnouncements);
  const postAnnouncement = useMutation(api.main.postAnnouncement);
  const deleteAnnouncement = useMutation(api.main.deleteAnnouncement);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handlePost = async () => {
    if (!newTitle || !newContent) return;
    await postAnnouncement({ title: newTitle, content: newContent, priority: isUrgent ? 'URGENT' : 'NORMAL' });
    setIsCreating(false); setNewTitle(''); setNewContent('');
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) await deleteAnnouncement({ id: id as Id<"announcements"> });
  };

  if (announcements === undefined) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="h-full p-6 overflow-y-auto pb-32">
      <div className="flex justify-between items-center mb-8 sticky top-0 z-10 glass p-4 rounded-b-xl">
        <h2 className="text-3xl font-black text-white academia-serif">Tableau</h2>
        {isAdmin && <button onClick={() => setIsCreating(!isCreating)} className="bg-mandarin-red text-white p-3 rounded-full"><Plus size={24} /></button>}
      </div>

      {isCreating && (
        <div className="glass-panel p-6 rounded-xl mb-8 border-l-4 border-mandarin-red">
          <input type="text" placeholder="Titre..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 mb-3 text-white" />
          <textarea placeholder="Message..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 mb-4 text-white h-32" />
          <div className="flex justify-between">
            <label className="flex items-center gap-2 text-white"><input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} /> URGENT</label>
            <button onClick={handlePost} className="bg-mandarin-red text-white px-6 py-2 rounded-lg font-bold">Publier</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {announcements.map((ann: any) => (
          <div key={ann.id} className={`p-6 rounded-2xl border ${ann.priority === 'URGENT' ? 'bg-red-900/20 border-red-500' : 'glass-panel border-white/5'}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
              {isAdmin && <button onClick={() => handleDelete(ann.id)}><Trash2 size={16} className="text-gray-500 hover:text-red-500" /></button>}
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">{ann.title}</h3>
            <p className="text-gray-300 text-sm whitespace-pre-line">{ann.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;