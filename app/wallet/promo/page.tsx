'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Percent, Gift, Clock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActivePromos } from '@/lib/services/usePromos';

export default function PromoDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <PromoDetailContent />
    </Suspense>
  );
}

function PromoDetailContent() {
  const searchParams = useSearchParams();
  const promoId = searchParams.get('id') || '';
  const { data: promos, isLoading, error } = useActivePromos();
  const promo = promos?.find(p => p.id === promoId);

  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    const updateCountdown = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown('Berakhir'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setCountdown(`${d} hari ${h} jam`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Promo tidak ditemukan</p>
        <Link href="/wallet/vouchers" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke daftar promo</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/wallet/vouchers" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Detail Promo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white text-center shadow-lg">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Percent size={32} />
          </div>
          <p className="text-5xl font-heading font-bold mb-2">{promo.discount}%</p>
          <p className="text-xl font-bold">{promo.title}</p>
          <p className="text-emerald-100 text-sm mt-2">{promo.description}</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock size={18} />
            <span className="text-sm font-medium">Berakhir dalam {countdown}</span>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Syarat & Ketentuan</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                Berlaku untuk semua layanan di GEMA
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                Tidak dapat digabungkan dengan promo lain
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                Minimal transaksi Rp 50.000
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                Maksimal diskon Rp 100.000
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Link href="/customer/search" className="block w-full">
          <Button variant="pill" size="lg" className="w-full shadow-sm">
            <Gift size={18} />
            Gunakan Promo
          </Button>
        </Link>
      </div>
    </div>
  );
}
