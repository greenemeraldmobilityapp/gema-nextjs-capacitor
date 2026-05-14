'use client';

import { ArrowLeft, Send, Loader2, AlertCircle, Phone, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatByOrder, useChatMessages, useRealtimeMessages, useSendMessage } from '@/lib/services/useChat';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function VendorChatDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ChatDetailContent />
    </Suspense>
  );
}

function ChatDetailContent() {
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
    <div className="flex flex-col h-screen bg-stone-50 pb-safe">
      <div className="bg-white/90 backdrop-blur-lg border-b border-stone-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <Link href={`/vendor/orders/detail?id=${orderId}`}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-sm flex items-center justify-center">
            <ArrowLeft size={22} className="text-stone-600" />
          </div>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center text-emerald-600 font-bold">
              P
            </div>
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-stone-800 leading-tight">Chat Pelanggan</h2>
            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
        <button className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center text-emerald-600 hover:shadow-md transition-all shrink-0">
          <Phone size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatLoading || msgLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : !chat ? (
          <div className="flex flex-col items-center py-16 text-stone-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Chat tidak tersedia</p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <p className="text-sm">Belum ada pesan. Kirim pesan untuk memulai.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <span className="text-xs text-stone-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">Hari ini</span>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={cn(
                  'rounded-2xl px-4 py-2.5 max-w-[80%] shadow-md',
                  msg.sender_id === profile?.id
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
                    : 'bg-white/90 backdrop-blur-sm border border-stone-100 text-stone-800 rounded-tl-sm'
                )}>
                  <p className="text-sm">{msg.message}</p>
                  <span className={cn(
                    'text-[10px] mt-1 block text-right',
                    msg.sender_id === profile?.id ? 'text-emerald-100' : 'text-stone-400'
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/90 backdrop-blur-lg border-t border-stone-100 p-4 pb-safe flex items-center gap-2 shrink-0">
        <button className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center text-stone-500 shrink-0">
          <Paperclip size={20} />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pesan..."
          className="flex-1 rounded-full border-stone-200 focus:border-emerald-400 bg-stone-50 h-12 transition-colors"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending || !chat?.id}
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all shrink-0"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}