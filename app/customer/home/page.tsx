'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { MapPin, Star, LayoutGrid, Map as MapIcon, Wallet, ChevronRight, Sparkles, Search, AlertCircle, ChevronDown, Store, Bell } from 'lucide-react';
import NotifBell from '@/components/shared/NotifBell';
import { PromoCarousel } from '@/components/shared/PromoCarousel';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useVendors, useNearbyVendors } from '@/lib/services/useVendors';
import { useActivePromos } from '@/lib/services/usePromos';
import { useWallet } from '@/lib/services/useWallet';
import { useCategories } from '@/lib/services/useCategories';
import { useAuthStore } from '@/store/auth';
import { useLocationStore } from '@/store/location';
import { getCategoryIcon, getCategoryColor } from '@/lib/category-utils';
import type { VendorProfile } from '@/lib/services/useVendors';

const VendorMap = dynamic(() => import('@/components/shared/VendorMap'), { ssr: false });

export default function CustomerHome() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const isVendor = useAuthStore((s) => s.isVendor);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const userLocation = useLocationStore((s) => s.lat !== null && s.lng !== null ? { lat: s.lat, lng: s.lng } : null);
  const setLocation = useLocationStore((s) => s.setLocation);
  const lastFetched = useLocationStore((s) => s.lastFetched);
  useEffect(() => {
    if (navigator.geolocation) {
      const now = Date.now();
      if (lastFetched && now - lastFetched < 300000) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, [setLocation, lastFetched]);

  const { data: vendors, isLoading, error } = useVendors();
  const { data: nearbyVendors } = useNearbyVendors(userLocation?.lat, userLocation?.lng);
  const { data: promos, isLoading: promosLoading } = useActivePromos();
  const { data: wallet } = useWallet(profile?.id);
  const { data: categories = [] } = useCategories();

  const { data: categoryPopularity } = useQuery({
    queryKey: ['category-popularity'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('orders').select('service_category');
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const o of data || []) {
        const cat = o.service_category;
        counts[cat] = (counts[cat] || 0) + 1;
      }
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });

  const sortedCategories = useMemo(() => {
    if (!categoryPopularity) return categories;
    return [...categories].sort((a, b) => {
      const freqA = categoryPopularity[a.slug] || 0;
      const freqB = categoryPopularity[b.slug] || 0;
      return freqB - freqA;
    });
  }, [categories, categoryPopularity]);

  const displayVendors = (userLocation ? nearbyVendors : vendors) || [];
  const topVendors = [...(vendors || [])].sort((a, b) => {
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (b.total_jobs || 0) - (a.total_jobs || 0);
  });

  const vendorCards = (list: (VendorProfile & { distance?: number })[]) =>
    list.slice(0, 5).map((vendor) => (
      <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
        <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-gray-100 shadow-sm">
          <CardContent className="py-2 px-3 flex gap-2.5 items-start">
            {vendor.avatar_url ? (
                        <Image src={vendor.avatar_url} alt={vendor.users?.full_name || ''} width={64} height={64} className="w-16 h-16 rounded-lg shrink-0 object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-500 font-bold text-xl">
                {vendor.users?.full_name?.charAt(0) || '?'}
              </div>
            )}
            <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 items-start min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
              <span className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                <Star size={12} className="text-yellow-500" fill="currentColor" /> {vendor.rating?.toFixed(1) || '0.0'}
              </span>
              <p className="text-xs text-gray-500">{vendor.specialization || 'General'}</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/customer/vendor?id=${vendor.user_id}`);
                }}
                className="shrink-0 px-4 h-8 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white text-xs font-semibold shadow-sm hover:brightness-105 active:brightness-95 transition-all"
              >
                Pesan
              </button>
              <div className="flex items-center gap-2 text-xs text-gray-500 col-span-2">
                <span>{vendor.total_jobs || 0} proyek</span>
                {vendor.distance !== undefined && vendor.distance !== null && (
                  <span className="text-emerald-600 font-medium">{vendor.distance.toFixed(1)} km</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    ));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-600 text-white p-4 pt-6 pb-7 rounded-b-[24px] shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <MapPin size={18} className="text-emerald-100 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-medium tracking-wider uppercase">Lokasi</p>
                <p className="text-sm font-semibold truncate">
                  {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Memuat lokasi...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotifBell href="/customer/notifications" />
              <Link
                href="/customer/profile"
                className="flex items-center gap-1.5 shrink-0 bg-emerald-900/40 backdrop-blur-xl rounded-full pl-3 pr-1 py-1 border border-white/15 hover:bg-emerald-900/50 transition-all duration-300 group"
              >
              <span className="text-sm font-semibold truncate max-w-[72px]">{profile?.full_name?.split(' ')[0] || 'User'}</span>
              <ChevronDown size={14} className="text-white/60 group-hover:text-white/90 transition-colors" />
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.full_name || ''} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </Link>
            </div>
          </div>

          <div className="rounded-3xl shadow-lg shadow-black/10 overflow-hidden bg-emerald-900/40 backdrop-blur-xl border border-white/15 hover:bg-emerald-900/50 transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 75% 30%, white 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
            <div className="relative p-4">
              <div className="flex items-center justify-between">
                <Link href="/wallet" className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Wallet size={14} className="text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-semibold">Saldo GemaPay</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-heading text-white drop-shadow-sm">
                      Rp {(wallet?.balance || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="mt-1.5">
                      <p className="text-emerald-200/80 text-[11px]">Saldo siap digunakan</p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/wallet/topup"
                  className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-lg shadow-emerald-900/20 backdrop-blur-sm"
                >
                  + Top Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-8 px-4 relative z-20">
        <Link
          href="/customer/search"
          className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-xl shadow-emerald-900/8 border border-emerald-500/10 cursor-pointer hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
            <Search size={16} className="text-emerald-500" />
          </div>
          <span className="text-sm text-gray-400 flex-1">Cari layanan...</span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
            <span className="hidden sm:inline">Cari</span>
            <Search size={14} />
          </div>
        </Link>
      </div>

      <div className="p-4 space-y-6">
        {!isVendor && (
          <Link
            href="/customer/register-vendor"
            className="block w-full bg-white border border-emerald-500 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
                  <Store size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">Daftar sebagai Mitra Kami</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">Gabung dan mulai dapatkan penghasilan dari keahlianmu</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                  <span className="text-white font-bold text-sm">Daftar</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </Link>
        )}

        <PromoCarousel promos={promos} isLoading={promosLoading} />

        <div className="space-y-3">
          <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-base font-heading font-bold text-gray-900">Kategori</h2>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {sortedCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/customer/search?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-2.5 rounded-2xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getCategoryColor(cat.slug)}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-semibold text-center text-gray-700 leading-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-base font-heading font-bold text-gray-900">Vendor Terdekat</h2>
            </div>
            <div className="flex items-center gap-2">
              {displayVendors.length > 0 && (
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                  className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  {viewMode === 'map' ? <LayoutGrid size={16} /> : <MapIcon size={16} />}
                  {viewMode === 'map' ? 'Daftar' : 'Lihat Peta'}
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
            <div className="flex flex-col items-center py-8 text-red-400">
              <AlertCircle size={32} className="mb-2 opacity-50" />
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

          {!isLoading && displayVendors.length > 0 && viewMode === 'list' && (
            <div className="space-y-3">
              {vendorCards(displayVendors)}
            </div>
          )}
        </div>

        {topVendors.length > 0 && (
          <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-emerald-500 pl-3">
              <h2 className="text-base font-heading font-bold text-gray-900">Vendor Terbaik</h2>
            </div>
            <Link href="/customer/search?sort=rating" className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
              Lihat Semua
            </Link>
          </div>
            <div className="space-y-3">
              {topVendors.slice(0, 5).map((vendor) => (
                <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
                  <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-emerald-100 shadow-sm">
                    <CardContent className="py-2 px-3 flex gap-2.5">
                      {vendor.avatar_url ? (
              <Image src={vendor.avatar_url} alt={vendor.users?.full_name || ''} width={64} height={64} className="w-16 h-16 rounded-lg shrink-0 object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-emerald-50 rounded-lg shrink-0 flex items-center justify-center text-emerald-600 font-bold text-xl">
                          {vendor.users?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
                          <Sparkles size={12} className={vendor.rating && vendor.rating > 0 ? 'text-emerald-500 shrink-0' : 'text-gray-300 shrink-0'} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{vendor.specialization || 'General'}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-medium">
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star size={12} fill="currentColor" /> {vendor.rating?.toFixed(1) || '0.0'}
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
