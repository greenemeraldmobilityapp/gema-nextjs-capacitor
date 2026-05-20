'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, Loader2, AlertCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import { useOrder } from '@/lib/services/useOrders';
import { useCreateReview, useUpdateReview, useOrderReview } from '@/lib/services/useReviews';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image-utils';

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
  const updateReview = useUpdateReview();
  const [editMode, setEditMode] = useState(false);

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review_text || '');
    }
  }, [existingReview]);

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

  if (existingReview && !editMode) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
          <Link href={`/customer/orders/detail?id=${orderId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-heading font-bold text-lg">Ulasan Anda</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={32} className={s <= existingReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
            ))}
          </div>
          {existingReview.review_text && (
            <p className="text-sm text-gray-600 mb-4 max-w-md">&ldquo;{existingReview.review_text}&rdquo;</p>
          )}
          {existingReview.review_image && (
            <Image src={existingReview.review_image} alt="Foto ulasan" width={96} height={96} className="w-24 h-24 rounded-xl object-cover mb-4 border" />
          )}
          <p className="font-medium text-gray-600 mb-2">Anda sudah memberikan ulasan untuk pesanan ini</p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-5 py-2 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Edit Ulasan
          </button>
          <Link href={`/customer/orders/detail?id=${orderId}`} className="mt-3 text-sm text-gray-400 font-medium">Kembali ke detail pesanan</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0 || !profile) return;

    if (!reviewText.trim()) {
      toast.warning('Anda belum menulis komentar', {
        description: 'Menambahkan komentar membantu vendor dan pengguna lain',
        duration: 4000,
      });
    }

    setIsUploading(true);
    try {
      let reviewImageUrl: string | undefined = existingReview?.review_image || undefined;

      if (imageFile) {
        const supabase = createClient();
        const compressed = await compressImage(imageFile);
        const fileName = `review/${profile.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, compressed, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          toast.error('Gagal mengunggah gambar', { duration: 5000 });
          setIsUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);

        reviewImageUrl = urlData?.publicUrl || undefined;
      }

      if (existingReview) {
        toast.promise(
          updateReview.mutateAsync({
            id: existingReview.id,
            order_id: orderId,
            vendor_id: order.vendor_id,
            rating,
            review_text: reviewText.trim() || undefined,
            review_image: reviewImageUrl,
          }),
          {
            loading: 'Memperbarui ulasan...',
            success: () => {
              setEditMode(false);
              return 'Ulasan berhasil diperbarui';
            },
            error: (err) => err.message || 'Gagal memperbarui ulasan',
            duration: 4000,
          },
        );
      } else {
        toast.promise(
          createReview.mutateAsync({
            order_id: orderId,
            customer_id: profile.id,
            vendor_id: order.vendor_id,
            rating,
            review_text: reviewText.trim() || undefined,
            review_image: reviewImageUrl,
          }),
          {
            loading: 'Mengirim ulasan...',
            success: () => {
              router.push('/customer/orders');
              return 'Ulasan berhasil dikirim';
            },
            error: (err) => err.message || 'Gagal mengirim ulasan',
            duration: 4000,
          },
        );
      }
    } catch {
      toast.error('Gagal memproses gambar', { duration: 5000 });
    } finally {
      setIsUploading(false);
    }
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

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Camera size={14} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Tambahkan Foto (opsional)</p>
              </div>
              <FileUpload
                value={imageFile}
                onChange={setImageFile}
                accept="image/*"
                maxSize={5 * 1024 * 1024}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          disabled={rating === 0 || createReview.isPending || updateReview.isPending || isUploading}
          onClick={handleSubmit}
          variant="pill"
          size="lg"
          className="w-full shadow-sm disabled:opacity-50"
        >
          {isUploading || createReview.isPending ? 'Mengirim...' : updateReview.isPending ? 'Memperbarui...' : existingReview ? 'Simpan Perubahan' : 'Kirim Ulasan'}
        </Button>
      </div>
    </div>
  );
}
