'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    id: 1,
    title: ['Solusi Layanan Terpercaya', 'di Ujung Jari'],
    description: 'Temukan tukang ahli di dekat Anda — dari perbaikan rumah hingga kebutuhan sehari-hari, semua dalam satu aplikasi.',
  },
  {
    id: 2,
    title: 'Vendor Terpilih, Kualitas Terjamin',
    description: 'Setiap Mitra melewati proses verifikasi ketat, sehingga Anda tidak perlu khawatir tentang kualitas dan keamanan.',
  },
  {
    id: 3,
    title: 'Bayar Setelah Selesai, Tanpa Risiko',
    description: 'Pembayaran ditahan sampai Anda puas. Dana baru dilepaskan ke Mitra setelah pekerjaan selesai dan Anda konfirmasi.',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
  }, []);

  const handleNext = () => {
    if (isLastSlide) return;
    setVideoReady(false);
    setCurrentSlide((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentSlide === 0) return;
    setVideoReady(false);
    setCurrentSlide((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-emerald-50 to-emerald-100 relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0 relative z-10">
        {currentSlide > 0 ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 active:bg-emerald-300 transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {!isLastSlide && (
          <Link
            href="/register/role"
            className="text-sm font-medium text-emerald-600 bg-emerald-50 rounded-full px-4 py-2 hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
          >
            Skip
          </Link>
        )}
      </div>

      {/* Slides */}
      <div className="flex-1 relative overflow-hidden w-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const offset = index - currentSlide;

          return (
            <div
              key={slide.id}
              className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center transition-all duration-500 ease-out"
              style={{
                transform: prefersReducedMotion
                  ? `translateX(${offset * 100}%)`
                  : `translateX(${offset * 100}%)`,
                opacity: prefersReducedMotion ? 1 : (1 - Math.abs(offset) * 0.3),
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Video with glow */}
              <div className="relative mb-8">
                {isActive && (
                  <div className="absolute inset-0 w-[min(60vw,18rem)] h-[min(80vw,24rem)] bg-emerald-600/30 rounded-2xl blur-2xl scale-50 animate-pulse" />
                )}
                <div className="relative w-[min(60vw,18rem)] h-[min(80vw,24rem)] rounded-2xl overflow-hidden shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-100/50 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  {isActive ? (
                    <>
                      <video
                        key={slide.id}
                        src={`/onboarding/video-${slide.id}.mp4`}
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        aria-label={typeof slide.title === 'string' ? slide.title : slide.title[0]}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                        style={{ objectPosition: 'center 10%' }}
                        onCanPlay={() => setVideoReady(true)}
                        onError={() => setVideoError(true)}
                      />
                      {!videoReady && !videoError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        </div>
                      )}
                      {videoError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
                          <AlertCircle size={28} />
                          <span className="text-xs font-medium">Video gagal dimuat</span>
                        </div>
                      )}
                      <button
                        onClick={() => setIsMuted((prev) => !prev)}
                        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors z-10 cursor-pointer"
                        aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
                      >
                        {isMuted ? (
                          <VolumeX size={14} className="text-white" />
                        ) : (
                          <Volume2 size={14} className="text-white" />
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
                  )}
                </div>
              </div>

              {/* Title */}
              {Array.isArray(slide.title) ? (
                <h1
                  className="font-heading text-2xl sm:text-3xl font-bold text-emerald-600 mb-4 px-2 leading-tight"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
                >
                  {slide.title.map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </h1>
              ) : (
                <h1
                  className="font-heading text-2xl sm:text-3xl font-bold text-emerald-600 mb-4 line-clamp-2 px-2"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
                >
                  {slide.title}
                </h1>
              )}

              {/* Accent line */}
              <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 mx-auto my-3 rounded-full" />

              {/* Description */}
              <p className="text-base sm:text-sm text-gray-500 max-w-sm leading-relaxed px-4 font-semibold">
                {slide.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Dot indicator */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide
                ? 'w-8 h-2.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'w-2.5 h-2.5 bg-gray-300'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 pb-safe bg-white/80 backdrop-blur-sm border-t border-gray-100 space-y-4 shrink-0">
        {isLastSlide ? (
          <Link href="/register/role" className="block w-full">
            <Button
              variant="pill"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20 hover:brightness-105 active:brightness-95 transition-all"
            >
              Mulai
            </Button>
          </Link>
        ) : (
          <Button
            variant="pill"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20 hover:brightness-105 active:brightness-95 transition-all"
            onClick={handleNext}
          >
            Selanjutnya
          </Button>
        )}
        <div className="text-center pb-4">
          <span className="text-sm text-gray-500">Sudah memiliki akun? </span>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:underline">
            Masuk <LogIn size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
