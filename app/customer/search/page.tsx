'use client';

import { Search as SearchIcon, MapPin, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const allVendors = [
    { id: 1, name: 'Budi Teknik', category: 'Teknisi Listrik', rating: 4.8, distance: 1.2, address: 'Jl. Ahmad Yani' },
    { id: 2, name: 'Adi AC Specialist', category: 'Teknisi AC', rating: 4.9, distance: 3.5, address: 'Jl. Sudirman' },
    { id: 3, name: 'Karya Bangunan', category: 'Tukang Bangunan', rating: 4.5, distance: 2.1, address: 'Jl. Melati' },
    { id: 4, name: 'Tirta Putera', category: 'Plumbing', rating: 4.7, distance: 4.0, address: 'Jl. Mawar' },
  ];

  const filteredVendors = query.trim() ? allVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(query.toLowerCase()) || 
    vendor.category.toLowerCase().includes(query.toLowerCase())
  ) : [];

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
        {!query.trim() ? (
          <div className="text-center text-gray-500 mt-20">
            <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Mulai cari tukang atau layanan di sekitar Anda.</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="space-y-4 mt-2">
            <h2 className="text-sm font-bold text-gray-900">Hasil Pencarian ({filteredVendors.length})</h2>
            {filteredVendors.map(vendor => (
              <Card key={vendor.id} className="rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors border-none shadow-sm">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {vendor.name.substring(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-emerald-600">{vendor.category}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{vendor.distance} km • {vendor.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
