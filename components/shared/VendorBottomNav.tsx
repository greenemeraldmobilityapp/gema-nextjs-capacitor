'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VendorBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/vendor/dashboard' },
    { icon: ClipboardList, label: 'Orders', href: '/vendor/orders' },
    { icon: Wallet, label: 'Earnings', href: '/vendor/earnings' },
    { icon: User, label: 'Profile', href: '/vendor/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe z-50">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                isActive ? "text-emerald-600" : "text-gray-500 hover:text-emerald-500"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
