'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';

const statusLabel: Record<string, { text: string; color: string }> = {
  pending: { text: 'Menunggu', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  accepted: { text: 'Diterima', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  in_progress: { text: 'Berjalan', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  completed: { text: 'Selesai', color: 'text-gray-600 bg-gray-50 border-gray-200' },
  cancelled: { text: 'Dibatalkan', color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function VendorOrdersPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading, error } = useVendorOrders(profile?.id);

  const activeOrders = (orders || []).filter(o => ['pending', 'accepted', 'in_progress'].includes(o.order_status));
  const historyOrders = (orders || []).filter(o => ['completed', 'cancelled'].includes(o.order_status));
  const displayOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Pesanan</h1>
      </div>

      <div className="px-4 py-3 bg-white">
        <div className="flex bg-gray-100 rounded-full p-1">
          {(['active', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'active' ? 'Aktif' : 'Riwayat'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat pesanan...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat pesanan</p>
            <p className="text-sm text-gray-400 mt-1">{error.message}</p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">Tidak ada pesanan</p>
          </div>
        ) : displayOrders.map((order) => (
          <Link
            key={order.id}
            href={`/vendor/orders/detail?id=${order.id}`}
            className="block bg-white rounded-3xl p-4 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.service_name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{order.customer?.full_name || 'Pelanggan'}</p>
              </div>
              <div className={cn('px-2.5 py-1 rounded-full border text-xs font-medium', statusLabel[order.order_status].color)}>
                {statusLabel[order.order_status].text}
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-400 gap-1 mb-2">
              <MapPin size={12} />
              <span className="truncate">{order.service_address}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-bold text-emerald-700">Rp {order.vendor_payout.toLocaleString()}</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID') : ''}{order.scheduled_time ? ` ${order.scheduled_time}` : ''} <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
