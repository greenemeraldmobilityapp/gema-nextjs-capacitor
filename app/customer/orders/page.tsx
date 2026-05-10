'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
  const { profile } = useAuthStore();
  const { data: orders, isLoading, error } = useCustomerOrders(profile?.id);

  const activeOrders = (orders || []).filter(o => !['completed', 'cancelled'].includes(o.order_status));
  const historyOrders = (orders || []).filter(o => ['completed', 'cancelled'].includes(o.order_status));

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm">
        <h1 className="text-xl font-bold">Pesanan Saya</h1>
      </div>

      <div className="p-4 -mt-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm rounded-xl mb-4 p-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Aktif</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Riwayat</TabsTrigger>
          </TabsList>

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
            <>
              <TabsContent value="active" className="space-y-4">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada pesanan aktif</p>
                  </div>
                ) : activeOrders.map((order) => (
                  <Link key={order.id} href={`/customer/orders/detail?id=${order.id}`} className="block">
                    <Card className="rounded-xl border-emerald-100 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{order.service_name}</h3>
                            <p className="text-sm text-gray-500">{order.service_category}</p>
                          </div>
                          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', statusConfig[order.order_status]?.color)}>
                            {statusConfig[order.order_status]?.label || order.order_status}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-4 gap-2">
                          <Clock size={14} />
                          <span>{order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID') : '-'}{order.scheduled_time ? `, ${order.scheduled_time}` : ''}</span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="font-bold text-emerald-700">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                {historyOrders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada riwayat pesanan</p>
                  </div>
                ) : historyOrders.map((order) => (
                  <Card key={order.id} className="rounded-xl border-gray-100 shadow-sm opacity-70">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{order.service_name}</h3>
                          <p className="text-sm text-gray-500">{order.service_category}</p>
                        </div>
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1', statusConfig[order.order_status]?.color)}>
                          {order.order_status === 'completed' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {statusConfig[order.order_status]?.label || order.order_status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                          <Clock size={14} />
                          <span>{order.completed_at ? new Date(order.completed_at).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                        <span className="font-bold text-gray-900">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
