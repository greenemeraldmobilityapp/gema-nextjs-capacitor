'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    requestAnimationFrame(() => setStage('show'));
    const timer = setTimeout(() => {
      setStage('exit');
      const target = localStorage.getItem('gema_has_onboarded') ? '/login' : '/onboarding';
      setTimeout(() => router.push(target), 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [router]);

  const staggerClass = (stage: 'enter' | 'show' | 'exit', delayIndex: number) => {
    const base = 'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100';
    if (stage === 'exit') return `${base} opacity-0 translate-y-3 scale-95 duration-500`;
    if (stage === 'show') return `${base} opacity-100 translate-y-0 scale-100`;
    return `${base} opacity-0 translate-y-6 scale-90`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600">
      <div className="absolute inset-0 opacity-20 motion-reduce:opacity-10">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />



      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/images/gema-logo.png"
          alt="GEMA Logo"
          className={`w-24 h-24 sm:w-28 sm:h-28 drop-shadow-lg motion-reduce:drop-shadow-md ${staggerClass(stage, 0)}`}
          style={{ transitionDelay: stage === 'show' ? '0ms' : '0ms' }}
        />

        <h1
          className={`font-heading text-7xl sm:text-9xl font-extrabold text-white tracking-[0.08em] drop-shadow-lg mt-5 leading-none ${staggerClass(stage, 1)}`}
          style={{ transitionDelay: stage === 'show' ? '200ms' : '0ms' }}
        >
          GEMA
        </h1>

        <div
          className={`flex flex-col items-center mt-8 ${staggerClass(stage, 2)}`}
          style={{ transitionDelay: stage === 'show' ? '400ms' : '0ms' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-12 h-px bg-emerald-400/20 motion-reduce:hidden" />
            <div className="w-1 h-1 rounded-full bg-emerald-400/30 motion-reduce:hidden" />
            <div className="w-12 h-px bg-emerald-400/20 motion-reduce:hidden" />
          </div>
          <p className="text-emerald-100/70 mt-3 text-xs sm:text-sm font-medium tracking-[0.25em] uppercase">
            Kepercayaan di Setiap Layanan
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-12 h-px bg-emerald-400/20 motion-reduce:hidden" />
            <div className="w-1 h-1 rounded-full bg-emerald-400/30 motion-reduce:hidden" />
            <div className="w-12 h-px bg-emerald-400/20 motion-reduce:hidden" />
          </div>
        </div>

        <div
          className={`${staggerClass(stage, 3)} motion-reduce:hidden`}
          style={{ transitionDelay: stage === 'show' ? '600ms' : '0ms' }}
          aria-hidden="true"
        >
          <div className="flex gap-2 mt-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/40 animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
