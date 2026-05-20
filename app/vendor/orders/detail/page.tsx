'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, MessageSquare, Loader2, AlertCircle, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useOrder, useUpdateOrderStatus } from '@/lib/services/useOrders';
import { useOrderReview } from '@/lib/services/useReviews';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { VendorLocationSharer } from '@/components/shared/LiveTracker';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';
  const { data: order, isLoading, error } = useOrder(id);
  const { data: review } = useOrderReview(id);
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  const statusSteps = [
    { key: 'pending', label: 'Pesanan Baru' },
    { key: 'accepted', label: 'Diterima' },
    { key: 'in_progress', label: 'Dalam Pengerjaan' },
    { key: 'completed', label: 'Selesai' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order?.order_status);

  const [isReleasing, setIsReleasing] = useState(false);

  const handleAction = async (action: 'accept' | 'start' | 'complete' | 'decline') => {
    if (!order) return;

    const mutations: Record<string, Parameters<typeof updateStatus.mutateAsync>[0]> = {
      accept: { orderId: order.id, order_status: 'accepted' },
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

    const actionPromise = (async () => {
      if (action === 'complete') {
        setIsReleasing(true);
        const supabase = createClient();
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/release-payment`;
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('Sesi tidak ditemukan');
        const res = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal melepaskan pembayaran');
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      } else {
        await updateStatus.mutateAsync(mutations[action]);
      }

      router.refresh();
    })();

    toast.promise(actionPromise, {
      loading: 'Memproses...',
      success: labels[action],
      error: (err) => err instanceof Error ? err.message : 'Gagal memperbarui status pesanan',
      duration: 5000,
    });

    try {
      await actionPromise;
    } finally {
      setIsReleasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-4 space-y-4">
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/vendor/orders" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke daftar</Link>
      </div>
    );
  }

  const formattedDate = order.scheduled_date
    ? new Date(order.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 pb-24">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/orders" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-bold text-stone-800">Detail Pesanan</h1>
            <p className="text-xs text-stone-400">{order.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant">
          <h2 className="font-semibold text-stone-800 mb-3">Progress</h2>
          <div className="space-y-3">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm',
                    i <= currentStepIndex ? 'bg-emerald-600 text-white shadow-emerald-600/25' : 'bg-stone-200 text-stone-400'
                  )}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={cn('w-0.5 h-8', i < currentStepIndex ? 'bg-emerald-600' : 'bg-stone-200')} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className={cn('text-sm font-medium', i <= currentStepIndex ? 'text-stone-800' : 'text-stone-400')}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant">
          <h2 className="font-semibold text-stone-800 mb-3">Informasi Pesanan</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-400">Layanan</p>
              <p className="text-sm font-medium text-stone-800">{order.service_name}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Kategori</p>
              <p className="text-sm font-medium text-stone-800">{order.service_category}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-stone-400">Alamat</p>
                <p className="text-sm text-stone-800">{order.service_address}</p>
                {order.customer?.address_full && (
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed whitespace-pre-line">
                    {order.customer.address_full}
                  </p>
                )}
                {order.customer?.lat && order.customer?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.customer.lat},${order.customer.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-1"
                  >
                    <MapPin size={12} />
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-stone-400" />
                <span className="text-sm text-stone-800">{formattedDate}</span>
              </div>
              {order.scheduled_time && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-stone-400" />
                  <span className="text-sm text-stone-800">{order.scheduled_time}</span>
                </div>
              )}
            </div>
            {order.customer && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-stone-400" />
                <span className="text-sm text-stone-800">{order.customer.phone || 'No. HP tidak tersedia'}</span>
              </div>
            )}
            {order.notes && (
              <div>
                <p className="text-xs text-stone-400">Catatan</p>
                <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        <Link href={`/vendor/chat/detail?order_id=${order.id}`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant flex items-center gap-3 hover:shadow-lifted transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
              <MessageSquare size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-800 text-sm">Chat dengan Pelanggan</p>
              <p className="text-xs text-stone-500">Tanya detail atau konfirmasi pesanan</p>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant">
          <h2 className="font-semibold text-stone-800 mb-3">Rincian Pembayaran</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Biaya Layanan</span>
              <span className="text-stone-800">Rp {order.base_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Biaya Platform (10%)</span>
              <span className="text-stone-800">-Rp {Math.round(order.base_amount * 0.1).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-100 font-bold">
              <span className="text-stone-800">Pendapatan Anda</span>
              <span className="text-emerald-600">Rp {order.vendor_payout.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {order.order_status === 'completed' && review && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant">
            <h2 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              Ulasan Pelanggan
            </h2>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200'} />
              ))}
            </div>
            {review.review_text && (
              <p className="text-sm text-stone-600 leading-relaxed">&ldquo;{review.review_text}&rdquo;</p>
            )}
            {review.review_image && (
              <Image
                src={review.review_image}
                alt="Foto ulasan"
                width={96}
                height={96}
                className="mt-3 w-24 h-24 rounded-xl object-cover border border-stone-200"
              />
            )}
          </div>
        )}

        {order.order_status === 'in_progress' && (
          <div className="px-4">
            <VendorLocationSharer orderId={order.id} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 flex gap-3">
        {(updateStatus.isPending || isReleasing) && (
          <div className="flex items-center justify-center w-full text-sm text-stone-500">
            <Loader2 size={16} className="animate-spin mr-2" />
            Memproses...
          </div>
        )}
        {!updateStatus.isPending && !isReleasing && order.order_status === 'accepted' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('decline')}
              className="flex-1 h-12 rounded-xl border-red-200/50 text-red-600 hover:bg-red-50/50"
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleAction('start')}
              variant="premium"
              size="lg"
              className="flex-1"
            >
              Mulai Pekerjaan
            </Button>
          </>
        )}
        {!updateStatus.isPending && !isReleasing && order.order_status === 'in_progress' && (
          <Button
            onClick={() => handleAction('complete')}
            variant="premium"
            size="lg"
            className="flex-1"
          >
            Selesaikan Pekerjaan
          </Button>
        )}
        {!updateStatus.isPending && !isReleasing && order.order_status === 'pending' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('decline')}
              className="flex-1 h-12 rounded-xl border-red-200/50 text-red-600 hover:bg-red-50/50"
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleAction('accept')}
              variant="premium"
              size="lg"
              className="flex-1"
            >
              Terima Pesanan
            </Button>
          </>
        )}
        {!updateStatus.isPending && !isReleasing && (order.order_status === 'completed' || order.order_status === 'cancelled') && (
          <p className="w-full text-center text-sm text-stone-400 py-3">
            {order.order_status === 'completed' ? 'Pesanan selesai' : 'Pesanan dibatalkan'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VendorOrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 p-4 space-y-4"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
