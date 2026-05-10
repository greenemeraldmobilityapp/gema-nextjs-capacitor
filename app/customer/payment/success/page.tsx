'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-emerald-600 text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12">
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 motion-safe:animate-pulse">
          <CheckCircle size={64} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Pembayaran Berhasil!</h1>
        <p className="text-emerald-100 mb-8 max-w-sm text-lg">
          Dana Anda telah diamankan (Escrow). Tukang segera menuju lokasi Anda.
        </p>

        <div className="bg-white/10 rounded-2xl p-6 w-full max-w-xs text-left mb-12 border border-white/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-100 text-sm">Nominal</span>
            <span className="font-bold">Rp 155.000</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-100 text-sm">Metode</span>
            <span className="font-bold">QRIS</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100 text-sm">Waktu</span>
            <span className="font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pb-safe space-y-3 shrink-0">
        <Link href="/customer/orders/detail?id=order-123" className="block w-full">
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
