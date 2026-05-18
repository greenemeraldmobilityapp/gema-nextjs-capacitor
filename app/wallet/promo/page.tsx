'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Percent, Gift, Clock, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllPromos } from '@/lib/services/useAdmin';

function PromoDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get('id') || '';
  const { data: promos, isLoading, error } = useAllPromos();
  const promo = promos?.find((p) => p.id === promoId) ?? null;

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

  if (error || !promo || (!promoId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Promo tidak ditemukan</p>
        <button onClick={() => router.back()} className="mt-2 text-sm text-emerald-600 font-medium cursor-pointer hover:underline">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-900">Detail Promo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/20 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-transparent to-emerald-300/5" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {promo.image_url && (
            <img src={promo.image_url} alt="" className="w-20 h-20 object-contain mx-auto mb-4 relative" />
          )}
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 relative backdrop-blur-sm border border-white/10">
            <Percent size={28} className="text-white" />
          </div>

          <p className="text-5xl font-heading font-bold mb-2 relative">{promo.discount}%</p>
          <p className="text-xl font-heading font-bold relative">{promo.title}</p>
          <p className="text-emerald-100 text-sm mt-2 relative">{promo.description}</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Clock size={18} />
            <span className="text-sm font-semibold">Berakhir dalam {countdown}</span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              Syarat & Ketentuan
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'Berlaku untuk semua layanan di GEMA',
                'Tidak dapat digabungkan dengan promo lain',
                'Minimal transaksi Rp 50.000',
                'Maksimal diskon Rp 100.000',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <Button
          onClick={() => router.push('/customer/search')}
          variant="pill"
          size="lg"
          className="w-full shadow-sm gap-2"
        >
          <Gift size={18} />
          Gunakan Promo
        </Button>
      </div>
    </div>
  );
}

export default function PromoDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <PromoDetailContent />
    </Suspense>
  );
}
