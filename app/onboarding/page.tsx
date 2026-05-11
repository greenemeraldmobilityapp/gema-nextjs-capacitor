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
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-4 pt-4 shrink-0">
        {!isLastSlide && (
          <Link href="/register/role" className="text-sm font-semibold text-gray-500 float-right">
            Skip
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <div key={index} className="w-full shrink-0 px-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                  <Icon size={64} className="text-emerald-500" />
                </div>
                <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">{slide.title}</h1>
                <p className="text-gray-500 max-w-sm leading-relaxed">{slide.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-6 bg-emerald-600' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="p-4 pb-safe bg-white border-t space-y-3 shrink-0">
        {isLastSlide ? (
          <Link href="/register/role" className="block w-full">
            <Button variant="pill" size="lg" className="w-full">
              Mulai
            </Button>
          </Link>
        ) : (
          <Button variant="pill" size="lg" className="w-full" onClick={handleNext}>
            Selanjutnya
          </Button>
        )}
        <div className="text-center">
          <span className="text-sm text-gray-500">Sudah punya akun? </span>
          <Link href="/login" className="text-sm font-bold text-emerald-600 hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
