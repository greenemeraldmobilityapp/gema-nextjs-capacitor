'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Wrench, Zap, Droplets, Paintbrush, Star, Percent, LayoutGrid, Map as MapIcon, Wallet, PlusCircle, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useVendors, useNearbyVendors } from '@/lib/services/useVendors';
import { useActivePromos } from '@/lib/services/usePromos';
import type { VendorProfile } from '@/lib/services/useVendors';

const VendorMap = dynamic(() => import('@/components/shared/VendorMap'), { ssr: false });

const categories = [
  { id: '1', title: 'Tukang Bangunan', icon: Wrench, color: 'bg-orange-100 text-orange-600', slug: 'tukang-bangunan' },
  { id: '2', title: 'Teknisi Listrik', icon: Zap, color: 'bg-yellow-100 text-yellow-600', slug: 'teknisi-listrik' },
  { id: '3', title: 'Plumbing', icon: Droplets, color: 'bg-blue-100 text-blue-600', slug: 'plumbing' },
  { id: '4', title: 'Cat & Interior', icon: Paintbrush, color: 'bg-purple-100 text-purple-600', slug: 'cat-interior' },
];

export default function CustomerHome() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  const { data: vendors, isLoading, error } = useVendors();
  const { data: nearbyVendors } = useNearbyVendors(userLocation?.lat, userLocation?.lng);
  const { data: promos, isLoading: promosLoading } = useActivePromos();
  const promo = promos?.[0];

  const displayVendors = (userLocation ? nearbyVendors : vendors) || [];
  const topVendors = vendors?.filter((v) => (v.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0)) || [];

  const vendorCards = (list: (VendorProfile & { distance?: number })[]) =>
    list.slice(0, 5).map((vendor) => (
      <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
        <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-gray-100 shadow-sm">
          <CardContent className="p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center text-gray-500 font-bold text-xl">
              {vendor.users?.full_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
                <span className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  <Star size={12} fill="currentColor" /> {vendor.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{vendor.specialization || 'General'}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{vendor.total_jobs || 0} proyek</span>
                {vendor.distance !== undefined && vendor.distance !== null && (
                  <span className="text-emerald-600 font-medium">{vendor.distance.toFixed(1)} km</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/customer/vendor?id=${vendor.user_id}`);
                }}
                className="mt-2 w-full h-9 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:brightness-105 active:brightness-95 transition-all"
              >
                Pesan
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>
    ));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white p-4 pt-8 rounded-b-[24px] shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start gap-2">
            <MapPin size={20} className="text-emerald-100 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-emerald-100 font-medium tracking-wide uppercase">Lokasi Anda</p>
              <p className="text-sm font-semibold truncate">
                {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Memuat lokasi...'}
              </p>
            </div>
            <Link
              href="/wallet"
              className="bg-white/90 backdrop-blur-md shadow-lg shadow-emerald-900/10 rounded-lg px-3 py-2 flex items-center gap-2 ring-1 ring-white/30 hover:shadow-xl transition-all"
            >
              <div className="bg-emerald-100 rounded-full p-1.5">
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 leading-tight">GemaPay</p>
                <p className="font-heading text-sm text-gray-900 font-bold">Rp 250.000</p>
              </div>
              <PlusCircle size={16} className="text-emerald-500" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {promosLoading ? (
          <div className="w-full bg-emerald-50 rounded-[24px] p-4 border border-emerald-100 animate-pulse">
            <div className="h-6 w-32 bg-emerald-200 rounded mb-2" />
            <div className="h-4 w-48 bg-emerald-200 rounded" />
          </div>
        ) : promo ? (
          <Link href={`/wallet/promo?id=${promo.id}`}>
            <div className="w-full bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[24px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:brightness-105 transition-all group">
              <div className="text-white">
                <h3 className="font-bold text-lg">{promo.title}</h3>
                <p className="text-sm text-emerald-100">{promo.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {promo.discount}%
                </div>
                <ChevronRight size={18} className="text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/wallet/vouchers">
            <div className="w-full bg-emerald-50 rounded-[24px] p-4 border border-emerald-100 flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-600">
                  <Percent size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800">Promo untukmu</h3>
                  <p className="text-sm text-emerald-600">Lihat promo & voucher tersedia</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-emerald-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Link>
        )}

        <div className="space-y-3">
          <div className="border-l-4 border-emerald-500 pl-3">
            <h2 className="text-lg font-bold text-gray-900">Kategori</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/customer/search?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-[20px] border border-gray-100 bg-white shadow-sm cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                  <cat.icon size={22} />
                </div>
                <span className="text-[11px] font-semibold text-center text-gray-700 leading-tight">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-lg font-bold text-gray-900">Vendor Terdekat</h2>
            </div>
            <div className="flex items-center gap-2">
              {displayVendors.length > 0 && (
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  {viewMode === 'map' ? <LayoutGrid size={18} /> : <MapIcon size={18} />}
                </button>
              )}
              <Link href="/customer/search" className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
                Lihat Semua
              </Link>
            </div>
          </div>

          {isLoading && (
            <SkeletonList rows={3} />
          )}

          {error && (
            <div className="text-center py-8 text-red-400">
              <p className="text-sm">Gagal memuat data vendor</p>
            </div>
          )}

          {!isLoading && !error && displayVendors.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada vendor terdaftar</p>
            </div>
          )}

          {!isLoading && displayVendors.length > 0 && viewMode === 'map' && (
            <VendorMap
              vendors={displayVendors}
              centerOn={userLocation || undefined}
              onVendorClick={(vendorId) => router.push(`/customer/vendor?id=${vendorId}`)}
            />
          )}

          {!isLoading && displayVendors.length > 0 && (
            <div className="space-y-3">
              {vendorCards(displayVendors)}
            </div>
          )}
        </div>

        {topVendors.length > 0 && (
          <div className="space-y-3 pb-8">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-lg font-bold text-gray-900">Vendor Terbaik</h2>
            </div>
            <div className="space-y-3">
              {topVendors.slice(0, 5).map((vendor) => (
                <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
                  <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-emerald-100 shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-20 h-20 bg-emerald-50 rounded-xl shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xl">
                        {vendor.users?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
                          <Sparkles size={14} className="text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{vendor.specialization || 'General'}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm font-medium">
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Star size={14} fill="currentColor" /> {vendor.rating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600">{vendor.total_jobs || 0} proyek</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
