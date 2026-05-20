'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Clock, MapPin, ShieldCheck, Briefcase, ChevronLeft, ChevronRight, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { useServiceDetail } from '@/lib/services/useServices';
import { useVendorReviews } from '@/lib/services/useReviews';
import ImageLightbox from '@/components/shared/ImageLightbox';

function formatPrice(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} menit`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} jam`;
  return `${Math.round(minutes / 1440)} hari`;
}

export default function ServiceDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <ServiceDetailContent />
    </Suspense>
  );
}

function ServiceDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = typeof window !== 'undefined'
    ? (searchParams.get('id') || new URLSearchParams(window.location.search).get('id') || '')
    : '';

  const { data: service, isLoading, error, isFetched, isPending } = useServiceDetail(serviceId);
  const vendorId = service?.vendor_id || '';
  const { data: reviews } = useVendorReviews(vendorId);

  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ open: boolean; images: { image_url: string }[]; index: number }>({ open: false, images: [], index: 0 });

  const images = service?.service_images || [];
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : service?.vendor_profiles?.rating || 0;
  const totalReviews = reviews?.length || 0;
  const vendor = service?.vendor_profiles;

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-white p-4 pt-8">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="aspect-[4/3] max-h-[420px] w-full rounded-b-[24px]" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded-[24px]" />
          <Skeleton className="h-20 w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (isFetched && (error || !service)) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Layanan Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">Layanan yang Anda cari tidak tersedia atau telah dihapus</p>
          <Link href="/customer/home">
            <Button variant="pill" className="w-full">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8faf8]">
      <div className="relative">
        {images.length > 0 ? (
          <div className="relative w-full aspect-[4/3] max-h-[420px] bg-gray-100 overflow-hidden select-none rounded-b-[24px] shadow-sm">
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${imgIndex * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-full h-full shrink-0 cursor-pointer"
                  onClick={() => setLightbox({ open: true, images, index: idx })}
                >
                  <Image
                    src={img.image_url}
                    alt={`${service.title} ${idx + 1}`}
                    width={1200}
                    height={600}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white transition-all duration-200 flex items-center justify-center text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>

            {images.length > 1 && (
              <>
                {imgIndex > 0 && (
                  <button
                    onClick={() => setImgIndex(imgIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-200 flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {imgIndex < images.length - 1 && (
                  <button
                    onClick={() => setImgIndex(imgIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-200 flex items-center justify-center text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === imgIndex ? 'bg-white scale-110' : 'bg-white/50'
                      }`}
                      aria-label={`Gambar ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-3 right-4 z-10">
              <span className="text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {imgIndex + 1}/{images.length || 1}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white transition-all duration-200 flex items-center justify-center text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-200/50 flex items-center justify-center mx-auto mb-2">
                <Briefcase size={28} className="text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-600 font-medium">{service.title}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4 pb-32">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-lg font-heading font-bold text-gray-900 leading-tight flex-1">
              {service.title}
            </h1>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
              {service.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
            {totalReviews > 0 && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                <span>({totalReviews} ulasan)</span>
              </span>
            )}
            {service.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                <span>{formatDuration(service.duration_minutes)}</span>
              </span>
            )}
            {vendor?.users?.full_name && (
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                <span>Oleh {vendor.users.full_name}</span>
              </span>
            )}
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 -mx-1">
            <p className="text-[11px] text-emerald-600 font-medium mb-0.5">Harga</p>
            <p className="text-2xl font-heading font-bold text-emerald-700">
              {formatPrice(service.price)}
            </p>
          </div>
        </div>

        {service.description && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Deskripsi</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>
        )}

        {vendor && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Tentang Mitra</h3>
            <Link href={`/customer/vendor?id=${vendor.user_id}`} className="flex items-center gap-3">
              {vendor.users?.avatar_url || vendor.avatar_url ? (
                <Image
                  src={vendor.users?.avatar_url || vendor.avatar_url || ''}
                  alt={vendor.users?.full_name || 'Mitra'}
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-2xl object-cover shrink-0"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                  {vendor.users?.full_name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {vendor.users?.full_name || 'Mitra'}
                  </p>
                  {vendor.is_verified && (
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {vendor.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span>{vendor.total_jobs || 0} proyek</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-600 shrink-0">
                Lihat Profil &rarr;
              </div>
            </Link>
          </div>
        )}

        {reviews && reviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Ulasan Pelanggan</h3>
              <Link
                href={`/customer/reviews?vendor_id=${vendorId}`}
                className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 hover:bg-emerald-100 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            {reviews.slice(0, 3).map((review) => (
              <Card key={review.id} className="rounded-[16px] border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {review.customer?.avatar_url ? (
                        <Image src={review.customer.avatar_url} alt={review.customer?.full_name || ''} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                          {review.customer?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-xs truncate">
                          {review.customer?.full_name || 'Pelanggan'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-xs text-gray-600 leading-relaxed">{review.review_text}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {lightbox.open && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
        />
      )}

      <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/customer/chat`}
            className="shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 hover:text-emerald-600 flex items-center justify-center text-gray-600 transition-colors">
              <MessageSquare size={20} />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500">Total Harga</p>
            <p className="text-sm font-bold text-gray-900">{formatPrice(service.price)}</p>
          </div>
          <Link href={`/customer/booking?vendorId=${service.vendor_id}&serviceId=${service.id}`}>
            <Button variant="pill" size="lg" className="shadow-lg shadow-emerald-900/20">
              Pesan Sekarang
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
