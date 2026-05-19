'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AdminBottomNav } from '@/components/shared/AdminBottomNav';

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
    <div className="flex flex-col min-h-screen pb-20 bg-stone-50">
      <main className="flex-1 w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen relative shadow-elegant">
        {children}
      </main>
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 z-50">
        <AdminBottomNav />
      </div>
    </div>
  );
}
