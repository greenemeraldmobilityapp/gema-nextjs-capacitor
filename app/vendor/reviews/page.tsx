'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth';
import { useVendorReviews } from '@/lib/services/useReviews';

const FILTERS = ['Semua', '5★', '4★', '3★', '2★', '1★', 'Dengan Foto'];

export default function VendorReviewsPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: reviews, isLoading, error } = useVendorReviews(profile?.id);
  const [filter, setFilter] = useState('Semua');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (error) toast.error(error instanceof Error ? error.message : 'Gagal memuat ulasan');
  }, [error]);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (filter === 'Semua') return reviews;
    if (filter === 'Dengan Foto') return reviews.filter(r => r.review_image);
    const star = parseInt(filter);
    return reviews.filter(r => r.rating === star);
  }, [reviews, filter]);

  const distribution = useMemo(() => {
    if (!reviews) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const maxDist = Math.max(...distribution, 1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/vendor/dashboard" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Ulasan & Umpan Balik</span>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
            </div>
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-3xl" />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat ulasan</p>
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Belum ada ulasan</p>
            <p className="text-sm mt-1">Ajak pelanggan memberi ulasan setelah pesanan selesai</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-heading font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{reviews.length} Ulasan</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = distribution[star - 1];
                    const pct = (count / maxDist) * 100;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-3 text-right">{star}</span>
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-400 w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-3xl p-4 shadow-sm border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {review.customer?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.customer?.full_name || 'Pelanggan'}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>

                  {review.review_text && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                  )}

                  {review.review_image && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLightboxUrl(review.review_image!)}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <img
                          src={review.review_image}
                          alt="Foto ulasan"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Tidak ada ulasan dengan filter ini</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxUrl}
            alt="Foto ulasan"
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
