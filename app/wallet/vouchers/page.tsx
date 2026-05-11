'use client';

import Link from 'next/link';
import { ArrowLeft, Gift, Percent, Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAllPromos } from '@/lib/services/usePromos';

export default function VoucherHistoryPage() {
  const { data: promos, isLoading, error } = useAllPromos();

  const statusBadge = (active: boolean) => {
    if (active) {
      return { label: 'Aktif', icon: CheckCircle, class: 'bg-emerald-100 text-emerald-700' };
    }
    return { label: 'Kadaluarsa', icon: XCircle, class: 'bg-gray-100 text-gray-500' };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/wallet" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Riwayat Promo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
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
            <Gift size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Belum ada promo</p>
            <p className="text-sm mt-1">Promo akan muncul di sini jika tersedia</p>
          </div>
        ) : (
          promos.map((promo) => {
            const { label, icon: StatusIcon, class: badgeClass } = statusBadge(promo.active);
            return (
              <Link key={promo.id} href={`/wallet/promo?id=${promo.id}`}>
                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden relative">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10" />
                  <div className="flex p-4 gap-4 border-l-4 border-emerald-500">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Percent size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{promo.title}</h3>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
                          <StatusIcon size={10} />
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                      <p className="text-sm font-bold text-emerald-600 mt-2">Diskon {promo.discount}%</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
