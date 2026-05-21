'use client';

import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, Tag, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNotificationPreferences, useUpdateNotificationPreference } from '@/lib/services/useNotifications';

const sections = [
  {
    title: 'Transaksi & Pesanan',
    items: [
      { key: 'order', icon: Bell, label: 'Status Pesanan', desc: 'Update saat tukang tiba atau selesai', color: 'bg-blue-50 text-blue-600' },
      { key: 'chat', icon: MessageSquare, label: 'Pesan Masuk', desc: 'Saat mitra mengirimkan pesan', color: 'bg-green-50 text-green-600' },
    ]
  },
  {
    title: 'Promosi & Info',
    items: [
      { key: 'promo', icon: Tag, label: 'Promo & Penawaran', desc: 'Diskon spesial GEMA', color: 'bg-orange-50 text-orange-600' },
      { key: 'system', icon: ShieldCheck, label: 'Info Akun', desc: 'Keamanan & perubahan akun', color: 'bg-purple-50 text-purple-600' },
    ]
  }
];

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePref = useUpdateNotificationPreference();

  const isEnabled = (channel: string) => {
    if (!preferences) return true;
    const pref = preferences.find(p => p.channel === channel);
    return pref ? pref.push_enabled : true;
  };

  const handleToggle = (channel: string) => {
    const current = isEnabled(channel);
    updatePref.mutate({ channel, push_enabled: !current });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Notifikasi</span>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-gray-700 px-1 mb-2">{section.title}</h3>
              <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CardContent className="p-0 divide-y divide-gray-100">
                  {section.items.map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{item.label}</h4>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled(item.key)}
                          onChange={() => handleToggle(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
