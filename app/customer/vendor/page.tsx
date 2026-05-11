'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, CheckCircle, ShieldCheck, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useVendor, useVendorServices } from '@/lib/services/useVendors';
import { useVendorReviews } from '@/lib/services/useReviews';

export default function VendorDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <VendorDetailContent />
    </Suspense>
  );
}

function formatPrice(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function VendorDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  
  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useVendor(id);
  const { data: services, isLoading: servicesLoading } = useVendorServices(id);
  const { data: reviews, isLoading: reviewsLoading } = useVendorReviews(id);

  if (vendorLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600 mb-3" />
        <p className="text-sm text-gray-400">Memuat profil vendor...</p>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
        <p className="text-red-400 mb-4">Vendor tidak ditemukan</p>
        <Link href="/customer/home">
          <Button variant="outline">Kembali ke Beranda</Button>
        </Link>
      </div>
    );
  }

  const initials = vendor.users?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center justify-between shrink-0">
        <Link href="/customer/home" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold">Profil Mitra</span>
        <div className="w-10"></div>
      </div>

      <div className="bg-white p-4 pb-6 border-b shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-2xl">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 leading-none mb-1">{vendor.users?.full_name || 'Unknown'}</h1>
            <p className="text-emerald-600 font-medium text-sm mb-2">{vendor.specialization || 'General'}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-gray-900">{vendor.rating?.toFixed(1) || '0.0'}</span>
              <span>({vendor.total_jobs || 0} proyek)</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-around p-3 bg-emerald-50 rounded-xl">
          <div className="flex flex-col items-center">
            <ShieldCheck size={24} className="text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-emerald-800">{vendor.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}</span>
          </div>
          <div className="w-px h-8 bg-emerald-200"></div>
          <div className="flex flex-col items-center">
            <CheckCircle size={24} className="text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-emerald-800">{vendor.total_jobs || 0} Proyek</span>
          </div>
          <div className="w-px h-8 bg-emerald-200"></div>
          <div className="flex flex-col items-center">
            <Clock size={24} className="text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-emerald-800">Aktif</span>
          </div>
        </div>
      </div>

      {vendor.bio && (
        <div className="bg-white mx-4 mt-2 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600">{vendor.bio}</p>
        </div>
      )}

      <div className="p-4 mt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Layanan yang Tersedia</h2>
        
        {servicesLoading && (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Memuat layanan...</span>
          </div>
        )}

        {!servicesLoading && (!services || services.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Belum ada layanan tersedia</p>
          </div>
        )}

        {!servicesLoading && services && (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors shadow-sm border-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 leading-tight pr-4">{service.title}</h3>
                    <span className="font-bold text-emerald-600 shrink-0">{formatPrice(service.price)}</span>
                  </div>
                  {service.description && (
                    <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                  )}
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{service.category}</span>
                    <Link href={`/customer/booking?vendorId=${id}&serviceId=${service.id}`}>
                      <Button size="sm" className="rounded-lg shadow-none bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                        Pilih
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ulasan Pelanggan</h2>

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
              {reviews.slice(0, 10).map((review) => (
                <Card key={review.id} className="rounded-xl border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {review.customer?.full_name || 'Pelanggan'}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-600">{review.review_text}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
