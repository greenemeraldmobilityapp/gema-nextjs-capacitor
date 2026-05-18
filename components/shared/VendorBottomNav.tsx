'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, MessageCircle, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VendorBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/vendor/dashboard' },
    { icon: ClipboardList, label: 'Orders', href: '/vendor/orders' },
    { icon: MessageCircle, label: 'Chat', href: '/vendor/chat' },
    { icon: Wallet, label: 'Earnings', href: '/vendor/earnings' },
    { icon: User, label: 'Profile', href: '/vendor/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-t border-stone-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ease-out rounded-full px-4 py-1.5',
                isActive
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-stone-500 hover:text-emerald-600 px-4 py-1.5'
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn(
                'transition-transform duration-200',
                isActive ? 'scale-110' : ''
              )} />
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
