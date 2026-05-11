'use client';

import { useState } from 'react';
import { Clock, CheckCircle, Loader2, XCircle, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useCustomerOrders } from '@/lib/services/useOrders';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: 'text-orange-600 bg-orange-100' },
  accepted: { label: 'Diterima', color: 'text-blue-600 bg-blue-100' },
  in_progress: { label: 'Berjalan', color: 'text-emerald-600 bg-emerald-100' },
  completed: { label: 'Selesai', color: 'text-gray-600 bg-gray-100' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600 bg-red-100' },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { profile } = useAuthStore();
  const { data: orders, isLoading, error } = useCustomerOrders(profile?.id);

  const activeOrders = (orders || []).filter(o => !['completed', 'cancelled'].includes(o.order_status));
  const historyOrders = (orders || []).filter(o => ['completed', 'cancelled'].includes(o.order_status));

  const renderOrderCard = (order: any, isActive: boolean) => (
    <Card key={order.id} className="rounded-3xl border-none shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0">
            {order.service_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{order.service_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">#{order.id?.slice(0, 8)}</p>
              </div>
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', statusConfig[order.order_status]?.color)}>
                {statusConfig[order.order_status]?.label || order.order_status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-500 gap-2 mb-3">
          <Clock size={14} />
          <span>{(order.scheduled_date || order.completed_at) ? new Date(order.scheduled_date || order.completed_at).toLocaleDateString('id-ID') : '-'}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
          <div className="flex items-center gap-2">
            <Link href={`/customer/chat?order_id=${order.id}`}>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <MessageSquare size={18} />
              </div>
            </Link>
            <Link href={`/customer/orders/detail?id=${order.id}`}>
              <Button variant="pill" size="sm" className="h-10 px-5 text-xs">
                Lihat Detail <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm">
        <h1 className="text-xl font-bold">Pesanan Saya</h1>
      </div>

      <div className="p-4 -mt-4">
        <div className="flex bg-white rounded-full p-1 shadow-sm mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Riwayat
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Memuat pesanan...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400">
            <XCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Gagal memuat pesanan</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada riwayat pesanan'}
                </p>
              </div>
            ) : (
              (activeTab === 'active' ? activeOrders : historyOrders).map((order) => renderOrderCard(order, activeTab === 'active'))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
