'use client';

import { ArrowLeft, Send, Loader2, AlertCircle, Phone, Paperclip, ShieldCheck, ImageIcon, X, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatByOrder, useChatMessages, useRealtimeMessages, useSendMessage, useSendImage } from '@/lib/services/useChat';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { ContactRevealModal } from '@/components/shared/ContactRevealModal';
import { detectPatterns, maskText } from '@/lib/utils/chatDetection';
import { useOrder } from '@/lib/services/useOrders';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VendorChatDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Memuat...</div>}>
      <ChatDetailContent />
    </Suspense>
  );
}

function ChatDetailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore((s) => s.profile);
  const { data: chat, isLoading: chatLoading } = useChatByOrder(orderId);
  const { data: order } = useOrder(orderId);
  const { data: messages, isLoading: msgLoading } = useChatMessages(chat?.id);
  useRealtimeMessages(chat?.id);
  const sendMessage = useSendMessage();
  const sendImage = useSendImage();
  const [input, setInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [pendingReveal, setPendingReveal] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vendorTemplates = [
    "Sedang dalam perjalanan",
    "Sampai di lokasi",
    "Pekerjaan selesai",
    "Butuh tambahan biaya",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !chat?.id || !profile) return;
    const sendPromise = sendMessage.mutateAsync(
      { chatId: chat.id, senderId: profile.id, message: input.trim() },
    );
    toast.promise(sendPromise, {
      loading: 'Mengirim pesan...',
      success: () => { setInput(''); return 'Pesan terkirim'; },
      error: (err) => err?.message || 'Gagal mengirim pesan',
    });
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

      {order?.payment_status === 'escrow' && (
        <div className="mx-4 mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Pembayaran Escrow Aktif</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Dana Rp {order.total_amount.toLocaleString('id-ID')} dari customer sudah diamankan
            </p>
          </div>
        </div>
      )}

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
              !msg.sender_id ? (
                <div key={msg.id} className="flex justify-center py-1.5">
                  <span className="text-xs text-stone-400 italic bg-white/60 px-3 py-1.5 rounded-full">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 max-w-[80%] shadow-md',
                    msg.sender_id === profile?.id
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
                      : 'bg-white/90 backdrop-blur-sm border border-stone-100 text-stone-800 rounded-tl-sm'
                  )}>
                    {msg.attachment_url ? (
                      <img
                        src={msg.attachment_url}
                        alt="Gambar"
                        className="max-w-[200px] rounded-xl cursor-pointer"
                        onClick={() => setPreviewImage(msg.attachment_url)}
                      />
                    ) : (() => {
                      const patterns = detectPatterns(msg.message || '')
                      const isRevealed = revealedIds.has(msg.id)
                      if (patterns.length > 0 && !isRevealed) {
                        return (
                          <div className="relative">
                            <p className="text-sm blur-sm select-none">
                              {maskText(msg.message || '', patterns)}
                            </p>
                            <button
                              onClick={() => setPendingReveal(msg.id)}
                              className="absolute inset-0 flex items-center justify-center gap-1 bg-white/60 rounded-lg text-xs text-amber-600 font-medium"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Tampilkan
                            </button>
                          </div>
                        )
                      }
                      return <p className="text-sm">{msg.message}</p>
                    })()}
                    <span className={cn(
                      'text-[10px] mt-1 block text-right',
                      msg.sender_id === profile?.id ? 'text-emerald-100' : 'text-stone-400'
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {previewImage && (
        <ImageLightbox images={[{ image_url: previewImage }]} initialIndex={0} onClose={() => setPreviewImage(null)} />
      )}

      <ContactRevealModal
        open={!!pendingReveal}
        patterns={pendingReveal ? (messages || []).filter(m => m.id === pendingReveal).flatMap(m => detectPatterns(m.message || '')) : []}
        onConfirm={() => {
          if (pendingReveal) {
            setRevealedIds(prev => new Set(prev).add(pendingReveal))
            setPendingReveal(null)
          }
        }}
        onCancel={() => setPendingReveal(null)}
      />

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file || !chat?.id || !profile) return
          if (file.size > 10 * 1024 * 1024) {
            toast.error('Maksimal 10 MB')
            return
          }
          sendImage.mutate(
            { chatId: chat.id, senderId: profile.id, file },
            { onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal upload gambar') }
          )
          e.target.value = ''
        }}
      />

      {chat && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white/80 border-t border-stone-100">
          {vendorTemplates.map((t) => (
            <button
              key={t}
              onClick={() => setInput(t)}
              className="px-3 py-1.5 rounded-full bg-stone-100 text-xs text-stone-600 hover:bg-stone-200 whitespace-nowrap shrink-0 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-lg border-t border-stone-100 p-4 pb-safe flex items-center gap-2 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={sendImage.isPending}
          className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center text-stone-500 shrink-0 disabled:opacity-50"
        >
          {sendImage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={20} />}
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
      <div className="h-16 shrink-0" />
    </div>
  );
}