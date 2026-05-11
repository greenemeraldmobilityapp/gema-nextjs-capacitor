'use client';

import { ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatByOrder, useChatMessages, useRealtimeMessages, useSendMessage } from '@/lib/services/useChat';
import { useAuthStore } from '@/store/auth';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore((s) => s.profile);
  const { data: chat, isLoading: chatLoading } = useChatByOrder(orderId);
  const { data: messages, isLoading: msgLoading } = useChatMessages(chat?.id);
  useRealtimeMessages(chat?.id);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !chat?.id || !profile) return;

    sendMessage.mutate(
      { chatId: chat.id, senderId: profile.id, message: input.trim() },
      {
        onSuccess: () => setInput(''),
      }
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm shrink-0">
        <Link href={`/customer/orders/detail?id=${orderId}`}>
          <ArrowLeft size={24} className="text-gray-700" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">
            CS
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">Chat Pesanan</h2>
            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatLoading || msgLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : !chat ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Chat tidak tersedia</p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Belum ada pesan. Kirim pesan untuk memulai.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hari ini</span>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2 max-w-[80%] shadow-sm ${
                  msg.sender_id === profile?.id
                    ? 'bg-emerald-500 text-white rounded-tr-sm'
                    : 'bg-white border text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <span className={`text-[10px] mt-1 block text-right ${msg.sender_id === profile?.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

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
          disabled={!input.trim() || sendMessage.isPending || !chat?.id}
          size="icon"
          className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shrink-0 shadow-sm transition-transform active:scale-95"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
