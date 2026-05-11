'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      router.push('/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#10B981' }}>
      <div
        className={`flex flex-col items-center text-white transition-all duration-700 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <h1 className="font-heading text-6xl font-black text-white tracking-[0.1em]">GEMA</h1>
        <p className="text-emerald-100 mt-2 font-medium">Green Emerald Mobility</p>
      </div>
    </div>
  );
}
