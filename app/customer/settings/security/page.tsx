'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Smartphone, ShieldCheck, ChevronRight, LogOut, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const [biometric, setBiometric] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Keamanan</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="font-bold text-emerald-800 text-sm">Akun Terlindungi</p>
            <p className="text-xs text-emerald-600 mt-0.5">Keamanan akun Anda dalam kondisi baik</p>
          </div>
        </div>

        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-100">
            <Link href="/customer/settings/security/change-password" className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Kata Sandi</h3>
                  <p className="text-xs text-gray-500">Atur atau ubah kata sandi akun</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </Link>

            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Keamanan Biometrik</h3>
                  <p className="text-xs text-gray-500">Gunakan sidik jari atau wajah</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometric}
                  onChange={() => setBiometric(!biometric)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </label>

            <Link href="#" onClick={(e) => { e.preventDefault(); toast.info('Segera hadir'); }} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Autentikasi 2 Faktor</h3>
                  <p className="text-xs text-emerald-600 font-medium">Aktif</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </Link>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-bold text-gray-700 px-1 mb-2">Aktivitas</h3>
          <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-100">
              <Link href="#" onClick={(e) => { e.preventDefault(); toast.info('Segera hadir'); }} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Perangkat Terdaftar</h3>
                    <p className="text-xs text-gray-500">1 perangkat terhubung</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </Link>

              <Link href="#" onClick={(e) => { e.preventDefault(); toast.info('Segera hadir'); }} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                    <LogOut size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Aktivitas Login</h3>
                    <p className="text-xs text-gray-500">Riwayat masuk akun</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" className="w-full h-14 rounded-xl text-red-600 font-bold border-red-200 hover:bg-red-50 hover:text-red-700 bg-white">
          Hapus Akun
        </Button>
      </div>
    </div>
  );
}
