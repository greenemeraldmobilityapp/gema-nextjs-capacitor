'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type SplashPhase = 'logo' | 'title' | 'tagline' | 'done';
type SplashSpeed = 'normal' | 'full';

function getSpeed(): SplashSpeed {
  if (typeof window === 'undefined') return 'full';
  const hasOnboarded = localStorage.getItem('gema_has_onboarded');
  return hasOnboarded ? 'normal' : 'full';
}

const SPEED_DURATIONS: Record<SplashSpeed, { phase: number; total: number }> = {
  normal: { phase: 500, total: 2800 },
  full:   { phase: 700, total: 3800 },
};

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: ((i * 137.5 + 50) % 100),
  size: 1.5 + (i % 3) * 0.8,
  duration: 18 + (i % 7) * 2,
  delay: (i * 1.7) % 14,
  opacity: 0.06 + (i % 5) * 0.025,
  drift: (i % 5 - 2) * 12,
}));

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<SplashPhase>('logo');
  const [exit, setExit] = useState(false);
  const [speed] = useState<SplashSpeed>(getSpeed);
  const [titleChars, setTitleChars] = useState<string[]>([]);

  const dur = SPEED_DURATIONS[speed];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('title'), dur.phase);
    const t2 = setTimeout(() => {
      setPhase('tagline');
      setTitleChars('GEMA'.split(''));
    }, dur.phase * 2);
    const t3 = setTimeout(() => setPhase('done'), dur.phase * 3);
    const t4 = setTimeout(() => {
      setExit(true);
      const target = localStorage.getItem('gema_has_onboarded') ? '/login' : '/onboarding';
      setTimeout(() => router.push(target), 400);
    }, dur.total);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router, dur]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black select-none">
      {/* Emerald glow behind logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none motion-reduce:hidden" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/5 rounded-full blur-[60px] pointer-events-none motion-reduce:hidden" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden motion-reduce:hidden" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: '-5%',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: 'rgba(52, 211, 153, 0.4)',
              animation: `particle-float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              '--p-opacity': p.opacity,
              '--p-drift': `${p.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className={`transition-all duration-700 motion-reduce:transition-none ${
            exit
              ? 'opacity-0 scale-75 rotate-6 duration-400'
              : phase === 'logo'
                ? 'opacity-0 scale-50 -rotate-12'
                : 'opacity-100 scale-100 rotate-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <img
            src="/images/gema-logo.svg"
            alt="GEMA"
            className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_30px_rgba(52,211,153,0.15)] motion-reduce:drop-shadow-none"
          />
        </div>

        {/* GEMA title - char by char */}
        <div className="h-24 sm:h-28 mt-4 flex items-center justify-center overflow-hidden">
          {titleChars.length > 0 ? (
            <h1 className="font-heading text-7xl sm:text-9xl font-extrabold text-white tracking-[0.08em] leading-none flex">
              {titleChars.map((char, i) => (
                <span
                  key={i}
                  className={`inline-block transition-all duration-500 motion-reduce:transition-none ${
                    exit
                      ? 'opacity-0 translate-y-6 scale-75'
                      : 'opacity-100 translate-y-0 scale-100'
                  }`}
                  style={{
                    transitionDelay: exit ? `${i * 60}ms` : `${i * 120}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textShadow: '0 0 40px rgba(52,211,153,0.08)',
                  }}
                >
                  {char}
                </span>
              ))}
            </h1>
          ) : (
            <div className="h-16 sm:h-20" />
          )}
        </div>

        {/* Tagline + decorative lines */}
        <div
          className={`flex flex-col items-center mt-6 transition-all duration-700 motion-reduce:transition-none ${
            exit
              ? 'opacity-0 translate-y-4'
              : phase === 'tagline' || phase === 'done'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <div className="flex items-center gap-3 motion-reduce:hidden">
            <div
              className={`h-px transition-all duration-700 delay-200 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-400/30'
                  : 'w-0 bg-transparent'
              }`}
            />
            <div
              className={`w-1 h-1 rounded-full transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'bg-emerald-400/40 scale-100'
                  : 'bg-transparent scale-0'
              }`}
            />
            <div
              className={`h-px transition-all duration-700 delay-200 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-400/30'
                  : 'w-0 bg-transparent'
              }`}
            />
          </div>

          <p className="text-emerald-100/60 mt-4 text-xs sm:text-sm font-medium tracking-[0.25em] uppercase">
            Kepercayaan di Setiap Layanan
          </p>

          <div className="flex items-center gap-3 mt-3 motion-reduce:hidden">
            <div
              className={`h-px transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-400/30'
                  : 'w-0 bg-transparent'
              }`}
            />
            <div
              className={`w-1 h-1 rounded-full transition-all duration-700 delay-400 ${
                phase === 'tagline' || phase === 'done'
                  ? 'bg-emerald-400/40 scale-100'
                  : 'bg-transparent scale-0'
              }`}
            />
            <div
              className={`h-px transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-400/30'
                  : 'w-0 bg-transparent'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 motion-reduce:hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200 ease-linear"
          style={{
            width: phase === 'logo' ? '5%' : phase === 'title' ? '30%' : phase === 'tagline' ? '65%' : '100%',
            transitionDuration: `${dur.phase}ms`,
          }}
        />
      </div>

      {/* Version */}
      <div
        className={`absolute bottom-4 right-4 text-[10px] text-white/15 font-mono tracking-wider transition-opacity duration-700 ${
          phase === 'done' || exit ? 'opacity-100' : 'opacity-0'
        }`}
      >
        v0.1.0
      </div>
    </div>
  );
}
