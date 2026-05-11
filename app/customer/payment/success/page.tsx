'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/lib/services/useOrders';
import { createClient } from '@/lib/supabase/client';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-emerald-600"><Loader2 size={24} className="animate-spin text-white" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const { data: order, isLoading } = useOrder(orderId);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (order?.payment_status === 'escrow' || order?.payment_status === 'released') {
      setIsPolling(false)
      return
    }
    const timer = setTimeout(() => setIsPolling(false), 15000)
    return () => clearTimeout(timer)
  }, [order?.payment_status])

  if (isLoading || (order?.payment_status === 'unpaid' && isPolling)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-600 text-white">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-emerald-100 text-lg">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  const isPaid = order?.payment_status === 'escrow' || order?.payment_status === 'released'

  return (
    <div className="flex flex-col min-h-screen bg-emerald-600 text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12">
        {isPaid ? (
          <>
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 motion-safe:animate-pulse">
              <CheckCircle size={64} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Pembayaran Berhasil!</h1>
            <p className="text-emerald-100 mb-8 max-w-sm text-lg">
              Dana Anda telah diamankan (Escrow). Tukang segera menuju lokasi Anda.
            </p>
          </>
        ) : (
          <>
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8">
              <Clock size={64} className="text-white/70" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Menunggu Pembayaran</h1>
            <p className="text-emerald-100 mb-8 max-w-sm text-lg">
              Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.
            </p>
          </>
        )}

        <div className="bg-white/10 rounded-2xl p-6 w-full max-w-xs text-left mb-12 border border-white/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-100 text-sm">Layanan</span>
            <span className="font-bold text-sm">{order?.service_name || '-'}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-100 text-sm">Nominal</span>
            <span className="font-bold">Rp {(order?.total_amount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-100 text-sm">Status</span>
            <span className={`font-bold ${isPaid ? 'text-emerald-200' : 'text-yellow-200'}`}>
              {isPaid ? 'Lunas' : 'Menunggu'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pb-safe space-y-3 shrink-0">
        <Link href={`/customer/orders/detail?id=${orderId}`} className="block w-full">
          <Button className="w-full h-14 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-lg font-bold shadow-sm flex items-center justify-center gap-2">
            Lacak Pesanan
            <ArrowRight size={20} />
          </Button>
        </Link>
        <Link href="/customer/home" className="block w-full text-center py-2">
          <span className="text-emerald-100 font-medium hover:text-white transition-colors">Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
