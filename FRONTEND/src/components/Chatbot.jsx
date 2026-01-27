import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minus, Maximize2, Bot, User, Loader2 } from 'lucide-react';
import Logo from '../assets/Thep2s.png';

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api');

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your Planet Scholar assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Map history for Gemini API - Exclude the very first greeting and ensure sequence
            const history = messages
                .filter((_, index) => index > 0) // Skip the initial "Hello" assistant message
                .map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));

            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history })
            });

            const data = await response.json();
            if (data.error) {
                if (data.error.includes('API Key not configured')) {
                    setMessages(prev => [...prev, { role: 'model', text: "It looks like the AI assistant is not fully configured yet. Please make sure the admin has added the GEMINI_API_KEY to the .env file!" }]);
                } else {
                    throw new Error(data.error);
                }
                return;
            }

            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting to my brain! 🧠 Please ensure your API Key is valid and active." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-2xl hover:scale-110 transition-all z-50 animate-bounce cursor-pointer group"
            >
                <div className="relative">
                    <img src={Logo} alt="P2S" className="w-8 h-8 rounded-full border-2 border-white/50" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-slate-800 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Need help? Chat with us!
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14 w-64' : 'h-[500px] w-[350px] md:w-[400px]'}`}>
            <div className="glass border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-black/5">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-600/90 to-emerald-500/90 p-4 border-b border-white/20 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={Logo} alt="P2S" className="w-8 h-8 rounded-full border border-white/50" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm leading-tight">P2S Assistant</h3>
                            <p className="text-sky-100 text-[10px] flex items-center gap-1">
                                <span className="w-1 h-1 bg-sky-200 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded-md transition-colors" title={isMinimized ? "Maximize" : "Minimize"}>
                            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors" title="Close">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-sky-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-fadeIn">
                                    <div className="flex gap-2 max-w-[85%]">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <Bot size={14} />
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                                            <div className="flex space-x-1">
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white/80 border-t border-slate-100 flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-slate-100/50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-700 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </>
                )}
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
        </div>
    );
}
