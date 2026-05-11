'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    icon: Wrench,
    title: 'Temukan Jasa Profesional Terpercaya',
    description: 'GEMA membantu Anda menemukan teknisi dan layanan perbaikan terbaik di sekitar lokasi Anda.',
  },
  {
    icon: ShieldCheck,
    title: 'Penyedia Tervalidasi & Berkualitas',
    description: 'Semua vendor telah melewati verifikasi KYC untuk menjamin kualitas dan keamanan.',
  },
  {
    icon: Wallet,
    title: 'Pembayaran Aman lewat GemaPay',
    description: 'Transaksi aman dengan sistem escrow — dana dilepaskan hanya setelah pekerjaan selesai.',
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) return;
    setCurrentSlide((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <div className="flex justify-end px-4 pt-4 shrink-0">
        {!isLastSlide && (
          <Link href="/register/role" className="text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors">
            Skip
          </Link>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden w-full">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <div
              key={index}
              className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center transition-all duration-500 ease-out"
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-100/50">
                <Icon size={64} className="text-emerald-500" />
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">{slide.title}</h1>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">{slide.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-6 bg-emerald-600 shadow-sm shadow-emerald-300/50'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="p-4 pb-safe bg-white space-y-4 shrink-0">
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
          <span className="text-sm text-gray-500">Sudah punya akun? </span>
          <Link href="/login" className="text-sm font-bold text-emerald-600 hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
