'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Star, MapPin, ShieldCheck, Clock, Loader2, MessageSquare, Crown, Briefcase, Calendar, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVendor, useVendorActiveServices, useVendorCompletedProjects, haversineDistance } from '@/lib/services/useVendors';
import { useVendorReviews } from '@/lib/services/useReviews';
import { useLocationStore } from '@/store/location';
import ImageLightbox from '@/components/shared/ImageLightbox';

export default function VendorDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <VendorDetailContent />
    </Suspense>
  );
}

function formatPrice(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function VendorDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';

  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useVendor(id);
  const { data: services, isLoading: servicesLoading } = useVendorActiveServices(id);
  const { data: reviews, isLoading: reviewsLoading } = useVendorReviews(id);
  const { data: completedProjects, isLoading: projectsLoading } = useVendorCompletedProjects(id);
  const userLocation = useLocationStore((s) => s.lat !== null && s.lng !== null ? { lat: s.lat, lng: s.lng } : null);

  const distance = vendor?.users?.lat && vendor?.users?.lng && userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, vendor.users.lat, vendor.users.lng)
    : null;

  const prices = services?.map((s) => s.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  const reviewDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews?.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) reviewDist[r.rating as keyof typeof reviewDist]++;
  });
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const [lightbox, setLightbox] = useState<{ open: boolean; images: { image_url: string }[]; index: number }>({ open: false, images: [], index: 0 });

  if (vendorLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-600 p-4 pt-8 pb-6 rounded-b-[24px]">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
            <Skeleton className="w-24 h-5 rounded bg-white/20" />
            <div className="w-10" />
          </div>
          <div className="rounded-3xl overflow-hidden bg-white/10 p-4 space-y-4">
            <div className="flex gap-4 items-start">
              <Skeleton className="w-20 h-20 rounded-2xl bg-white/20" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="w-32 h-5 rounded bg-white/20" />
                <Skeleton className="w-24 h-3 rounded bg-white/10" />
                <Skeleton className="w-20 h-3 rounded bg-white/10" />
              </div>
            </div>
            <div className="flex items-center justify-around p-3 bg-white/10 rounded-xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-9 h-9 rounded-lg bg-white/20" />
                  <Skeleton className="w-14 h-2.5 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mitra Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">Mitra yang Anda cari tidak tersedia atau telah dihapus</p>
          <Link href="/customer/home">
            <Button variant="pill" className="w-full">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = vendor.users?.full_name?.split(' ').map((n) => n[0]).join('') || '?';
  const joinDate = vendor.users?.created_at
    ? new Date(vendor.users.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8faf8]">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-600 text-white rounded-b-[24px] shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-4 pt-8 pb-2">
            <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-heading font-bold">Profil Mitra</span>
            <div className="w-10" />
          </div>

          <div className="px-4 pb-6">
            <div className="rounded-3xl overflow-hidden bg-emerald-900/40 backdrop-blur-xl border border-white/15 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 75% 30%, white 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
              <div className="relative p-4 space-y-4">
                <div className="flex gap-4 items-start">
                  {vendor.avatar_url ? (
                    <div className="relative shrink-0">
                      <Image src={vendor.avatar_url} alt={vendor.users?.full_name || ''} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/30" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-emerald-700/60 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-white/30">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-heading font-bold leading-tight truncate">{vendor.users?.full_name || 'Unknown'}</h1>
                      {vendor.is_verified && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 rounded-full shadow-sm">
                          <Crown size={10} /> Pro
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-100/90 font-medium text-sm mt-1.5">{vendor.specialization || 'General'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-sm">{vendor.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="text-white/30">•</span>
                      <span className="text-sm text-white/70">{vendor.total_jobs || 0} proyek</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-around p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/25 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-blue-200" />
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">{vendor.is_verified ? 'Terverifikasi' : 'Belum Verif'}</span>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/25 flex items-center justify-center">
                      <Briefcase size={18} className="text-emerald-200" />
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">{vendor.total_jobs || 0} Proyek</span>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/25 flex items-center justify-center">
                      <Clock size={18} className="text-amber-200" />
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">Aktif</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <div className="flex items-center gap-1">
                    {distance !== null && (
                      <span className="flex items-center gap-1"><MapPin size={12} /> {distance.toFixed(1)} km</span>
                    )}
                  </div>
                  {joinDate && (
                    <span className="flex items-center gap-1"><Calendar size={12} /> Bergabung {joinDate}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {vendor.bio && (
        <div className="px-4 -mt-2">
          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Tentang</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{vendor.bio}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6 pb-28">
        <div className="space-y-3">
          <div className="border-l-4 border-emerald-500 pl-3">
            <h2 className="text-base font-heading font-bold text-gray-900">Layanan Tersedia</h2>
          </div>

          {servicesLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Memuat layanan...</span>
            </div>
          )}

          {!servicesLoading && (!services || services.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada layanan tersedia</p>
            </div>
          )}

          {!servicesLoading && services && services.length > 0 && (
            <div className="space-y-3 pb-24">
              {services.map((service) => (
                <Card key={service.id} className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-gray-100 shadow-sm">
                  <CardContent className="p-0">
                    {service.service_images && service.service_images.length > 0 ? (
                      <div className="relative w-full h-44 bg-gray-100 overflow-x-auto snap-x snap-mandatory scrollbar-none select-none"
                        onScroll={(e) => {
                          const el = e.currentTarget;
                          const idx = Math.round(el.scrollLeft / el.clientWidth);
                          const dotIdx = el.querySelector(`[data-dot-idx="${idx}"]`);
                          if (dotIdx) {
                            el.querySelectorAll('[data-dot]').forEach((d) => d.classList.remove('bg-white', 'scale-110'));
                            dotIdx.classList.add('bg-white', 'scale-110');
                            dotIdx.classList.remove('bg-white/50');
                          }
                        }}
                      >
                        {service.service_images.map((img, idx) => (
                          <div
                            key={idx}
                            className="snap-center shrink-0 w-full h-full inline-flex cursor-pointer"
                            onClick={() => setLightbox({ open: true, images: service.service_images || [], index: idx })}
                          >
                            <img
                              src={img.image_url}
                              alt={`${service.title} ${idx + 1}`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        {service.service_images.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {service.service_images.map((_, idx) => (
                              <button
                                key={idx}
                                data-dot={true}
                                data-dot-idx={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const parent = e.currentTarget.closest('.snap-x');
                                  if (parent) {
                                    parent.scrollTo({ left: idx * parent.clientWidth, behavior: 'smooth' });
                                  }
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  idx === 0 ? 'bg-white scale-110' : 'bg-white/50'
                                }`}
                                aria-label={`Gambar ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}

                    <Link href={`/customer/booking?vendorId=${id}&serviceId=${service.id}`} className="block">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-bold text-gray-900 leading-tight">{service.title}</h3>
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">{service.category}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          {service.duration_minutes ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                              <Clock size={14} className="text-gray-400" />
                              <span>{service.duration_minutes < 60 ? `${service.duration_minutes} menit` : service.duration_minutes < 1440 ? `${Math.round(service.duration_minutes / 60)} jam` : `${Math.round(service.duration_minutes / 1440)} hari`}</span>
                            </div>
                          ) : (
                            <div />
                          )}
                          <span className="text-lg font-bold text-emerald-600">{formatPrice(service.price)}</span>
                        </div>

                        {service.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{service.description}</p>
                        )}

                        <div className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center gap-2 text-white font-semibold text-sm transition-colors">
                          Pesan Sekarang
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-base font-heading font-bold text-gray-900">Proyek Selesai</h2>
            </div>
            {completedProjects && completedProjects.length > 0 && (
              <Link href={`/customer/vendor/projects?vendor_id=${id}`}
                className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
                Lihat Semua
              </Link>
            )}
          </div>

          {projectsLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-[16px]" />
              ))}
            </div>
          )}

          {!projectsLoading && completedProjects && completedProjects.length > 0 && (
            <div className="space-y-3 pb-4">
              <p className="text-xs text-gray-500">{completedProjects.length} proyek telah diselesaikan</p>
              {completedProjects.slice(0, 5).map((project) => (
                <Card key={project.id} className="rounded-[16px] border border-gray-100 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {project.customer?.avatar_url ? (
                          <Image src={project.customer.avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                            {project.customer?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {project.customer?.full_name || 'Pelanggan'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {project.completed_at
                              ? new Date(project.completed_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                              : '-'}
                          </p>
                        </div>
                      </div>
                      {project.reviews?.[0] && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} className={s <= project.reviews[0].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Briefcase size={14} className="text-gray-400 shrink-0" />
                      <span>{project.service_name}</span>
                    </div>

                    {project.reviews?.[0]?.review_text && (
                      <p className="text-xs text-gray-500 italic leading-relaxed border-l-2 border-gray-200 pl-3">
                        &ldquo;{project.reviews[0].review_text}&rdquo;
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!projectsLoading && (!completedProjects || completedProjects.length === 0) && (
            <div className="text-center py-6 text-gray-400 pb-4">
              <Briefcase size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada proyek selesai</p>
            </div>
          )}
        </div>

        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-base font-heading font-bold text-gray-900">Ulasan Pelanggan</h2>
            </div>
            {reviews && reviews.length > 0 && (
              <Link href={`/customer/reviews?vendor_id=${id}`} className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
                Lihat Semua
              </Link>
            )}
          </div>

          {reviewsLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Memuat ulasan...</span>
            </div>
          )}

          {!reviewsLoading && (!reviews || reviews.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada ulasan</p>
            </div>
          )}

          {!reviewsLoading && reviews && reviews.length > 0 && (
            <div className="space-y-3">
              <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
                <div className="flex gap-6 items-start">
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-heading font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= Math.round(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{reviews.length} ulasan</p>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0 pt-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewDist[star as keyof typeof reviewDist];
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-5 shrink-0 text-right">{star}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-7 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {reviews.slice(0, 3).map((review) => (
                <Card key={review.id} className="rounded-[16px] border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {review.customer?.avatar_url ? (
                          <Image src={review.customer.avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                            {review.customer?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {review.customer?.full_name || 'Pelanggan'}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
          <Link href="/customer/chat" className="shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 hover:text-emerald-600 flex items-center justify-center text-gray-600 transition-colors">
              <MessageSquare size={20} />
            </div>
          </Link>
          {services && services.length > 0 && minPrice !== null && maxPrice !== null ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500">Mulai dari</p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {minPrice !== maxPrice ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` : formatPrice(minPrice)}
                </p>
              </div>
              <Link href={`/customer/booking?vendorId=${id}&serviceId=${services[0].id}`}>
                <Button variant="pill" size="lg" className="shadow-lg shadow-emerald-900/20">
                  Pesan Sekarang
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex-1">
              <p className="text-sm text-gray-500">Belum ada layanan tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
