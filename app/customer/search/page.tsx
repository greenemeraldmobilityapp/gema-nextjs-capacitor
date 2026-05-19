'use client';

import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, X, ChevronDown, MapPinned, GripHorizontal, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearchVendors, useSearchFilterOptions, useDebounce } from '@/lib/services/useSearchVendors';
import { useLocationStore } from '@/store/location';
import type { SearchFilters } from '@/lib/services/useSearchVendors';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <SearchContent />
    </Suspense>
  );
}

const chips = [
  { label: 'Semua', value: '' },
  { label: 'Tukang Bangunan', value: 'tukang-bangunan' },
  { label: 'Teknisi Listrik', value: 'teknisi-listrik' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Cat & Interior', value: 'cat-interior' },
  { label: 'AC & Kulkas', value: 'ac-kulkas' },
  { label: 'Elektronik', value: 'elektronik' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Pest Control', value: 'pest-control' },
];

const ratingOptions = [
  { label: 'Semua', value: 0 },
  { label: '4+', value: 4 },
  { label: '3+', value: 3 },
  { label: '2+', value: 2 },
];

const sortOptions = [
  { label: 'Relevansi', value: 'relevance' as const },
  { label: 'Terdekat', value: 'nearest' as const },
  { label: 'Rating', value: 'rating' as const },
  { label: 'Proyek', value: 'jobs' as const },
  { label: 'Terbaru', value: 'newest' as const },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebounce(rawQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const userLat = useLocationStore((s) => s.lat);
  const userLng = useLocationStore((s) => s.lng);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ city: string; district: string; minRating: number; sort: 'relevance' | 'rating' | 'jobs' | 'newest' | 'nearest' }>({
    city: '',
    district: '',
    minRating: 0,
    sort: 'relevance',
  });
  const [tempFilters, setTempFilters] = useState(filters);

  const { data: filterOptions } = useSearchFilterOptions();
  const { data: results, isLoading } = useSearchVendors({
    query,
    category: categoryParam || undefined,
    city: filters.city || undefined,
    district: filters.district || undefined,
    minRating: filters.minRating || undefined,
    sort: filters.sort,
    page: 1,
    lat: filters.sort === 'nearest' && userLat !== null ? userLat : undefined,
    lng: filters.sort === 'nearest' && userLng !== null ? userLng : undefined,
  });

  const activeChip = categoryParam || '';
  const hasActiveFilters = filters.city || filters.district || filters.minRating > 0 || filters.sort !== 'relevance';

  const openFilter = () => { setTempFilters(filters); setFilterOpen(true); };
  const applyFilters = () => { setFilters(tempFilters); setFilterOpen(false); };
  const resetFilters = () => { setTempFilters({ city: '', district: '', minRating: 0, sort: 'relevance' }); };
  const resetAll = () => { setRawQuery(''); setFilters({ city: '', district: '', minRating: 0, sort: 'relevance' }); inputRef.current?.focus(); };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-600 text-white p-4 pt-8 pb-8 rounded-b-[24px] shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-300/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl font-heading font-bold">Cari Layanan</h1>
          <p className="text-emerald-100 text-sm mt-1">Temukan tukang terbaik di dekat Anda</p>
        </div>
      </div>

      <div className="-mt-6 px-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/8 border border-gray-100 p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <SearchIcon size={18} className="text-emerald-500" />
          </div>
          <input
            ref={inputRef}
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            type="text"
            placeholder="Cari vendor, layanan, atau spesialisasi..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {rawQuery && (
            <button onClick={() => setRawQuery('')} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
              <X size={16} />
            </button>
          )}
          <div className="w-px h-8 bg-gray-200" />
          <button
            onClick={openFilter}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              hasActiveFilters
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
          {chips.map((chip) => (
            <Link
              key={chip.value}
              href={chip.value ? `/customer/search?category=${chip.value}` : '/customer/search'}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeChip === chip.value
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 flex gap-4 shadow-sm border border-gray-100">
                <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-gray-500">{results.length} vendor ditemukan</span>
              </div>
              {hasActiveFilters && (
                <button onClick={resetAll} className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 transition-colors">
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>
            {results.map((vendor) => (
              <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
                <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-gray-100 shadow-sm">
                  <CardContent className="p-4 flex gap-4">
                    {vendor.avatar_url ? (
                      <img src={vendor.avatar_url} alt={vendor.full_name || ''} className="w-16 h-16 rounded-xl shrink-0 object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 flex items-center justify-center font-bold text-xl">
                        {vendor.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">{vendor.full_name || 'Unknown'}</h3>
                          <p className="text-sm font-medium text-emerald-600 mt-0.5 truncate">{vendor.specialization || 'General'}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{vendor.total_jobs || 0} proyek</span>
                        </div>
                        {vendor.min_price > 0 && (
                          <div className="text-xs font-medium text-emerald-600">
                            Rp {vendor.min_price.toLocaleString('id-ID')}+
                          </div>
                        )}
                        {vendor.is_verified && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Terverifikasi</span>
                        )}
                        {vendor.address_city && (
                          <span className="text-xs text-gray-400 truncate max-w-[120px]">{vendor.address_city}</span>
                        )}
                        {vendor.distance_km !== null && vendor.distance_km !== undefined && (
                          <span className="text-xs font-medium text-emerald-600">{vendor.distance_km.toFixed(1)} km</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-16">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={36} className="text-orange-300" />
            </div>
            <p className="font-medium text-gray-600">
              {rawQuery || activeChip || hasActiveFilters ? 'Tidak ada hasil' : 'Belum ada vendor terdaftar'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {rawQuery || activeChip || hasActiveFilters
                ? `Tidak ditemukan untuk "${rawQuery || chips.find(c => c.value === activeChip)?.label || 'filter ini'}"`
                : 'Vendor akan muncul setelah terdaftar dan terverifikasi'}
            </p>
            {(rawQuery || activeChip || hasActiveFilters) && (
              <button onClick={resetAll} className="mt-4 inline-block text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-6 py-2 hover:bg-emerald-100 transition-colors">
                Hapus Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* ====== Backdrop ====== */}
      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* ====== Bottom Sheet ====== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[80vh] flex flex-col ${
          filterOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col items-center pt-3 pb-1 shrink-0" onClick={() => setFilterOpen(false)}>
          <div className="w-10 h-1 bg-gray-300 rounded-full cursor-pointer" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 shrink-0 border-b border-gray-100">
          <h2 className="text-lg font-heading font-bold text-gray-900">Filter</h2>
          <div className="flex items-center gap-3">
            <button onClick={applyFilters} className="text-sm font-semibold text-white bg-emerald-600 px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
              Terapkan
            </button>
            <button onClick={resetFilters} className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 transition-colors">
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-5">
          {/* Lokasi */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPinned size={16} className="text-emerald-500" />
              Kota
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTempFilters({ ...tempFilters, city: '', district: '' })}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  !tempFilters.city ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {(filterOptions?.cities || []).map((city) => (
                <button
                  key={city}
                  onClick={() => setTempFilters({ ...tempFilters, city: city === tempFilters.city ? '' : city, district: '' })}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    tempFilters.city === city ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              Rating Minimal
            </label>
            <div className="flex gap-2">
              {ratingOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTempFilters({ ...tempFilters, minRating: tempFilters.minRating === opt.value ? 0 : opt.value })}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    tempFilters.minRating === opt.value ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label === 'Semua' ? 'Semua' : `⭐ ${opt.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Urutkan */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <SlidersHorizontal size={16} className="text-emerald-500" />
              Urutkan
            </label>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTempFilters({ ...tempFilters, sort: opt.value })}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    tempFilters.sort === opt.value ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
