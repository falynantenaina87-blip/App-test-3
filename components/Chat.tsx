import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { db } from '../services/databaseService';
import { translateToMandarin } from '../services/geminiService';
import { Send, Globe, Sparkles, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'ERROR'>('CONNECTING');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to detect Chinese characters
  const containsChinese = (str: string) => /[\u4e00-\u9fa5]/.test(str);

  useEffect(() => {
    // Initial Load
    const loadMessages = async () => {
      const msgs = await db.getMessages();
      setMessages(msgs);
    };
    loadMessages();

    // Realtime Subscription with Status Monitoring
    const subscription = db.subscribeToMessages(
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      },
      (status) => {
        console.log("Realtime Status:", status);
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
    setInputText(''); // Clear UI immediately
    
    // We do NOT optimistic update here because Supabase Realtime is fast 
    // and we want to ensure the server timestamp/order is respected.
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
    <div className="flex flex-col h-full bg-mandarin-black text-white relative">
      {/* Header */}
      <div className="p-4 border-b border-mandarin-border bg-mandarin-black sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-mandarin-blue academia-serif">Chat de Classe (L1 G5)</h2>
        <div className="flex items-center gap-2">
           {connectionStatus === 'SUBSCRIBED' ? (
             <div className="flex items-center gap-1 text-xs text-mandarin-green">
               <span className="w-2 h-2 bg-mandarin-green rounded-full animate-pulse"></span>
               <span>En Direct</span>
             </div>
           ) : connectionStatus === 'ERROR' ? (
             <div className="flex items-center gap-1 text-xs text-mandarin-red" title="Vérifiez votre connexion internet ou la configuration Supabase Realtime">
               <WifiOff size={14} />
               <span>Déconnecté</span>
             </div>
           ) : (
             <div className="flex items-center gap-1 text-xs text-mandarin-yellow">
               <span className="w-2 h-2 bg-mandarin-yellow rounded-full animate-ping"></span>
               <span>Connexion...</span>
             </div>
           )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUser.id;
          const isProfMention = msg.content.includes('@prof');
          const isChineseContent = containsChinese(msg.content);
          const senderRole = msg.profile?.role;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-lg p-3 relative ${
                  isMe 
                    ? 'bg-mandarin-blue/10 border border-mandarin-blue/30 text-blue-100' 
                    : isProfMention 
                      ? 'bg-mandarin-yellow/10 border border-mandarin-yellow text-gray-200 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      : 'bg-mandarin-surface border border-mandarin-border text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-xs font-bold ${isMe ? 'text-mandarin-blue' : 'text-gray-400'}`}>
                     {msg.profile?.name || 'Étudiant'}
                   </span>
                   {senderRole === UserRole.ADMIN && (
                     <span className="text-[10px] bg-mandarin-red text-white px-1 rounded flex items-center gap-1">
                        PROF
                     </span>
                   )}
                   <span className="text-[10px] text-gray-600">{formatTime(msg.created_at)}</span>
                </div>

                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                </p>

                {/* AI Helper for Mandarin reading (Simulated Pinyin detection) */}
                {isChineseContent && (
                   <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-mandarin-yellow text-xs font-mono opacity-80">
                      <Sparkles size={10} />
                      <span>Caractères détectés</span>
                   </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 mt-10">
            <p>Aucun message. Lancez la conversation !</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-mandarin-surface border-t border-mandarin-border sticky bottom-0">
        <div className="flex gap-2">
          <button
            onClick={handleGeminiAssist}
            disabled={isTranslating || !inputText}
            className={`p-3 rounded-lg border transition-colors ${
              isTranslating 
                ? 'border-mandarin-yellow text-mandarin-yellow animate-pulse' 
                : 'border-mandarin-border text-gray-400 hover:text-mandarin-yellow hover:border-mandarin-yellow'
            }`}
            title="Traduire en Mandarin avec Gemini"
          >
            {isTranslating ? <Sparkles size={20} /> : <Globe size={20} />}
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Écrivez un message... (@prof pour alerte)"
            className="flex-1 bg-mandarin-black border border-mandarin-border rounded-lg px-4 py-2 text-white focus:border-mandarin-blue focus:ring-1 focus:ring-mandarin-blue outline-none transition"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-mandarin-blue text-white p-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;