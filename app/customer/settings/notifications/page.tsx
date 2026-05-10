'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({
    orders: true,
    chat: true,
    promo: false,
    system: true
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Notifikasi</span>
      </div>

      <div className="p-4 space-y-4">
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-100">
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Status Pesanan</h3>
                  <p className="text-xs text-gray-500">Update saat tukang tiba atau selesai</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.orders}
                onChange={() => setSettings(s => ({...s, orders: !s.orders}))}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Pesan Masuk</h3>
                  <p className="text-xs text-gray-500">Saat mitra mengirimkan pesan</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.chat}
                onChange={() => setSettings(s => ({...s, chat: !s.chat}))}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
              />
            </label>

            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Promo & Penawaran</h3>
                  <p className="text-xs text-gray-500">Diskon spesial GEMA</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.promo}
                onChange={() => setSettings(s => ({...s, promo: !s.promo}))}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
