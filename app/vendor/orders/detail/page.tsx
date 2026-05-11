'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useOrder, useUpdateOrderStatus } from '@/lib/services/useOrders';
import { useWallet, useAddTransaction } from '@/lib/services/useWallet';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { VendorLocationSharer } from '@/components/shared/LiveTracker';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';
  const { data: order, isLoading, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const profile = useAuthStore((s) => s.profile);
  const { data: vendorWallet } = useWallet(profile?.id);
  const addTransaction = useAddTransaction();

  const statusSteps = [
    { key: 'pending', label: 'Pesanan Baru' },
    { key: 'accepted', label: 'Diterima' },
    { key: 'in_progress', label: 'Dalam Pengerjaan' },
    { key: 'completed', label: 'Selesai' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order?.order_status);

  const handleAction = async (action: 'accept' | 'start' | 'complete' | 'decline') => {
    if (!order) return;

    const mutations: Record<string, Parameters<typeof updateStatus.mutateAsync>[0]> = {
      accept: { orderId: order.id, order_status: 'accepted', payment_status: 'escrow' },
      start: { orderId: order.id, order_status: 'in_progress' },
      complete: { orderId: order.id, order_status: 'completed', payment_status: 'released', completed_at: new Date().toISOString() },
      decline: { orderId: order.id, order_status: 'cancelled', cancelled_at: new Date().toISOString(), payment_status: order.payment_status === 'escrow' ? 'refunded' : undefined },
    };

    const labels: Record<string, string> = {
      accept: 'Pesanan diterima',
      start: 'Pekerjaan dimulai',
      complete: 'Pekerjaan selesai',
      decline: 'Pesanan ditolak',
    };

    try {
      await updateStatus.mutateAsync(mutations[action]);

      if (action === 'decline' && order.payment_status === 'escrow' && vendorWallet?.id) {
        await addTransaction.mutateAsync({
          wallet_id: vendorWallet.id,
          type: 'refund',
          amount: -order.vendor_payout,
          status: 'success',
        });
      }

      toast.success(labels[action]);
      router.refresh();
    } catch {
      toast.error('Gagal memperbarui status pesanan');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/vendor/orders" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke daftar</Link>
      </div>
    );
  }

  const formattedDate = order.scheduled_date
    ? new Date(order.scheduled_date + 'T' + (order.scheduled_time || '00:00')).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/vendor/orders" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Detail Pesanan</h1>
            <p className="text-xs text-gray-400">{order.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-3">Progress</h2>
          <div className="space-y-3">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i <= currentStepIndex ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                  )}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={cn('w-0.5 h-8', i < currentStepIndex ? 'bg-emerald-600' : 'bg-gray-200')} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className={cn('text-sm font-medium', i <= currentStepIndex ? 'text-gray-900' : 'text-gray-400')}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-3">Informasi Pesanan</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Layanan</p>
              <p className="text-sm font-medium text-gray-900">{order.service_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Kategori</p>
              <p className="text-sm font-medium text-gray-900">{order.service_category}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Alamat</p>
                <p className="text-sm text-gray-900">{order.service_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-900">{formattedDate}</span>
              </div>
              {order.scheduled_time && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{order.scheduled_time}</span>
                </div>
              )}
            </div>
            {order.customer && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-900">{order.customer.phone || 'No. HP tidak tersedia'}</span>
              </div>
            )}
            {order.notes && (
              <div>
                <p className="text-xs text-gray-400">Catatan</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-3">Rincian Pembayaran</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Biaya Layanan</span>
              <span className="text-gray-900">Rp {order.base_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Biaya Platform</span>
              <span className="text-gray-900">Rp {order.platform_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold">
              <span>Total</span>
              <span className="text-emerald-700">Rp {order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {order.order_status === 'in_progress' && (
          <div className="px-4">
            <VendorLocationSharer orderId={order.id} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
        {updateStatus.isPending && (
          <div className="flex items-center justify-center w-full text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin mr-2" />
            Memproses...
          </div>
        )}
        {!updateStatus.isPending && order.order_status === 'accepted' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('decline')}
              className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleAction('start')}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              Mulai Pekerjaan
            </Button>
          </>
        )}
        {!updateStatus.isPending && order.order_status === 'in_progress' && (
          <Button
            onClick={() => handleAction('complete')}
            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            Selesaikan Pekerjaan
          </Button>
        )}
        {!updateStatus.isPending && order.order_status === 'pending' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('decline')}
              className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleAction('accept')}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              Terima Pesanan
            </Button>
          </>
        )}
        {!updateStatus.isPending && (order.order_status === 'completed' || order.order_status === 'cancelled') && (
          <p className="w-full text-center text-sm text-gray-400 py-3">
            {order.order_status === 'completed' ? 'Pesanan selesai' : 'Pesanan dibatalkan'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VendorOrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-4 space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
