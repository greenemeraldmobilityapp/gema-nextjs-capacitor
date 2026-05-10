'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulasi loading auth check
    const timer = setTimeout(() => {
      // Untuk MVP kita arahkan ke onboarding dulu jika belum login
      router.push('/onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-600">
      <div className="flex flex-col items-center text-white motion-safe:animate-bounce">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
          <Leaf size={48} className="text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">GEMA</h1>
        <p className="text-emerald-100 mt-2 font-medium">Green Emerald Mobility</p>
      </div>
    </div>
  );
}
