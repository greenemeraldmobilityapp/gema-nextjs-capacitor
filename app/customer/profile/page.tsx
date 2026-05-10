'use client';

import { User, Settings, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const menuItems = [
    { icon: User, label: 'Edit Profil' },
    { icon: CreditCard, label: 'Metode Pembayaran' },
    { icon: Settings, label: 'Pengaturan' },
    { icon: HelpCircle, label: 'Bantuan & Dukungan' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Ahmad Pelanggan</h1>
          <p className="text-emerald-100 text-sm">ahmad@example.com</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="rounded-xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <item.icon size={20} />
                </div>
                <span className="font-medium text-gray-700 flex-1">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm overflow-hidden cursor-pointer hover:bg-red-50 transition-colors">
          <CardContent className="p-4 flex items-center gap-4 text-red-600">
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
