import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { Send, Globe, Sparkles, Loader2, ScrollText, Feather } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface ChatProps { currentUser: User; }

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const messages = useQuery(api.main.listMessages);
  const sendMessage = useMutation(api.main.sendMessage);
  const translate = useAction(api.actions.translateText);

  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage({ content: textToSend, user_id: currentUser.id as Id<"users"> });
  };

  const handleGeminiAssist = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    try {
        const translation = await translate({ text: inputText });
        if (translation) setInputText(`${translation.hanzi} (${translation.pinyin})`);
    } catch(e) { console.error(e); }
    setIsTranslating(false);
  };

  if (messages === undefined) {
      return <div className="h-full flex items-center justify-center text-mandarin-blue"><Loader2 className="animate-spin" size={40} /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-white relative">
      <div className="glass px-6 py-5 sticky top-0 z-20 shadow-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
            <ScrollText size={28} className="text-white" />
            <h2 className="text-2xl font-black text-white academia-serif">L1 G5 Connect</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-60">
            <Feather size={48} className="mb-4" />
            <p className="font-serif italic">Le début du savoir est le silence...</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.user_id === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className="flex flex-col max-w-[85%]">
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     <span className="text-xs font-bold text-gray-400">{msg.profile?.name}</span>
                  </div>
                  <div className={`rounded-2xl p-5 shadow-lg ${isMe ? 'bg-mandarin-blue text-white' : 'glass-panel text-gray-200'}`}>
                    <p className="text-[15px] font-light">{msg.content}</p>
                  </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 fixed bottom-24 left-4 right-4 md:w-full md:max-w-4xl md:mx-auto z-30">
        <div className="flex gap-3">
          <button onClick={handleGeminiAssist} disabled={isTranslating || !inputText} className="p-4 rounded-xl bg-white/5 text-gray-400">
            {isTranslating ? <Loader2 size={24} className="animate-spin" /> : <Globe size={24} />}
          </button>
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-black/80 border border-white/10 rounded-xl px-5 text-white outline-none" placeholder="Message..." />
          <button onClick={handleSendMessage} disabled={!inputText.trim()} className="bg-mandarin-blue text-white p-4 rounded-xl"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
};

export default Chat;