'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, Smartphone, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SecuritySettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Keamanan</span>
      </div>

      <div className="p-4 space-y-4">
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-100">
            <Link href="#" className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Ubah Kata Sandi</h3>
                  <p className="text-xs text-gray-500">Terakhir diubah 30 hari yang lalu</p>
                </div>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Autentikasi 2 Langkah</h3>
                  <p className="text-xs text-emerald-600 font-medium">Aktif</p>
                </div>
              </div>
            </Link>

            <Link href="#" className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Perangkat Aktif</h3>
                  <p className="text-xs text-gray-500">1 perangkat terhubung</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full h-14 rounded-xl text-red-600 font-bold border-red-200 hover:bg-red-50 hover:text-red-700 bg-white">
          Hapus Akun
        </Button>
      </div>
    </div>
  );
}
