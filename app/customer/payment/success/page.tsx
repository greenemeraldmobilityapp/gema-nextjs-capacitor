'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, AlertCircle, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/lib/services/useOrders';

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
  const { data: order, isLoading } = useOrder(orderId, 2000);

  if (isLoading || order?.payment_status === 'unpaid') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-600 text-white">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-emerald-100 text-lg">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  const isPaid = order?.payment_status === 'escrow' || order?.payment_status === 'released'

  return (
    <div className="flex flex-col min-h-screen bg-emerald-600 text-white relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-300/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12 relative z-10">
        {isPaid ? (
          <>
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/30">
              <CheckCircle size={56} className="text-white animate-in zoom-in-0 duration-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">Pembayaran Berhasil!</h1>
            <p className="text-emerald-100 mb-6 max-w-sm text-lg">
              Dana Anda telah diamankan (Escrow). Tukang segera menuju lokasi Anda.
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-[10px] text-emerald-200 mt-1">Dana Ditahan</span>
              </div>
              <div className="w-12 h-0.5 bg-emerald-400/50 -mt-5" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-emerald-400/50 flex items-center justify-center">
                  <span className="text-white/70 text-sm font-bold">2</span>
                </div>
                <span className="text-[10px] text-emerald-200/70 mt-1">Pekerjaan</span>
              </div>
              <div className="w-12 h-0.5 bg-emerald-400/50 -mt-5" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-emerald-400/50 flex items-center justify-center">
                  <span className="text-white/70 text-sm font-bold">3</span>
                </div>
                <span className="text-[10px] text-emerald-200/70 mt-1">Dana Dilepas</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20">
              <Clock size={56} className="text-white/70" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">Menunggu Pembayaran</h1>
            <p className="text-emerald-100 mb-8 max-w-sm text-lg">
              Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.
            </p>
          </>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 w-full max-w-xs text-left mb-12 border border-white/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Pesanan</span>
            <span className="font-bold text-sm">#{orderId?.slice(0, 8) || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Layanan</span>
            <span className="font-bold text-sm">{order?.service_name || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Tanggal</span>
            <span className="font-bold text-sm">{order?.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('id-ID') : '-'}</span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Total</span>
            <span className="font-heading font-bold text-xl">Rp {(order?.total_amount || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Status</span>
            <span className={`font-bold text-sm ${isPaid ? 'text-emerald-200' : 'text-yellow-200'}`}>
              {isPaid ? 'Lunas (Escrow)' : 'Menunggu'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-3 shrink-0 relative z-10">
        <Link href={`/customer/orders/detail?id=${orderId}`} className="block w-full">
          <Button className="w-full h-14 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-lg font-bold shadow-sm flex items-center justify-center gap-2">
            Lihat Detail Pesanan
            <ArrowRight size={20} />
          </Button>
        </Link>
        <Link href="/customer/home">
          <Button variant="pill" size="lg" className="w-full bg-white/20 text-white hover:bg-white/30 border border-white/30 shadow-sm">
            <Home size={18} />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
