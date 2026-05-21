'use client';

import Link from 'next/link';
import { Percent, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

type Promo = {
  id: string;
  title: string;
  description: string;
  discount: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export function PromoCarousel({ promos, isLoading }: { promos: Promo[] | undefined; isLoading: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % (promos?.length || 1);
        const card = scrollRef.current?.children[next] as HTMLElement;
        if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        return next;
      });
    };
  }, [promos?.length]);

  useEffect(() => {
    if (isPaused || !promos?.length || promos.length < 2) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => tickRef.current(), 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, promos?.length]);

  const handleScroll = () => {
    if (!scrollRef.current || !promos?.length) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const card = scrollRef.current.children[0] as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth + 16;
    const index = Math.max(0, Math.min(Math.round(scrollLeft / cardWidth), promos.length - 1));
    setCurrentIndex(index);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => tickRef.current(), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-[24px] p-4 border-2 border-emerald-300 animate-pulse shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!promos?.length) {
    return (
      <Link href="/wallet/vouchers">
        <div className="w-full bg-white border-2 border-emerald-300 rounded-[24px] p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
              <Percent size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Promo untukmu</h3>
              <p className="text-xs text-gray-500 mt-0.5">Lihat promo & voucher tersedia</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="border-l-4 border-emerald-500 pl-3">
          <h2 className="text-base font-heading font-bold text-gray-900">Promo Spesial</h2>
        </div>
        <Link
          href="/wallet/vouchers"
          className="text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors"
        >
          Lihat Semua
        </Link>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 pt-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {promos.map((promo, i) => (
          <Link
            key={promo.id}
            href={`/wallet/promo?id=${promo.id}`}
            className={`snap-start shrink-0 w-[75vw] max-w-[320px] transition-opacity duration-300 ${i === currentIndex ? 'opacity-100' : 'opacity-80'}`}
          >
            <div className="bg-white border border-emerald-500 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group h-full flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
                  <Percent size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{promo.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{promo.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl px-3 py-1.5 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">{promo.discount}%</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {promos.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                const card = scrollRef.current?.children[i] as HTMLElement;
                if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-emerald-500 w-5' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
