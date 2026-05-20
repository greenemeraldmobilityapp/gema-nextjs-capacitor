'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { VendorBottomNav } from '@/components/shared/VendorBottomNav';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading, isVendor } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) {
      router.replace('/login');
      return;
    }
    if (!isVendor && profile.role !== 'vendor') {
      router.replace('/customer/home');
    }
  }, [profile, isLoading, isVendor, router]);

  if (!profile || (!isVendor && profile.role !== 'vendor')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-stone-50">
      <main className="flex-1 w-full max-w-md mx-auto bg-white/80 min-h-screen relative shadow-elegant">
        {children}
      </main>
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 z-50">
        <VendorBottomNav />
      </div>
    </div>
  );
}
