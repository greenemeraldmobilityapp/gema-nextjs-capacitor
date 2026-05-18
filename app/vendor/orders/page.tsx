'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';

const statusLabel: Record<string, { text: string; color: string }> = {
  pending: { text: 'Menunggu', color: 'bg-amber-50/80 text-amber-700 border border-amber-200/50' },
  accepted: { text: 'Diterima', color: 'bg-blue-50/80 text-blue-700 border border-blue-200/50' },
  in_progress: { text: 'Berjalan', color: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50' },
  completed: { text: 'Selesai', color: 'bg-stone-100/80 text-stone-600 border border-stone-200/50' },
  cancelled: { text: 'Dibatalkan', color: 'bg-red-50/80 text-red-600 border border-red-200/50' },
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'active';
  const [tab, setTab] = useState<'active' | 'history'>(initialTab);
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading, error } = useVendorOrders(profile?.id);

  const activeOrders = (orders || []).filter(o => ['pending', 'accepted', 'in_progress'].includes(o.order_status));
  const historyOrders = (orders || []).filter(o => ['completed', 'cancelled'].includes(o.order_status));
  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  useEffect(() => {
    if (error) toast.error('Gagal memuat daftar pesanan');
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <h1 className="font-heading text-xl font-bold text-stone-800">Pesanan</h1>
      </div>

      <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-stone-100">
        <div className="flex bg-stone-100/80 backdrop-blur-sm rounded-full p-1">
          {(['active', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                tab === t
                  ? 'bg-white shadow-md text-stone-800'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {t === 'active' ? 'Aktif' : 'Riwayat'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mx-4" />

      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat pesanan...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat pesanan</p>
            <p className="text-sm text-stone-400 mt-1">{error.message}</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="opacity-50" />
            </div>
            <p className="font-medium">Tidak ada pesanan</p>
          </div>
        ) : displayOrders.map((order) => (
          <Link
            key={order.id}
            href={`/vendor/orders/detail?id=${order.id}`}
            className="block bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors duration-200">{order.service_name}</h3>
                <p className="text-sm text-stone-500 mt-0.5">{order.customer?.full_name || 'Pelanggan'}</p>
              </div>
              <div className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusLabel[order.order_status].color)}>
                {statusLabel[order.order_status].text}
              </div>
            </div>
            <div className="flex items-center text-xs text-stone-400 gap-1.5 mb-3">
              <MapPin size={12} />
              <span className="truncate">{order.service_address}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div>
                <span className="font-bold text-emerald-600">Rp {order.vendor_payout.toLocaleString()}</span>
                <p className="text-[10px] text-stone-400 mt-0.5">Pendapatan Anda</p>
              </div>
              <span className="text-xs text-stone-400 flex items-center gap-0.5 group-hover:text-stone-600 transition-colors duration-200">
                {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID') : ''}{order.scheduled_time ? ` ${order.scheduled_time}` : ''} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function VendorOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone-50"><Loader2 size={24} className="animate-spin text-stone-400" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}