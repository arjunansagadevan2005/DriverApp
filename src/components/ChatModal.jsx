import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config';

export default function ChatModal({ isOpen, onClose, orderId, driverName, vehicleNumber, onCallCustomer }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const quickReplies = [
        'Are you coming?',
        'Waiting at pickup 📍',
        'My location is as per map 🗺️',
        'Message when reached 💬'
    ];

    // --- AUTO SCROLL TO BOTTOM ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // --- FETCH & REAL-TIME SUBSCRIPTION ---
    useEffect(() => {
        if (!isOpen || !orderId) return;

        let subscription;

        const loadChat = async () => {
            setIsLoading(true);
            
            // 1. Fetch History
            const { data, error } = await supabase
                .from('order_chats')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
            setIsLoading(false);

            // 2. Subscribe to New Messages
            subscription = supabase
                .channel(`order-chat-${orderId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'order_chats',
                    filter: `order_id=eq.${orderId}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();
        };

        loadChat();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [isOpen, orderId]);

    // --- SEND MESSAGE ---
    const handleSend = async (text) => {
        if (!text || !text.trim()) return;
        
        const msgToSend = text.trim();
        setInputText(''); // Clear input instantly for snappy feel

        const { error } = await supabase
            .from('order_chats')
            .insert({
                order_id: orderId,
                sender_type: 'driver',
                message: msgToSend
            });

        if (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message.');
            setInputText(msgToSend); // Put text back if it failed
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputText);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-dark-bg slide-up transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border pt-safe-top shadow-sm z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform">
                            {/* Chevron Left Icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {(driverName || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{driverName || 'Partner'}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{vehicleNumber || 'Vehicle'}</p>
                        </div>
                    </div>
                    <button onClick={onCallCustomer} className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 hover:scale-110 transition-transform">
                        {/* Phone Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/30 shadow-sm z-10">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center font-medium">
                    ⚠️ Do not share your PIN with the customer before the ride starts
                </p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 pb-10">
                        {/* Message Circle Icon */}
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30 mb-3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <p className="text-sm font-semibold">No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isDriver = msg.sender_type === 'driver';
                        const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={msg.id || index} className={`flex ${isDriver ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                                <div className="max-w-[80%]">
                                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${isDriver ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white rounded-bl-sm'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <p className={`text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-1 font-medium ${isDriver ? 'text-right' : 'text-left'}`}>{time}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-3 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border z-10">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {quickReplies.map((reply, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(reply)} 
                            className="whitespace-nowrap px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 hover:border-brand-200 active:scale-95 transition-all">
                            {reply}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-dark-surface border-t border-slate-100 dark:border-dark-border pb-safe z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="px-4 py-3 flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1 px-5 py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400"
                    />
                    <button 
                        onClick={() => handleSend(inputText)} 
                        disabled={!inputText.trim()}
                        className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:active:scale-100 shrink-0">
                        {/* Send Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}