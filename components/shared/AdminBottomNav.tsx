'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldAlert,
  MoreHorizontal,
  Briefcase,
  Scale,
  ArrowLeftRight,
  Gift,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Pesanan', href: '/admin/orders' },
  { icon: Users, label: 'Vendor', href: '/admin/vendors' },
  { icon: ShieldAlert, label: 'Fraud', href: '/admin/fraud' },
];

const overflowItems = [
  { icon: Briefcase, label: 'Portofolio', href: '/admin/services' },
  { icon: Scale, label: 'Sengketa', href: '/admin/disputes' },
  { icon: ArrowLeftRight, label: 'Transaksi', href: '/admin/transactions' },
  { icon: Gift, label: 'Promo', href: '/admin/promos' },
];

const overflowPaths = overflowItems.map((i) => i.href);

export function AdminBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isInOverflow = overflowPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isMoreActive = isInOverflow;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-t border-stone-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

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
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'transition-transform duration-200',
                    isActive ? 'scale-110' : ''
                  )}
                />
                <span className="text-[10px] font-semibold leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ease-out rounded-full px-4 py-1.5',
              isMoreActive
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-stone-500 hover:text-emerald-600 px-4 py-1.5'
            )}
          >
            <MoreHorizontal
              size={22}
              strokeWidth={isMoreActive ? 2.5 : 2}
              className={cn(
                'transition-transform duration-200',
                isMoreActive ? 'scale-110' : ''
              )}
            />
            <span className="text-[10px] font-semibold leading-none">Lainnya</span>
          </button>
        </div>
      </nav>

      <div
        className={cn(
          'fixed inset-0 z-[60] transition-opacity duration-300',
          sheetOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSheetOpen(false)}
        />

        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out',
            sheetOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex items-center justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-stone-300" />
          </div>

          <div className="flex items-center justify-between px-6 pt-2 pb-3">
            <h2 className="text-sm font-semibold text-stone-700">Menu Lainnya</h2>
            <button
              onClick={() => setSheetOpen(false)}
              className="p-1 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X size={18} className="text-stone-400" />
            </button>
          </div>

          <div className="px-3 pb-6 space-y-1">
            {overflowItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(isActive ? 'text-emerald-600' : 'text-stone-400')}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-emerald-500' : 'text-stone-300'
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
