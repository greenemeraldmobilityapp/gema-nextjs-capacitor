'use client';

import Link from 'next/link';
import { User, Wrench, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RoleSelectionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="p-4 pt-8 sticky top-0 z-10">
        <Link href="/onboarding" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-gray-700">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pilih Peran Anda</h1>
        <p className="text-gray-500 mb-8">Pilih bagaimana Anda ingin menggunakan aplikasi GEMA.</p>

        <div className="space-y-4">
          <Link href="/register?role=customer" className="block">
            <Card className="border-2 border-transparent hover:border-emerald-500 transition-colors shadow-sm cursor-pointer rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <User size={32} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Saya Pelanggan</h2>
                  <p className="text-sm text-gray-500 mt-1">Saya ingin mencari layanan tukang atau teknisi</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/register?role=vendor" className="block">
            <Card className="border-2 border-transparent hover:border-emerald-500 transition-colors shadow-sm cursor-pointer rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <Wrench size={32} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Saya Mitra (Vendor)</h2>
                  <p className="text-sm text-gray-500 mt-1">Saya ingin menawarkan jasa perbaikan atau teknisi</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
