'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, ShoppingCart, Search, User } from 'lucide-react';
import { useAllOrders } from '@/lib/services/useAdmin';
import { useCategories } from '@/lib/services/useCategories';
import { getCategoryLabel } from '@/lib/category-utils';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Tertunda',
  accepted: 'Diterima',
  in_progress: 'Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const paymentLabels: Record<string, string> = {
  unpaid: 'Belum Dibayar',
  escrow: 'Tertahan',
  released: 'Dirilis',
  refunded: 'Dikembalikan',
};

export default function AdminOrders() {
  const { data: orders, isLoading, error } = useAllOrders();
  const { data: categories = [] } = useCategories();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredOrders = (orders || []).filter((o) => {
    if (filter !== 'all' && o.order_status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.service_name?.toLowerCase().includes(q) || o.customer?.full_name?.toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Pesanan</h1>
            <p className="text-emerald-100 text-sm">Semua pesanan platform</p>
          </div>
          <Link href="/admin/profile" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
            <User size={20} />
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex overflow-x-auto gap-1">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'shrink-0 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                filter === s
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s === 'all' ? 'Semua' : statusLabels[s]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data pesanan</span>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">Tidak ada pesanan</p>
          </div>
        )}

        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{order.service_name}</h3>
                <p className="text-xs text-gray-500">{getCategoryLabel(categories, order.service_category)}</p>
                {order.customer && (
                  <p className="text-xs text-gray-400 mt-1">Customer: {order.customer.full_name}</p>
                )}
              </div>
              <span className="text-sm font-bold text-emerald-600 shrink-0">
                Rp {order.total_amount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                order.order_status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                order.order_status === 'cancelled' ? 'bg-red-50 text-red-600' :
                order.order_status === 'pending' ? 'bg-orange-50 text-orange-600' :
                'bg-blue-50 text-blue-600'
              )}>
                {statusLabels[order.order_status] || order.order_status}
              </span>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                order.payment_status === 'released' ? 'bg-emerald-50 text-emerald-600' :
                order.payment_status === 'refunded' ? 'bg-red-50 text-red-600' :
                order.payment_status === 'escrow' ? 'bg-blue-50 text-blue-600' :
                'bg-gray-50 text-gray-600'
              )}>
                {paymentLabels[order.payment_status] || order.payment_status}
              </span>
            </div>

            <p className="text-xs text-gray-400">
              {new Date(order.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
