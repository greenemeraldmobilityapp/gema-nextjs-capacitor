'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;

    if (!isLoading && !profile) {
      if (pathname !== '/login' && pathname !== '/register' && !pathname.startsWith('/onboarding') && !pathname.startsWith('/register/role')) {
        router.replace('/login');
      }
    } else if (!isLoading && profile) {
      if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/onboarding') || pathname.startsWith('/register/role')) {
        if (profile.role === 'customer') router.replace('/customer/home');
        else if (profile.role === 'vendor') router.replace('/vendor/dashboard');
        else if (profile.role === 'admin') router.replace('/admin/dashboard');
        else router.replace('/register/role');
      }
    }
  }, [profile, isLoading, pathname, router]);

  if (isLoading && pathname !== '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
