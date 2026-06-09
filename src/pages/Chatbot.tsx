import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, PlusCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function Chatbot() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: t('chatbot.intro'),
      timestamp: '10:02 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length !== 1 || currentMessages[0].role !== 'bot') {
        return currentMessages;
      }

      return [{ ...currentMessages[0], content: t('chatbot.intro') }];
    });
  }, [t]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input.trim();

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMessage: ChatMessage = {
      role: 'bot',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const requestStartedAt = performance.now();
      let loggedFirstChunk = false;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t('chatbot.error'));
      }

      if (!response.body) {
        const text = await response.text();
        setMessages(prev => prev.map((message, index) => (
          index === prev.length - 1 && message.role === 'bot'
            ? { ...message, content: text || t('chatbot.error') }
            : message
        )));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let sawFirstChunk = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) {
          continue;
        }

        if (!sawFirstChunk) {
          sawFirstChunk = true;
          if (!loggedFirstChunk) {
            loggedFirstChunk = true;
            console.log(`first time we received first chunk: ${Math.round(performance.now() - requestStartedAt)}ms`);
          }
          setIsLoading(false);
        }

        streamedText += chunk;
        setMessages(prev => prev.map((message, index) => (
          index === prev.length - 1 && message.role === 'bot'
            ? { ...message, content: streamedText }
            : message
        )));
      }

      const remainingText = decoder.decode();
      if (remainingText) {
        streamedText += remainingText;
      }

      if (!streamedText) {
        setMessages(prev => prev.map((message, index) => (
          index === prev.length - 1 && message.role === 'bot'
            ? { ...message, content: t('chatbot.error') }
            : message
        )));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map((message, index) => (
        index === prev.length - 1 && message.role === 'bot'
          ? { ...message, content: t('chatbot.error') }
          : message
      )));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    t('chatbot.suggestion.visas'),
    t('chatbot.suggestion.checklist'),
    t('chatbot.suggestion.wait'),
    t('chatbot.suggestion.realId'),
  ];

  return (
    <div className="pt-20 pb-40 max-w-lg mx-auto flex flex-col h-[100dvh]">
      {/* Bot Intro */}
      <div className="flex flex-col items-center justify-center mb-8 shrink-0">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3 shadow-md">
          <Bot size={32} className="text-white" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">CaliBot</h1>
        <p className="text-sm text-on-surface-variant text-center max-w-xs mt-2 px-4 leading-relaxed">
          {t('chatbot.intro')}
        </p>
        <div className="mt-4 px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
          {t('chatbot.status')}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 space-y-6 flex flex-col no-scrollbar"
      >
        {messages.map((msg, i) => {
          if (!msg.content && msg.role === 'bot') {
            return null;
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i} 
              className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-container-high text-primary'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm border ${
                msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none border-primary' 
                : 'bg-white text-on-surface rounded-tl-none border-outline-variant'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-on-surface-variant'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-outline-variant shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Chips */}
        {messages.length < 3 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setInput(s)}
                className="bg-white border border-primary text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary-container hover:text-white transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-40 bg-gradient-to-t from-background via-background/80 to-transparent pt-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white border border-outline-variant rounded-2xl p-2.5 flex items-center gap-2 shadow-xl mb-2">
            <button className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors">
              <PlusCircle size={24} />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-1" 
              placeholder={t('chatbot.placeholder')} 
              type="text"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
