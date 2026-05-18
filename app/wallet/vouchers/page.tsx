'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Gift, Percent, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useAllPromos } from '@/lib/services/usePromos';

export default function VoucherHistoryPage() {
  const router = useRouter();
  const { data: promos, isLoading, error } = useAllPromos();

  const statusBadge = (active: boolean) => {
    if (active) {
      return { label: 'Aktif', icon: CheckCircle, class: 'bg-emerald-100 text-emerald-700' };
    }
    return { label: 'Kadaluarsa', icon: XCircle, class: 'bg-gray-100 text-gray-500' };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-800">Promo Saya</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span className="text-sm">Memuat promo...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat promo</p>
          </div>
        ) : !promos || promos.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="opacity-50" />
            </div>
            <p className="font-medium">Belum ada promo</p>
            <p className="text-sm mt-1">Promo akan muncul di sini jika tersedia</p>
          </div>
        ) : (
          promos.map((promo) => {
            const { label, icon: StatusIcon, class: badgeClass } = statusBadge(promo.active);
            return (
              <button
                key={promo.id}
                onClick={() => router.push(`/wallet/promo?id=${promo.id}`)}
                className="w-full text-left cursor-pointer"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10 border border-gray-100" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10 border border-gray-100" />
                  <div className="flex p-4 gap-4 border-l-4 border-emerald-500">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
                      <Percent size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">{promo.title}</h3>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
                          <StatusIcon size={10} />
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-emerald-600">Diskon {promo.discount}%</span>
                        {promo.active && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Sparkles size={10} className="text-emerald-400" />
                            Berlaku
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
