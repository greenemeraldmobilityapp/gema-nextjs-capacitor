'use client';

import { ArrowLeft, MessageSquare, MapPin, Clock, Star, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrder, useUpdateOrderStatus } from '@/lib/services/useOrders';
import { useVendor } from '@/lib/services/useVendors';
import { useChatByOrder } from '@/lib/services/useChat';
import { useOrderReview } from '@/lib/services/useReviews';
import { CustomerLocationViewer } from '@/components/shared/LiveTracker';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'text-orange-600' },
  accepted: { label: 'Tukang Ditemukan', color: 'text-blue-600' },
  in_progress: { label: 'Pekerjaan Berjalan', color: 'text-emerald-600' },
  completed: { label: 'Selesai', color: 'text-gray-600' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600' },
};

const statusGradient: Record<string, string> = {
  pending: 'bg-gradient-to-br from-orange-50 to-orange-100/80 border-orange-200',
  accepted: 'bg-gradient-to-br from-blue-50 to-blue-100/80 border-blue-200',
  in_progress: 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-200',
  completed: 'bg-gradient-to-br from-gray-50 to-gray-100/80 border-gray-200',
  cancelled: 'bg-gradient-to-br from-red-50 to-red-100/80 border-red-200',
};

const iconBg: Record<string, string> = {
  pending: 'bg-orange-500',
  accepted: 'bg-blue-500',
  in_progress: 'bg-emerald-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

function getMilestones(orderStatus: string, order: any) {
  const timeMap: Record<string, string | undefined> = {
    pending: order.created_at,
    accepted: order.accepted_at,
    in_progress: order.started_at,
    completed: order.completed_at,
  };
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
    completed: i <= currentIdx && orderStatus !== 'cancelled',
    current: i === currentIdx && orderStatus !== 'completed' && orderStatus !== 'cancelled',
    time: timeMap[m.key] || null,
  }));
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: vendor } = useVendor(order?.vendor_id || '');
  const { data: chat } = useChatByOrder(orderId);
  const { data: existingReview } = useOrderReview(orderId);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-12 w-full rounded-xl" />
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
  const gradient = statusGradient[order.order_status] || statusGradient.pending;
  const ibg = iconBg[order.order_status] || 'bg-emerald-500';
  const milestones = getMilestones(order.order_status, order);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600/90 backdrop-blur-md text-white px-4 py-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Link href="/customer/orders">
          <ArrowLeft size={24} className="text-emerald-50" />
        </Link>
        <h1 className="text-lg font-heading font-bold">Detail Pesanan</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className={`rounded-3xl border-2 p-4 ${gradient}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white ${ibg}`}>
              {order.order_status === 'cancelled' ? <XCircle size={24} /> :
               order.order_status === 'completed' ? <CheckCircle2 size={24} /> :
               <Clock size={24} />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{order.service_category}</p>
              <h2 className="font-heading font-bold text-gray-900 text-lg">{order.service_name}</h2>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} bg-white border shadow-sm shrink-0`}>{status.label}</span>
          </div>
        </div>

        {vendor && (
          <Card className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
                {vendor.users?.full_name?.charAt(0) || 'V'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-gray-900">{vendor.users?.full_name || 'Vendor'}</h3>
                  {vendor.is_verified && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShieldCheck size={10} /> Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{vendor.specialization || 'General'}</p>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-0.5">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>{vendor.rating?.toFixed(1) || '0.0'} &bull; {vendor.total_jobs || 0} proyek</span>
                </div>
              </div>
              <Link href={`/customer/chat?order_id=${orderId}`}>
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm">
                  <MessageSquare size={16} />
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {order.payment_status === 'refunded' && (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700">Dana Telah Dikembalikan</p>
              <p className="text-xs text-emerald-600 mt-0.5">Pembayaran telah dikembalikan sebesar Rp {order.total_amount.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-emerald-500 shrink-0" />
                <p className="text-xs font-semibold text-gray-700">Lokasi</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{order.service_address}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-emerald-500 shrink-0" />
                <p className="text-xs font-semibold text-gray-700">Jadwal</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                {order.scheduled_time ? `, ${order.scheduled_time}` : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {order.notes && (
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Catatan</p>
              <p className="text-sm text-gray-500">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {order.order_status === 'in_progress' && (
          <CustomerLocationViewer orderId={order.id} />
        )}

        <Card className="rounded-3xl border-none shadow-sm">
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
            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-6">Status Pesanan</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-200 before:to-transparent">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white z-10 shrink-0 mt-0.5 transition-transform duration-300 ${
                    milestone.completed
                      ? 'border-emerald-500 bg-emerald-500 text-white scale-100'
                      : milestone.current
                        ? 'border-blue-500'
                        : 'border-gray-300'
                  }`}>
                    {milestone.completed && <CheckCircle2 size={14} />}
                    {milestone.current && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <span className={`font-semibold text-sm ${
                      milestone.completed
                        ? 'text-gray-900'
                        : milestone.current
                          ? 'text-blue-600'
                          : 'text-gray-400'
                    }`}>{milestone.label}</span>
                    {milestone.time && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(milestone.time)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href={`/customer/chat?order_id=${orderId}`} className="flex-1">
            <Button variant="pill" size="lg" className="w-full shadow-sm">
              <MessageSquare size={18} />
              Chat Vendor
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
