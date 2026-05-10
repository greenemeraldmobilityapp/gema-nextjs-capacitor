'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    /**
     * UNAUTHENTICATED USER FLOW
     */
    if (!profile) {
      // Root route handling
      if (pathname === '/') {
        const hasOnboarded =
          typeof window !== 'undefined'
            ? localStorage.getItem('gema_has_onboarded')
            : null;

        if (!hasOnboarded) {
          router.replace('/onboarding');
          return;
        }

        router.replace('/login');
        return;
      }

      // Allow public routes
      const publicRoutes = [
        '/login',
        '/register',
        '/register/role',
        '/onboarding',
      ];

      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isPublicRoute) {
        router.replace('/login');
        return;
      }
    }

    /**
     * AUTHENTICATED USER FLOW
     */
    if (profile) {
      const authPages = [
        '/',
        '/login',
        '/register',
        '/register/role',
        '/onboarding',
      ];

      const isAuthPage = authPages.some((route) =>
        pathname.startsWith(route)
      );

      // Only redirect authenticated users if they are accessing auth pages
      if (isAuthPage) {
        if (profile.role === 'customer') {
          router.replace('/customer/home');
          return;
        }

        if (profile.role === 'vendor') {
          router.replace('/vendor/dashboard');
          return;
        }

        if (profile.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }

        /**
         * Prevent redirect loop if role isn't available yet
         * (possible trigger delay after signup)
         */
        console.warn(
          'Authenticated user profile exists but role is missing:',
          profile
        );
      }
    }
  }, [profile, isLoading, pathname, router]);

  /**
   * Global loading screen
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}