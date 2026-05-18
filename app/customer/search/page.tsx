'use client';

import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVendors } from '@/lib/services/useVendors';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const [query, setQuery] = useState(categoryParam);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: vendors, isLoading } = useVendors();

  useEffect(() => {
    if (categoryParam && !query) {
      setQuery(categoryParam);
    }
  }, [categoryParam]);

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

  const activeChip = categoryParam || '';
  const filteredVendors = (vendors || []).filter((vendor) => {
    const nameMatch = vendor.users?.full_name?.toLowerCase().includes(query.toLowerCase());
    const specMatch = vendor.specialization?.toLowerCase().includes(query.toLowerCase());
    const hasMatchingService = (vendor.services || []).some(s => s.category === activeChip);
    const categoryMatch = activeChip
      ? hasMatchingService || vendor.specialization?.toLowerCase().replace(/\s+/g, '-') === activeChip.toLowerCase()
      : true;
    return (nameMatch || specMatch) && (!activeChip || categoryMatch);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 pb-8 text-white rounded-b-[24px] shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Cari layanan..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
              <X size={16} />
            </button>
          )}
          <div className="w-px h-8 bg-gray-200" />
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 relative">
          <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
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
        ) : !query.trim() && !activeChip ? (
          <div className="text-center text-gray-500 mt-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={36} className="text-emerald-300" />
            </div>
            <p className="font-medium text-gray-600">Cari layanan atau vendor</p>
            <p className="text-sm text-gray-400 mt-1">Temukan tukang terbaik di dekat Anda</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              <span className="text-sm font-medium text-gray-500">{filteredVendors.length} vendor ditemukan</span>
            </div>
            {filteredVendors.map((vendor) => (
              <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
                <Card className="rounded-[24px] overflow-hidden cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-gray-100 shadow-sm">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {vendor.users?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
                        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-emerald-600 mt-0.5">{vendor.specialization || 'General'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{vendor.total_jobs || 0} proyek</span>
                        </div>
                        {vendor.is_verified && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Terverifikasi</span>
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
            <p className="font-medium text-gray-600">Tidak ada hasil</p>
            <p className="text-sm text-gray-400 mt-1">Tidak ditemukan untuk &ldquo;{query}&rdquo;</p>
            <button onClick={() => setQuery('')} className="mt-4 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-6 py-2 hover:bg-emerald-100 transition-colors">
              Hapus Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
