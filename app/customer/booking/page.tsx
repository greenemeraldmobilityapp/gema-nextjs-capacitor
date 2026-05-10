'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState('');
  
  // Hardcoded for demo purposes
  const dt = new Date();
  dt.setHours(dt.getHours() + 1);
  const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/vendor?id=${searchParams.get('vendorId') || '1'}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Detail Pesanan</span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Service Details */}
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-1">Perbaikan AC Bocor</h3>
            <p className="text-sm text-gray-500 mb-4">Budi Teknik</p>
            
            <div className="w-full h-px bg-gray-100 mb-4"></div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Biaya Layanan</span>
              <span className="font-semibold text-gray-900">Rp 150.000</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Biaya Platform</span>
              <span className="font-semibold text-gray-900">Rp 5.000</span>
            </div>
            <div className="w-full h-px bg-gray-100 my-4"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Pembayaran</span>
              <span className="font-bold text-emerald-600 text-lg">Rp 155.000</span>
            </div>
          </CardContent>
        </Card>

        {/* Location Detials */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 px-1">Lokasi Pengerjaan</label>
          <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-3 items-start relative">
            <MapPin size={20} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Rumah</p>
              <p className="text-sm text-gray-500 leading-snug mt-1">Jl. Sudirman No 123, Jakarta Selatan (Patokan depan minimarket)</p>
            </div>
          </div>
        </div>

        {/* Time Schedule */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 px-1">Waktu Kedatangan</label>
          <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm">Hari ini, Segera</p>
                <p className="text-xs text-gray-500">Estimasi tiba pukul {timeStr}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Ubah</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 pb-8">
          <label className="text-sm font-bold text-gray-900 px-1">Catatan Tambahan (Opsional)</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none h-24"
            placeholder="Tulis instruksi tambahan untuk vendor..."
          ></textarea>
        </div>
      </div>

      <div className="p-4 bg-white border-t space-y-3 shrink-0">
        <Link href={`/customer/payment?amount=155000`} className="block w-full">
          <Button className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm">
            Lanjut ke Pembayaran
          </Button>
        </Link>
      </div>
    </div>
  );
}
