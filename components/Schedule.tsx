import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Trash2, Clock, MapPin, Book, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

interface ScheduleProps { currentUser: User; }

const Schedule: React.FC<ScheduleProps> = ({ currentUser }) => {
  const items = useQuery(api.main.listSchedule);
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
    await addScheduleItem({ day, time: `${startTime} - ${endTime}`, subject, room });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ?")) await deleteScheduleItem({ id: id as Id<"schedule"> });
  };

  if (items === undefined) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  const groupedItems = DAYS.map(d => ({
    day: d,
    courses: items.filter((i: any) => i.day === d).sort((a: any, b: any) => a.time.localeCompare(b.time))
  }));

  return (
    <div className="h-full p-6 overflow-y-auto pb-32">
      <div className="flex justify-between items-center mb-8 sticky top-0 z-10 glass p-4 rounded-b-xl">
        <h2 className="text-3xl font-black text-white academia-serif">Planning</h2>
        {isAdmin && <button onClick={() => setIsAdding(!isAdding)} className="bg-mandarin-yellow text-black p-3 rounded-full"><Plus size={24} /></button>}
      </div>

      {isAdding && (
        <div className="glass-panel p-6 rounded-xl mb-8 border-l-4 border-mandarin-yellow">
          <div className="grid grid-cols-1 gap-4 mb-4">
             <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-black/50 border border-white/10 rounded p-3 text-white">{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
             <div className="flex gap-2"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded p-3 text-white" /><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded p-3 text-white" /></div>
             <input type="text" placeholder="Matière" value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-black/50 border border-white/10 rounded p-3 text-white" />
             <input type="text" placeholder="Salle" value={room} onChange={(e) => setRoom(e.target.value)} className="bg-black/50 border border-white/10 rounded p-3 text-white" />
          </div>
          <button onClick={handleAdd} className="w-full bg-mandarin-yellow text-black px-6 py-2 rounded-lg font-bold">Ajouter</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedItems.map((group) => (
          <div key={group.day} className="flex flex-col gap-3">
            <h3 className="text-xl font-serif text-gray-400 border-b border-white/10 pb-2">{group.day}</h3>
            {group.courses.map((item: any) => (
                 <div key={item.id} className="glass-panel p-4 rounded-xl border border-white/5 relative group">
                    <div className="flex justify-between items-start mb-2 text-mandarin-yellow font-bold text-sm"><span className="flex items-center gap-1"><Clock size={14}/> {item.time}</span> {isAdmin && <button onClick={() => handleDelete(item.id)}><Trash2 size={14} className="text-red-500"/></button>}</div>
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2"><Book size={16} className="text-mandarin-blue"/>{item.subject}</h4>
                    <div className="flex items-center gap-2 text-gray-400 text-xs"><MapPin size={12} />Salle {item.room}</div>
                 </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;