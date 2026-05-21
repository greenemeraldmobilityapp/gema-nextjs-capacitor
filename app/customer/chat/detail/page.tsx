'use client';

import { ArrowLeft, Send, AlertCircle, Phone, Paperclip, Check, ShieldCheck, ImageIcon, X, Loader2, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { useChatByOrder, useChatMessages, useRealtimeMessages, useSendMessage, useSendImage } from '@/lib/services/useChat';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { ContactRevealModal } from '@/components/shared/ContactRevealModal';
import { detectPatterns, maskText } from '@/lib/utils/chatDetection';
import { useOrder } from '@/lib/services/useOrders';
import { useVendor } from '@/lib/services/useVendors';
import { useAuthStore } from '@/store/auth';

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Hari ini';
  if (msgDate.getTime() === yesterday.getTime()) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function shouldShowDateSep(messages: any[], index: number): boolean {
  if (index === 0) return true;
  const curr = new Date(messages[index].created_at);
  const prev = new Date(messages[index - 1].created_at);
  return curr.toDateString() !== prev.toDateString();
}

function processMessages(messages: any[], userId: string | undefined) {
  return messages.map((msg, idx) => {
    const prev = idx > 0 ? messages[idx - 1] : null;
    const next = idx < messages.length - 1 ? messages[idx + 1] : null;
    const isGrouped = prev && prev.sender_id === msg.sender_id;
    const isLastInGroup = !next || next.sender_id !== msg.sender_id;
    return { ...msg, isGrouped, isLastInGroup, showDateSep: shouldShowDateSep(messages, idx) };
  });
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore((s) => s.profile);
  const { data: chat, isLoading: chatLoading, error } = useChatByOrder(orderId);
  const { data: order } = useOrder(orderId);
  const { data: vendor } = useVendor(order?.vendor_id || '');
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

  const processedMessages = useMemo(
    () => (messages ? processMessages(messages, profile?.id) : []),
    [messages, profile?.id]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) toast.error(error instanceof Error ? error.message : 'Gagal memuat chat');
  }, [error]);

  const handleSend = () => {
    if (!input.trim() || !chat?.id || !profile) return;
    sendMessage.mutate(
      { chatId: chat.id, senderId: profile.id, message: input.trim() },
      { onSuccess: () => setInput('') }
    );
  };

  const vendorInitial = vendor?.users?.full_name?.charAt(0) || 'V';
  const vendorName = vendor?.users?.full_name || 'Vendor';
  const serviceName = order?.service_name || 'Chat Pesanan';

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: '#F8FAFB',
        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(16, 185, 129, 0.04) 1px, transparent 0)',
        backgroundSize: '50px 50px',
      }}
    >
      <div className="bg-emerald-600/90 backdrop-blur-md text-white px-4 pt-8 pb-4 rounded-b-[24px] sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link
          href={`/customer/orders/detail?id=${orderId}`}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-90 transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {vendorInitial}
            </div>
            <div className="w-3 h-3 bg-emerald-300 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-emerald-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-bold leading-tight truncate">{vendorName}</h2>
            <p className="text-xs text-emerald-200 font-medium truncate">{serviceName}</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 active:scale-90 transition-all duration-200 shrink-0">
          <Phone size={18} />
        </button>
      </div>

      {order?.payment_status === 'escrow' && (
        <div className="mx-4 mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Dilindungi Escrow GEMA</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Dana Rp {order.total_amount.toLocaleString('id-ID')} aman ditahan sampai pekerjaan selesai
            </p>
          </div>
        </div>
      )}

      <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
          style={{ overscrollBehavior: 'contain' }}
        >
        {error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat chat</p>
          </div>
        ) : chatLoading || msgLoading ? (
          <div className="space-y-4 pt-4">
            <div className="flex justify-start">
              <Skeleton className="h-12 w-48 rounded-[18px] rounded-bl-[6px]" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-56 rounded-[18px] rounded-br-[6px]" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-10 w-40 rounded-[18px] rounded-bl-[6px]" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-14 w-52 rounded-[18px] rounded-br-[6px]" />
            </div>
          </div>
        ) : !chat ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Chat tidak tersedia</p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">Belum ada pesan</p>
            <p className="text-xs text-gray-300 mt-1">Kirim pesan untuk memulai percakapan</p>
          </div>
        ) : (
          <>
            {processedMessages.map((msg, idx) => (
              <div key={msg.id}>
                {msg.showDateSep && (
                  <div className="flex items-center justify-center my-6 gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    <span className="text-xs font-medium text-gray-500 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                      {formatDateSeparator(new Date(msg.created_at))}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                  </div>
                )}
                {!msg.sender_id ? (
                  <div className="flex justify-center py-1.5">
                    <span className="text-xs text-gray-400 italic bg-white/60 px-3 py-1.5 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'} ${msg.isGrouped ? 'mt-0.5' : 'mt-3'}`}
                    style={{ animation: `messageIn 0.25s ease-out ${idx * 0.025}s both` }}
                  >
                    <div className="relative max-w-[80%]">
                      <div className={`px-4 py-2.5 shadow-sm ${
                        msg.sender_id === profile?.id
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[18px] rounded-br-[6px]'
                          : 'bg-white text-gray-800 rounded-[18px] rounded-bl-[6px] border border-gray-100'
                      } ${!msg.isLastInGroup ? (msg.sender_id === profile?.id ? 'rounded-br-[18px]' : 'rounded-bl-[18px]') : ''}`}>
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
                          return <p className="text-sm leading-relaxed">{msg.message}</p>
                        })()}
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className={`text-[10px] ${msg.sender_id === profile?.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender_id === profile?.id && (
                            <Check size={11} className="text-emerald-100 -ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] p-4 pb-safe flex items-center gap-2 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={sendImage.isPending}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 shrink-0 active:scale-90 disabled:opacity-50"
        >
          {sendImage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={20} />}
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pesan..."
          className="flex-1 rounded-full border-gray-200 bg-white/80 h-12 focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:shadow-inner transition-all duration-200"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending || !chat?.id}
          size="icon"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shrink-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:shadow-none"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
