import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Minimize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Olá! Está tendo dificuldades com sua reserva ou precisa de ajuda com ingressos? Envie sua dúvida aqui.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate response delay and answer with "Funcionalidade ilustrativa."
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Funcionalidade ilustrativa.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-[440px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Chat Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#2b55f5] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>

              <div>
                <h4 className="text-sm font-black text-white leading-tight">Suporte Passfy</h4>
                <p className="text-[11px] text-slate-300 font-medium">Atendimento ao Cliente</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              title="Fechar chat de suporte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-[#2b55f5] text-white flex items-center justify-center shrink-0 text-xs mb-1">
                      <Headphones className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        : 'bg-[#2b55f5] text-white rounded-br-xs font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        isBot ? 'text-slate-400' : 'text-blue-100'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#2b55f5] text-white flex items-center justify-center shrink-0 text-xs mb-1">
                  <Headphones className="w-3 h-3" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3 py-2 text-xs shadow-2xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#2b55f5] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#2b55f5] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#2b55f5] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem de suporte..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2b55f5]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-[#2b55f5] hover:bg-[#1f44d6] disabled:opacity-40 text-white transition shrink-0 active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Right Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-300/80 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
        aria-label="Abrir suporte"
      >
        <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-[#2b55f5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <HelpCircle className="w-4 h-4" />
        </div>

        <span className="text-xs font-bold tracking-tight">Está tendo dificuldades?</span>

        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </button>
    </div>
  );
};
