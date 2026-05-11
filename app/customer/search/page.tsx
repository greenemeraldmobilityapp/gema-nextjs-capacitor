'use client';

import { Search as SearchIcon, MapPin, Star, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVendors } from '@/lib/services/useVendors';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const [query, setQuery] = useState(categoryParam);
  const { data: vendors, isLoading } = useVendors();

  useEffect(() => {
    if (categoryParam && !query) {
      setQuery(categoryParam);
    }
  }, [categoryParam]);

  const filteredVendors = (vendors || []).filter((vendor) => {
    const nameMatch = vendor.users?.full_name?.toLowerCase().includes(query.toLowerCase());
    const specMatch = vendor.specialization?.toLowerCase().includes(query.toLowerCase());
    const categoryMatch = categoryParam
      ? vendor.specialization?.toLowerCase().replace(/\s+/g, '-') === categoryParam.toLowerCase()
      : true;
    return (nameMatch || specMatch) && (!categoryParam || categoryMatch);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-4">Cari Layanan</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text" 
            placeholder="Ketik layanan yang Anda butuhkan..." 
            className="pl-10 h-12 bg-white text-gray-900 border-none rounded-xl shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="p-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Memuat vendor...</span>
          </div>
        ) : !query.trim() && !categoryParam ? (
          <div className="text-center text-gray-500 mt-20">
            <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Mulai cari tukang atau layanan di sekitar Anda.</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="space-y-4 mt-2">
            <h2 className="text-sm font-bold text-gray-900">Hasil Pencarian ({filteredVendors.length})</h2>
            {filteredVendors.map((vendor) => (
              <Link key={vendor.user_id} href={`/customer/vendor?id=${vendor.user_id}`}>
                <Card className="rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors border-none shadow-sm">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {vendor.users?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">{vendor.users?.full_name || 'Unknown'}</h3>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-emerald-600">{vendor.specialization || 'General'}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{vendor.total_jobs || 0} proyek</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Tidak ada hasil untuk "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
