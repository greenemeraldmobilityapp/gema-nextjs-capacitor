'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();

    const t1 = setTimeout(() => setPhase('title'), dur.phase);
    const t2 = setTimeout(() => {
      setPhase('tagline');
      setTitleChars('GEMA'.split(''));
    }, dur.phase * 2);
    const t3 = setTimeout(() => setPhase('done'), dur.phase * 3);
    const t4 = setTimeout(async () => {
      let target = localStorage.getItem('gema_has_onboarded') ? '/login' : '/onboarding';
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role === 'admin') {
          target = '/login';
        }
      }
      setExit(true);
      setTimeout(() => router.push(target), 400);
    }, dur.total);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router, dur]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-emerald-900/95 via-emerald-600/90 to-emerald-800/85 select-none">
      {/* White glow behind logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/[0.07] rounded-full blur-[80px] pointer-events-none motion-reduce:hidden" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/[0.04] rounded-full blur-[60px] pointer-events-none motion-reduce:hidden" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

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
              animation: `particle-float-${(p.id % 3) + 1} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className={`transition-all duration-700 motion-reduce:transition-none ${
            exit
              ? 'opacity-0 scale-90 duration-400'
              : phase === 'logo'
                ? 'opacity-0 scale-50 -rotate-12'
                : 'opacity-100 scale-100 rotate-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <img
            src="/images/gema-logo.svg"
            alt="GEMA"
            className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] motion-reduce:drop-shadow-none"
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
                    textShadow: '0 0 40px rgba(255,255,255,0.1)',
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
                  ? 'w-12 bg-emerald-300/40'
                  : 'w-0 bg-transparent'
              }`}
            />
            <div
              className={`w-1 h-1 rounded-full transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'bg-emerald-200/60 scale-100'
                  : 'bg-transparent scale-0'
              }`}
            />
            <div
              className={`h-px transition-all duration-700 delay-200 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-300/40'
                  : 'w-0 bg-transparent'
              }`}
            />
          </div>

          <p className="text-emerald-100/80 mt-4 text-sm sm:text-base font-light tracking-[0.25em] uppercase drop-shadow-sm">
            Kepercayaan di Setiap Layanan
          </p>

          <div className="flex items-center gap-3 mt-3 motion-reduce:hidden">
            <div
              className={`h-px transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-300/40'
                  : 'w-0 bg-transparent'
              }`}
            />
            <div
              className={`w-1 h-1 rounded-full transition-all duration-700 delay-400 ${
                phase === 'tagline' || phase === 'done'
                  ? 'bg-emerald-200/60 scale-100'
                  : 'bg-transparent scale-0'
              }`}
            />
            <div
              className={`h-px transition-all duration-700 delay-300 ${
                phase === 'tagline' || phase === 'done'
                  ? 'w-12 bg-emerald-300/40'
                  : 'w-0 bg-transparent'
              }`}
            />
          </div>

          <div
            className={`flex items-center justify-center gap-1.5 mt-6 transition-all duration-500 ${
              phase === 'done' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-300/60"
                style={{
                  animation: `loader-dot 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 motion-reduce:hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200 ease-linear"
          style={{
            width: phase === 'logo' ? '5%' : phase === 'title' ? '25%' : phase === 'tagline' ? '55%' : '100%',
            transitionDuration: `${dur.phase}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Version */}
      <div
        className={`absolute bottom-4 right-4 text-[10px] text-white/20 font-mono tracking-wider transition-opacity duration-700 ${
          phase === 'done' || exit ? 'opacity-100' : 'opacity-0'
        }`}
      >
        v0.1.0
      </div>
    </div>
  );
}
