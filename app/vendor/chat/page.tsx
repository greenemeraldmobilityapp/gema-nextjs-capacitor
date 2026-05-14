'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, Circle, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useVendorChats } from '@/lib/services/useChat';
import { cn } from '@/lib/utils';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function VendorChatPage() {
  const [search, setSearch] = useState('');
  const profile = useAuthStore((s) => s.profile);
  const { data: chats, isLoading, error } = useVendorChats(profile?.id);

  const filteredChats = (chats || []).filter(chat =>
    chat.order?.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.order?.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-3 border-b border-stone-100 sticky top-0 z-20">
        <h1 className="font-heading text-xl font-bold text-stone-800 mb-3">Pesan</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-stone-400" />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari percakapan..."
            className="pl-10 h-12 bg-stone-100 border-transparent rounded-xl text-sm focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat percakapan...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat percakapan</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="opacity-50" />
            </div>
            <p className="font-medium">Tidak ada pesan</p>
            <p className="text-sm mt-1">Percakapan akan muncul setelah ada pesanan</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 bg-white/80 backdrop-blur-sm">
            {filteredChats.map(chat => {
              const customerName = chat.order?.customer?.full_name || 'Pelanggan';
              const initials = customerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

              return (
                <Link
                  key={chat.id}
                  href={`/vendor/chat/detail?order_id=${chat.order_id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/80 transition-colors cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-700">{initials}</span>
                    </div>
                    <div className="w-3.5 h-3.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-stone-800 truncate">{customerName}</h3>
                      <span className="text-xs text-stone-400 shrink-0">
                        {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-stone-400 truncate">
                        {chat.last_message?.message || chat.order?.service_name || 'Pesan baru'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}