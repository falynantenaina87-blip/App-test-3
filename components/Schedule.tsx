import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Calendar, Plus, Trash2, Clock, MapPin, Book } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface ScheduleProps {
  currentUser: User;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const Schedule: React.FC<ScheduleProps> = ({ currentUser }) => {
  const items = useQuery(api.main.listSchedule) || [];
  const addScheduleItem = useMutation(api.main.addScheduleItem);
  const deleteScheduleItem = useMutation(api.main.deleteScheduleItem);

  const [isAdding, setIsAdding] = useState(false);
  const [day, setDay] = useState(DAYS[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleAdd = async () => {
    if (!startTime || !endTime || !subject || !room) return;
    await addScheduleItem({
      day,
      time: `${startTime} - ${endTime}`,
      subject,
      room
    });
    setIsAdding(false);
    setSubject('');
    setRoom('');
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce cours ?")) {
      await deleteScheduleItem({ id: id as Id<"schedule"> });
    }
  };

  const groupedItems = DAYS.map(d => ({
    day: d,
    courses: items
      .filter(i => i.day === d)
      .sort((a, b) => a.time.localeCompare(b.time))
  }));

  return (
    <div className="h-full p-6 overflow-y-auto pb-32">
      <div className="flex justify-between items-center mb-8 sticky top-0 z-10 glass p-4 -mx-4 rounded-b-2xl shadow-lg border-b border-white/5">
        <div>
            <h2 className="text-3xl font-black text-white academia-serif">Planning</h2>
            <p className="text-xs text-mandarin-yellow font-bold uppercase tracking-widest">Emploi du temps L1 G5</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-mandarin-yellow text-black p-3 rounded-full hover:bg-yellow-400 transition shadow-glow-gold active:scale-95"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-panel border-l-4 border-l-mandarin-yellow p-6 rounded-xl mb-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none">
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
             <div className="flex items-center gap-2">
               <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none" />
               <span className="text-white">-</span>
               <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none" />
             </div>
             <input type="text" placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none" />
             <input type="text" placeholder="Salle" value={room} onChange={(e) => setRoom(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none" />
          </div>
          <button onClick={handleAdd} className="w-full bg-mandarin-yellow text-black px-6 py-2 rounded-lg font-bold">Ajouter</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedItems.map((group) => (
          <div key={group.day} className="flex flex-col gap-3">
            <h3 className="text-xl font-serif font-bold text-gray-400 border-b border-white/10 pb-2 mb-1 px-2">{group.day}</h3>
            {group.courses.map(item => (
                 <div key={item.id} className="glass-panel p-4 rounded-xl border border-white/5 relative group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-mandarin-yellow text-sm font-bold bg-mandarin-yellow/10 px-2 py-1 rounded">
                             <Clock size={14} /> {item.time}
                        </div>
                        {isAdmin && <button onClick={() => handleDelete(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>}
                    </div>
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2"><Book size={16} className="text-mandarin-blue"/>{item.subject}</h4>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-2"><MapPin size={12} />Salle {item.room}</div>
                 </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;