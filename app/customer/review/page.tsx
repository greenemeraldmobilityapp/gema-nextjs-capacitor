'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useOrder } from '@/lib/services/useOrders';
import { useCreateReview, useOrderReview } from '@/lib/services/useReviews';
import { useAuthStore } from '@/store/auth';

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore((s) => s.profile);
  const { data: order, isLoading } = useOrder(orderId);
  const { data: existingReview } = useOrderReview(orderId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/customer/orders" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke pesanan</Link>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
          <Link href={`/customer/orders/detail?id=${orderId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-heading font-bold text-lg">Beri Ulasan</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <AlertCircle size={48} className="mb-3 opacity-50" />
          <p className="font-medium text-gray-600">Anda sudah memberikan ulasan untuk pesanan ini</p>
          <Link href={`/customer/orders/detail?id=${orderId}`} className="mt-4 text-sm text-emerald-600 font-medium">Kembali ke detail pesanan</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating === 0 || !profile) return;

    createReview.mutate(
      {
        order_id: orderId,
        customer_id: profile.id,
        vendor_id: order.vendor_id,
        rating,
        review_text: reviewText.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Ulasan berhasil dikirim');
          router.push('/customer/orders');
        },
        onError: (err) => {
          toast.error(err.message || 'Gagal mengirim ulasan');
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/orders/detail?id=${orderId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Beri Ulasan</span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-gray-500 mb-1">{order.service_name}</p>
            <p className="text-xs text-gray-400 mb-4">{order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID') : '-'}</p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={44}
                    className={(hoverRating || rating) >= star
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-sm font-medium text-gray-600 mb-4">
                {rating === 1 ? 'Sangat Kurang' : rating === 2 ? 'Kurang' : rating === 3 ? 'Cukup' : rating === 4 ? 'Baik' : 'Sangat Baik'}
              </p>
            )}

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Bagikan pengalaman Anda (opsional)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none h-28"
            />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          disabled={rating === 0 || createReview.isPending}
          onClick={handleSubmit}
          variant="pill"
          size="lg"
          className="w-full shadow-sm disabled:opacity-50"
        >
          {createReview.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
        </Button>
      </div>
    </div>
  );
}
