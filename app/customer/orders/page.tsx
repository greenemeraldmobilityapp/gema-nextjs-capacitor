'use client';

import { useState } from 'react';
import { Clock, AlertCircle, MessageSquare, ArrowRight, Package, History, Star } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useCustomerOrders } from '@/lib/services/useOrders';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; dotColor: string; pulse?: boolean }> = {
  pending: { label: 'Menunggu', color: 'text-orange-600 bg-orange-100', dotColor: 'bg-orange-500' },
  accepted: { label: 'Diterima', color: 'text-blue-600 bg-blue-100', dotColor: 'bg-blue-500' },
  in_progress: { label: 'Berjalan', color: 'text-emerald-600 bg-emerald-100', dotColor: 'bg-emerald-500', pulse: true },
  completed: { label: 'Selesai', color: 'text-gray-600 bg-gray-100', dotColor: 'bg-gray-400' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600 bg-red-100', dotColor: 'bg-red-500' },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { profile } = useAuthStore();
  const { data: orders, isLoading, error } = useCustomerOrders(profile?.id);

  const activeOrders = (orders || []).filter(o => !['completed', 'cancelled'].includes(o.order_status));
  const historyOrders = (orders || []).filter(o => ['completed', 'cancelled'].includes(o.order_status));

  const renderOrderCard = (order: any) => {
    const cfg = statusConfig[order.order_status];
    return (
      <Card key={order.id} className="rounded-[24px] border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-500 active:scale-[0.98] transition-all duration-200 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-[24px]" />
        <CardContent className="p-4 pl-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
              {order.service_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              {order.service_category && (
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{order.service_category}</span>
              )}
              <div className="flex items-start justify-between gap-2 mt-0.5">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{order.service_name}</h3>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 shadow-sm', cfg?.color)}>
                  {cfg?.pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {!cfg?.pulse && <span className={cn('w-1.5 h-1.5 rounded-full', cfg?.dotColor)} />}
                  {cfg?.label || order.order_status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-2">
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <Clock size={14} />
              <span>{(order.scheduled_date || order.completed_at) ? new Date(order.scheduled_date || order.completed_at).toLocaleDateString('id-ID') : '-'}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400 gap-2">
              <span className="font-mono">#{order.id?.slice(0, 8)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</p>
              <span className="text-lg font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/customer/chat/detail?order_id=${order.id}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                  <MessageSquare size={18} />
                </div>
              </Link>
              {order.order_status === 'completed' && (
                <Link href={`/customer/review?order_id=${order.id}`}>
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 hover:bg-yellow-100 transition-colors" title="Beri Ulasan">
                    <Star size={18} />
                  </div>
                </Link>
              )}
              <Link href={`/customer/orders/detail?id=${order.id}`}>
                <Button variant="pill" size="sm" className="h-10 px-5 text-xs shadow-sm">
                  Lihat Detail <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm">
        <h1 className="text-xl font-heading font-bold">Pesanan Saya</h1>
      </div>

      <div className="p-4 -mt-4">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4 relative">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 z-10',
              activeTab === 'active' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Package size={16} />
            Aktif
            {activeOrders.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center">{activeOrders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 z-10',
              activeTab === 'history' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <History size={16} />
            Riwayat
            {historyOrders.length > 0 && (
              <span className="text-[10px] font-bold bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center">{historyOrders.length}</span>
            )}
          </button>
          <div
            className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm transition-all duration-200 ease-out"
            style={{
              left: activeTab === 'active' ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)',
            }}
          />
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Gagal memuat pesanan</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">
                  {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada riwayat pesanan'}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {activeTab === 'active' ? 'Temukan layanan yang kamu butuhkan' : 'Pesanan selesai akan muncul di sini'}
                </p>
                {activeTab === 'active' && (
                  <Link href="/customer/search">
                    <Button variant="pill" size="sm" className="mt-4 px-6">
                      Jelajahi Layanan
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              (activeTab === 'active' ? activeOrders : historyOrders).map((order) => renderOrderCard(order))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
