'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const AUTH_PAGES = ['/login', '/register', '/onboarding', '/forgot-password', '/update-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, isVendor, mode } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;

    const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p));

    if (!isLoading && !profile) {
      if (!isAuthPage) {
        router.replace('/login');
      }
    } else if (!isLoading && profile) {
      if (pathname === '/update-password') return;
      if (isAuthPage) {
        if (profile.role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (isVendor && profile.role === 'customer') {
          router.replace(mode === 'customer' ? '/customer/home' : '/vendor/dashboard');
        } else if (isVendor || profile.role === 'vendor') {
          router.replace('/vendor/dashboard');
        } else if (profile.role === 'customer') {
          router.replace('/customer/home');
        } else {
          router.replace('/register/role');
        }
      }
    }
  }, [profile, isLoading, isVendor, mode, pathname, router]);

  if (isLoading && pathname !== '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
