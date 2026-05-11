'use client';

import { ArrowLeft, MessageSquare, MapPin, Clock, Star, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrder, useUpdateOrderStatus } from '@/lib/services/useOrders';
import { useChatByOrder } from '@/lib/services/useChat';
import { useOrderReview } from '@/lib/services/useReviews';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  accepted: { label: 'Tukang Ditemukan', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'Pekerjaan Berjalan', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  completed: { label: 'Selesai', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

function getMilestones(orderStatus: string) {
  const all = [
    { label: 'Pesanan Dibuat', key: 'pending' },
    { label: 'Tukang Ditemukan', key: 'accepted' },
    { label: 'Pekerjaan Dimulai', key: 'in_progress' },
    { label: 'Selesai', key: 'completed' },
  ];
  const statusOrder = ['pending', 'accepted', 'in_progress', 'completed'];
  const currentIdx = statusOrder.indexOf(orderStatus);
  return all.map((m, i) => ({
    ...m,
    completed: i <= currentIdx,
  }));
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: chat } = useChatByOrder(orderId);
  const { data: existingReview } = useOrderReview(orderId);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/customer/orders" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke pesanan</Link>
      </div>
    );
  }

  const status = statusConfig[order.order_status] || statusConfig.pending;
  const milestones = getMilestones(order.order_status);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <div className="bg-emerald-600 text-white px-4 py-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Link href="/customer/orders">
          <ArrowLeft size={24} className="text-emerald-50" />
        </Link>
        <h1 className="text-lg font-bold">Detail Pesanan</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className={`rounded-2xl border-2 p-4 ${status.bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{order.service_category}</p>
              <h2 className="font-bold text-gray-900 text-lg">{order.service_name}</h2>
            </div>
            <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {order.payment_status === 'refunded' && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <XCircle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-600">Dana Telah Dikembalikan</p>
              <p className="text-xs text-red-500 mt-0.5">Pembayaran telah dikembalikan sebesar Rp {order.total_amount.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-1">
              <MapPin size={18} className="text-emerald-500 shrink-0" />
              <p className="text-sm text-gray-900 font-medium">Lokasi</p>
            </div>
            <p className="text-sm text-gray-500 ml-8">{order.service_address}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-1">
              <Clock size={18} className="text-emerald-500 shrink-0" />
              <p className="text-sm text-gray-900 font-medium">Jadwal</p>
            </div>
            <p className="text-sm text-gray-500 ml-8">
              {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
              {order.scheduled_time ? `, ${order.scheduled_time}` : ''}
            </p>
          </CardContent>
        </Card>

        {order.notes && (
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Catatan</p>
              <p className="text-sm text-gray-500">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Rincian Biaya</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Biaya Layanan</span>
              <span className="text-sm font-semibold text-gray-900">Rp {order.base_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Biaya Platform (5%)</span>
              <span className="text-sm font-semibold text-gray-900">Rp {order.platform_fee.toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full h-px bg-gray-100 my-3"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-6">Status Pesanan</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white ${milestone.completed ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-300'} z-10 shrink-0`}>
                    {milestone.completed && <CheckCircle2 size={16} />}
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] px-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${milestone.completed ? 'text-gray-900' : 'text-gray-400'}`}>{milestone.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href={`/customer/chat?order_id=${orderId}`} className="flex-1">
            <Button className="w-full h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 shadow-none font-semibold flex items-center gap-2">
              <MessageSquare size={18} />
              Chat
            </Button>
          </Link>
        </div>

        {order.order_status === 'pending' && (
          <Button
            onClick={() => {
              updateStatus.mutate(
                { orderId: order.id, order_status: 'cancelled', cancelled_at: new Date().toISOString(), payment_status: 'refunded' },
                {
                  onSuccess: () => toast.success('Pesanan dibatalkan'),
                  onError: (err) => toast.error(err.message || 'Gagal membatalkan'),
                }
              );
            }}
            disabled={updateStatus.isPending}
            className="w-full h-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 shadow-none border border-red-200 font-semibold"
          >
            {updateStatus.isPending ? 'Membatalkan...' : 'Batalkan Pesanan'}
          </Button>
        )}

        {order.order_status === 'completed' && !existingReview && (
          <Link href={`/customer/review?order_id=${orderId}`} className="block w-full">
            <Button className="w-full h-12 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-700 shadow-none border border-yellow-200 font-semibold flex items-center gap-2">
              <Star size={18} />
              Beri Ulasan
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
