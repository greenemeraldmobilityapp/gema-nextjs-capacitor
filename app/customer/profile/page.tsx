'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, CreditCard, HelpCircle, LogOut, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const menuItems = [
    { icon: User, label: 'Edit Profil', href: '/customer/profile/edit' },
    { icon: Wallet, label: 'Dompet Saya', href: '/wallet' },
    { icon: Settings, label: 'Pengaturan', href: '/customer/settings/notifications' },
    { icon: HelpCircle, label: 'Bantuan & Dukungan', href: '/customer/help' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile?.full_name || 'Pengguna'}</h1>
          <p className="text-emerald-100 text-sm">{profile?.email || ''}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="rounded-xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <item.icon size={20} />
                </div>
                <span className="font-medium text-gray-700 flex-1">{item.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card
          className="rounded-xl border-none shadow-sm overflow-hidden cursor-pointer hover:bg-red-50 transition-colors"
          onClick={handleLogout}
        >
          <CardContent className="p-4 flex items-center gap-4 text-red-600">
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
