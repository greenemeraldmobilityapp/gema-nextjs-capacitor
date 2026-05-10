'use client';

import { MapPin, Search, Wrench, Zap, Droplets, Paintbrush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  { id: '1', title: 'Tukang Bangunan', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  { id: '2', title: 'Teknisi Listrik', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { id: '3', title: 'Plumbing', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  { id: '4', title: 'Cat & Interior', icon: Paintbrush, color: 'bg-purple-100 text-purple-600' },
];

export default function CustomerHome() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header / Location */}
      <div className="bg-emerald-500 text-white p-4 pt-8 rounded-b-[24px] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-emerald-100" />
          <div className="flex-1">
            <p className="text-xs text-emerald-100 font-medium tracking-wide uppercase">Current Location</p>
            <p className="text-sm font-semibold truncate">Jl. Sudirman No 123, Jakarta</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mt-2 mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Search for services or vendors..." 
            className="pl-10 h-12 bg-white text-gray-900 border-none rounded-xl shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Promo Banner */}
        <div className="w-full bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-emerald-800 text-lg">Diskon 50%</h3>
            <p className="text-sm text-emerald-600">Untuk pengguna baru GEMA!</p>
          </div>
          <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
            %
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${cat.color}`}>
                  <cat.icon size={24} />
                </div>
                <span className="text-[11px] font-medium text-center text-gray-700 leading-tight">
                  {cat.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Vendors (Mock) */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Nearby Vendors</h2>
            <span className="text-sm text-emerald-600 font-medium cursor-pointer">See all</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Budi Teknik</h3>
                    <p className="text-sm text-gray-500">Teknisi Listrik & AC</p>
                    <div className="flex items-center gap-2 mt-2 text-sm font-medium">
                      <span className="text-yellow-500 flex items-center gap-1">★ 4.8</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">1.2 km away</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
