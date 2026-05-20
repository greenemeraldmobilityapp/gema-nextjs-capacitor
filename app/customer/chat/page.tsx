'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useCustomerChats } from '@/lib/services/useChat';
import { cn } from '@/lib/utils';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function CustomerChatPage() {
  const [search, setSearch] = useState('');
  const profile = useAuthStore((s) => s.profile);
  const { data: chats, isLoading, error } = useCustomerChats(profile?.id);

  useEffect(() => {
    if (error) toast.error('Gagal memuat percakapan', { duration: 5000 });
  }, [error?.message]);

  const filteredChats = (chats || []).filter((chat) => {
    const vendorName = chat.order?.vendor?.users?.full_name || '';
    const serviceName = chat.order?.service_name || '';
    const q = search.toLowerCase();
    return vendorName.toLowerCase().includes(q) || serviceName.toLowerCase().includes(q);
  });

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: '#F8FAFB',
        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(16, 185, 129, 0.04) 1px, transparent 0)',
        backgroundSize: '50px 50px',
      }}
    >
      <div className="bg-emerald-600/90 backdrop-blur-md px-4 pt-12 pb-4 rounded-b-[24px] shadow-sm">
        <h1 className="font-heading text-xl font-bold text-white mb-4">Pesan</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-emerald-200" />
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari vendor atau layanan..."
            className="pl-10 h-12 bg-white/15 border-transparent rounded-xl text-sm text-white placeholder:text-emerald-200/70 focus:bg-white/20 focus:ring-2 focus:ring-emerald-400/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 px-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-emerald-600">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat percakapan...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat percakapan</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="opacity-50 text-gray-300" />
            </div>
            <p className="font-medium">
              {search ? 'Percakapan tidak ditemukan' : 'Belum ada percakapan'}
            </p>
            <p className="text-sm mt-1">
              {search ? 'Coba kata kunci lain' : 'Percakapan akan muncul setelah ada pesanan'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const vendorName = chat.order?.vendor?.users?.full_name || 'Vendor';
              const initials = getInitials(vendorName);
              const serviceName = chat.order?.service_name || 'Chat Pesanan';

              return (
                <Link
                  key={chat.id}
                  href={`/customer/chat/detail?order_id=${chat.order_id}`}
                  className="flex items-center gap-4 px-1 py-4 hover:bg-emerald-50/50 transition-colors rounded-2xl -mx-1 cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{initials}</span>
                    </div>
                    <div className="w-3.5 h-3.5 bg-green-400 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{vendorName}</h3>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate">
                        {chat.last_message?.message || serviceName}
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
