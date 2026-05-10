'use client';

import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([
    { id: 1, text: 'Halo pak, saya akan tiba di lokasi dalam 15 menit ya.', sender: 'vendor', time: '13:45' },
    { id: 2, text: 'Baik Mas Budi, ditunggu ya.', sender: 'customer', time: '13:46' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'customer',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Simulate vendor reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Siap, saya sudah dekat lokasi. Tolong siapkan perlengkapannya.',
          sender: 'vendor',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm shrink-0">
        <Link href={`/customer/orders/detail?id=${searchParams.get('id') || 'order-123'}`}>
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">
            BT
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">Budi Teknik</h2>
            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center mb-6">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hari ini</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`rounded-2xl px-4 py-2 max-w-[80%] shadow-sm ${
                msg.sender === 'customer' 
                  ? 'bg-emerald-500 text-white rounded-tr-sm' 
                  : 'bg-white border text-gray-800 rounded-tl-sm'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className={`text-[10px] mt-1 block text-right ${msg.sender === 'customer' ? 'text-emerald-100' : 'text-gray-400'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 pb-safe flex items-center gap-2 shrink-0">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pesan..." 
          className="flex-1 rounded-full border-gray-200 focus-visible:ring-emerald-500 bg-gray-50 h-12"
        />
        <Button 
          onClick={handleSend}
          size="icon" 
          className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shrink-0 shadow-sm transition-transform active:scale-95"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
