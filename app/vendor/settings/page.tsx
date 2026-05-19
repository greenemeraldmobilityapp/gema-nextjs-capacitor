'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, Tag, ShieldCheck, Lock, Smartphone, ChevronRight, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function VendorSettingsPage() {
  const [notifications, setNotifications] = useState({
    orders: true,
    chat: true,
    promo: false,
    system: true
  });

  const notificationSections = [
    {
      title: 'Transaksi & Pesanan',
      items: [
        { key: 'orders' as const, icon: Bell, label: 'Status Pesanan', desc: 'Update saat ada pesanan baru atau selesai', color: 'bg-stone-100 text-stone-600' },
        { key: 'chat' as const, icon: MessageSquare, label: 'Pesan Masuk', desc: 'Saat pelanggan mengirimkan pesan', color: 'bg-stone-100 text-stone-600' },
      ]
    },
    {
      title: 'Promosi & Info',
      items: [
        { key: 'promo' as const, icon: Tag, label: 'Promo & Penawaran', desc: 'Program spesial dari GEMA', color: 'bg-stone-100 text-stone-600' },
        { key: 'system' as const, icon: ShieldCheck, label: 'Info Akun', desc: 'Keamanan & perubahan akun', color: 'bg-stone-100 text-stone-600' },
      ]
    }
  ];

  const securityItems = [
    { icon: Lock, label: 'Ubah Kata Sandi', desc: 'Perbarui kata sandi akun Anda', href: '#' },
    { icon: Smartphone, label: 'Keamanan Biometrik', desc: 'Gunakan sidik jari atau wajah', href: '#', toggle: true },
    { icon: Globe, label: 'Bahasa', desc: 'Bahasa Indonesia', href: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-gradient-to-b from-emerald-700 to-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/vendor/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-800 hover:bg-emerald-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Pengaturan</span>
      </div>

      <div className="p-4 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-stone-700 px-1 mb-2">Notifikasi</h3>
          {notificationSections.map((section) => (
            <Card key={section.title} className="rounded-2xl border-none shadow-sm overflow-hidden mb-3">
              <CardContent className="p-0 divide-y divide-stone-100">
                {section.items.map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-800 text-sm">{item.label}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => {
                          setNotifications(s => ({...s, [item.key]: !s[item.key]}));
                          toast.success('Pengaturan notifikasi diperbarui', { duration: 3000 });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-bold text-stone-700 px-1 mb-2">Keamanan & Akun</h3>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-stone-100">
              {securityItems.map((item, index) => (
                item.toggle ? (
                  <label key={index} className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-800 text-sm">{item.label}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-12 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </label>
                ) : (
                  <Link key={index} href={item.href} className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-800 text-sm">{item.label}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                )
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
