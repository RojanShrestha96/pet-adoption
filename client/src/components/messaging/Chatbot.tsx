import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, Send, Search, FileText, Phone, HelpCircle, PawPrint, Sparkles } from 'lucide-react';
interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
const quickActions = [{
  id: 'find',
  icon: Search,
  label: 'Find a pet',
  response: "I'd love to help you find your perfect companion! What type of pet are you looking for? 🐕🐈"
}, {
  id: 'track',
  icon: FileText,
  label: 'Track my application',
  response: "To track your application, please provide your application ID or the email you used to apply. I'll look it up for you! 📋"
}, {
  id: 'contact',
  icon: Phone,
  label: 'Contact shelter',
  response: "I can help you reach out to a shelter! Which shelter would you like to contact? You can also find contact info on each pet's profile page. 📞"
}, {
  id: 'guide',
  icon: HelpCircle,
  label: 'Adoption guidance',
  response: "Great choice! Here's what you need to know about adoption:\n\n1️⃣ Browse pets and find your match\n2️⃣ Submit an application\n3️⃣ Complete a home visit\n4️⃣ Meet your new friend!\n\nWould you like more details on any step?"
}];
export function Chatbot() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-secure-access');
  
  if (isAdminPath) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'bot',
    text: "Hi there! 👋 I'm PetMate Assistant. How can I help you today?",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: action.label,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: action.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const responses = ['Thanks for your message! Let me help you with that. 🐾', "I understand! Here's what I can tell you...", 'Great question! Many adopters ask about this.', "I'm here to help! Let me find that information for you."];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return <>
      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && <motion.button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 rounded-full shadow-xl" style={{
        background: 'var(--color-primary)',
        zIndex: 9998
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.95
      }} initial={{
        scale: 0,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0,
        opacity: 0
      }} transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20
      }}>
            <PawPrint className="w-7 h-7 text-white" />
            <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500" animate={{
          scale: [1, 1.2, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          </motion.button>}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }} className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] flex flex-col" style={{
        background: 'var(--color-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        height: '600px',
        maxHeight: 'calc(100vh - 6rem)',
        zIndex: 9999
      }}>
            {/* Header */}
            <div className="p-4 flex items-center gap-3 flex-shrink-0" style={{
          background: 'var(--color-primary)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)'
        }}>
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
              background: 'rgba(255,255,255,0.2)'
            }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">PetMate Assistant</h3>
                <p className="text-sm text-white/80">Always here to help 🐾</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg transition-colors hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{
          background: 'var(--color-surface)'
        }}>
              {messages.map((message, index) => <motion.div key={message.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'bot' && <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{
              background: 'var(--color-primary)'
            }}>
                      <PawPrint className="w-4 h-4 text-white" />
                    </div>}
                  <div className={`max-w-[75%] px-4 py-3 ${message.type === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'}`} style={{
              background: message.type === 'user' ? 'var(--color-primary)' : 'var(--color-card)',
              color: message.type === 'user' ? 'white' : 'var(--color-text)',
              boxShadow: 'var(--shadow-sm)'
            }}>
                    <p className="text-sm whitespace-pre-line">
                      {message.text}
                    </p>
                  </div>
                </motion.div>)}

              {/* Typing indicator */}
              {isTyping && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
              background: 'var(--color-primary)'
            }}>
                    <PawPrint className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{
              background: 'var(--color-card)',
              boxShadow: 'var(--shadow-sm)'
            }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full" style={{
                  background: 'var(--color-text-light)'
                }} animate={{
                  y: [0, -5, 0]
                }} transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15
                }} />)}
                    </div>
                  </div>
                </motion.div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && <div className="px-4 py-3 border-t flex-shrink-0" style={{
          borderColor: 'var(--color-border)'
        }}>
                <p className="text-xs font-medium mb-2" style={{
            color: 'var(--color-text-light)'
          }}>
                  Quick actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(action => {
              const Icon = action.icon;
              return <button key={action.id} onClick={() => handleQuickAction(action)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}>
                        <Icon className="w-4 h-4" style={{
                  color: 'var(--color-primary)'
                }} />
                        {action.label}
                      </button>;
            })}
                </div>
              </div>}

            {/* Input - FIXED */}
            <div className="p-4 border-t flex-shrink-0" style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          borderBottomLeftRadius: 'var(--radius-xl)',
          borderBottomRightRadius: 'var(--radius-xl)'
        }}>
              <div className="flex gap-2">
                <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm" style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)'
            }} autoComplete="off" />
                <motion.button onClick={handleSend} disabled={!inputValue.trim()} className="p-3 rounded-xl transition-colors disabled:opacity-50" style={{
              background: 'var(--color-primary)'
            }} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
}