'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
          <Wrench size={64} className="text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Temukan Vendor Terpercaya</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          GEMA membantu Anda menemukan teknisi, tukang, dan layanan perbaikan terbaik di sekitar lokasi Anda.
        </p>

        <div className="space-y-4 w-full max-w-xs text-left mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">Layanan berbasis lokasi realtime</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">Semua vendor terverifikasi (KYC)</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-safe bg-white border-t space-y-3 shrink-0">
        <Link href="/register/role" className="block w-full">
          <Button className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold">
            Mulai Sekarang
          </Button>
        </Link>
        <div className="text-center">
          <span className="text-sm text-gray-500">Sudah punya akun? </span>
          <Link href="/login" className="text-sm font-bold text-emerald-600 hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
