'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LayoutDashboard, Users, Scale, ClipboardList, Gift, ArrowLeftRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShieldAlert, label: 'Fraud', href: '/admin/fraud' },
  { icon: Users, label: 'Vendor', href: '/admin/vendors' },
  { icon: Scale, label: 'Sengketa', href: '/admin/disputes' },
  { icon: ClipboardList, label: 'Pesanan', href: '/admin/orders' },
  { icon: ArrowLeftRight, label: 'Transaksi', href: '/admin/transactions' },
  { icon: Gift, label: 'Promo', href: '/admin/promos' },
];

function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe z-50">
      <div className="flex h-14 items-center justify-around px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive
                  ? "bg-emerald-100 text-emerald-700 rounded-full px-3 py-1"
                  : "text-gray-500 hover:text-emerald-500 px-3 py-1"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      if (profile.role === 'customer') router.replace('/customer/home');
      else if (profile.role === 'vendor') router.replace('/vendor/dashboard');
    }
  }, [profile, router]);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-gray-50">
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm min-h-screen relative shadow-gray-100">
        {children}
      </main>
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 z-50">
        <AdminBottomNav />
      </div>
    </div>
  );
}
