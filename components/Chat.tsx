import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { db } from '../services/databaseService';
import { translateToMandarin } from '../services/geminiService';
import { Send, Globe, Sparkles, WifiOff, Loader2, ScrollText, Feather } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'ERROR'>('CONNECTING');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const containsChinese = (str: string) => /[\u4e00-\u9fa5]/.test(str);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await db.getMessages();
      setMessages(msgs);
    };
    loadMessages();

    const subscription = db.subscribeToMessages(
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      },
      (status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('SUBSCRIBED');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setConnectionStatus('ERROR');
        else setConnectionStatus('CONNECTING');
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await db.sendMessage(textToSend, currentUser.id);
  };

  const handleGeminiAssist = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    const translation = await translateToMandarin(inputText);
    setIsTranslating(false);

    if (translation) {
      setInputText(`${translation.hanzi} (${translation.pinyin})`);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-white relative">
      {/* Premium Header */}
      <div className="glass px-6 py-5 sticky top-0 z-20 shadow-xl border-b border-white/5">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-mandarin-blue to-blue-400 p-2.5 rounded-xl shadow-glow-blue">
                    <ScrollText size={28} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white academia-serif tracking-tight leading-none">
                        L1 <span className="text-mandarin-blue">G5</span> Connect
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                        Université &middot; Mandarin
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
               {/* Status Badge */}
               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 ${
                   connectionStatus === 'SUBSCRIBED' 
                   ? 'bg-mandarin-green/10 border-mandarin-green/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                   : 'bg-red-500/10 border-red-500/30'
               }`}>
                   <div className={`w-2 h-2 rounded-full ${connectionStatus === 'SUBSCRIBED' ? 'bg-mandarin-green animate-pulse' : 'bg-red-500'}`} />
                   <span className={`text-[10px] font-bold tracking-wider ${connectionStatus === 'SUBSCRIBED' ? 'text-mandarin-green' : 'text-red-400'}`}>
                       {connectionStatus === 'SUBSCRIBED' ? 'LIVE' : 'OFF'}
                   </span>
               </div>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-60 animate-fade-in">
            <div className="p-6 rounded-full bg-white/5 mb-4">
                <Feather size={48} className="text-gray-500" />
            </div>
            <p className="text-lg font-serif italic text-gray-400">Le début du savoir est le silence...</p>
            <p className="text-xs uppercase tracking-widest mt-2">Commencez la discussion</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.user_id === currentUser.id;
          const isProfMention = msg.content.includes('@prof');
          const isChineseContent = containsChinese(msg.content);
          const senderRole = msg.profile?.role;
          
          // Animation delay based on index for initial load feels nice
          const animDelay = index > messages.length - 5 ? 'animate-slide-up' : '';

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${animDelay} group`}>
              <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                     <span className={`text-xs font-bold tracking-wide ${isMe ? 'text-mandarin-blue' : 'text-gray-400'}`}>
                       {msg.profile?.name || 'Étudiant'}
                     </span>
                     {senderRole === UserRole.ADMIN && (
                       <span className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-mandarin-red to-red-600 text-white px-2 py-0.5 rounded-full font-bold shadow-glow-red">
                          ENSEIGNANT
                       </span>
                     )}
                     <span className="text-[10px] text-gray-600">{formatTime(msg.created_at)}</span>
                  </div>

                  <div 
                    className={`rounded-2xl p-5 relative shadow-lg transition-all duration-300 hover:scale-[1.01] ${
                      isMe 
                        ? 'bg-gradient-to-br from-mandarin-blue to-blue-700 text-white rounded-tr-sm shadow-glow-blue' 
                        : isProfMention 
                          ? 'bg-gradient-to-br from-mandarin-yellow/20 to-yellow-900/40 border border-mandarin-yellow/50 text-gray-100 shadow-glow-gold rounded-tl-sm'
                          : 'glass-panel rounded-tl-sm text-gray-200 border-white/5'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed font-light">
                        {msg.content}
                    </p>

                    {isChineseContent && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-2">
                        <Sparkles size={14} className="text-mandarin-yellow animate-pulse" />
                        <span className="text-[10px] text-mandarin-yellow font-bold tracking-widest opacity-90">TRADUCTION IA POSSIBLE</span>
                    </div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/5 fixed bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-full md:max-w-4xl md:mx-auto md:bottom-28 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30">
        <div className="flex gap-3">
          <button
            onClick={handleGeminiAssist}
            disabled={isTranslating || !inputText}
            className={`p-4 rounded-xl transition-all duration-300 active:scale-95 ${
              isTranslating 
                ? 'bg-mandarin-yellow text-black shadow-glow-gold' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isTranslating ? <Loader2 size={24} className="animate-spin" /> : <Globe size={24} />}
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Écrivez un message..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 text-white placeholder-gray-500 focus:border-mandarin-blue focus:ring-1 focus:ring-mandarin-blue outline-none transition-all shadow-inner text-base"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-mandarin-blue to-blue-600 text-white p-4 rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:rotate-3"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;