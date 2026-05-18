'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle, Clock, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function TopupSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txId = searchParams.get('tx_id') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!txId) {
      setStatus('failed');
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    const poll = async () => {
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        const { data } = await supabase
          .from('wallet_transactions')
          .select('status, amount')
          .eq('id', txId)
          .single();

        if (data?.status === 'success') {
          if (!cancelled) setStatus('success');
          return;
        }
        if (data?.status === 'failed') {
          if (!cancelled) setStatus('failed');
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setStatus('failed');
    };

    poll();
    return () => { cancelled = true; };
  }, [txId]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Memverifikasi Pembayaran</h1>
            <p className="text-sm text-gray-500">Menunggu konfirmasi pembayaran dari Xendit...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Top Up Berhasil!</h1>
            <p className="text-sm text-gray-500 mb-8">Saldo GEMA Wallet Anda telah bertambah.</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Pembayaran Belum Dikonfirmasi</h1>
            <p className="text-sm text-gray-500 mb-8">
              Jika Anda sudah membayar, tunggu beberapa saat. Jika belum, silakan coba lagi.
            </p>
          </>
        )}
      </div>

      <div className="p-4 pb-8 space-y-3">
        <Link href="/wallet">
          <Button variant="premium" size="lg" className="w-full">
            <ArrowRight size={18} />
            Kembali ke Dompet
          </Button>
        </Link>
        <Link href="/customer/home">
          <Button variant="pill" size="lg" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
            <Home size={18} />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function TopupSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <TopupSuccessContent />
    </Suspense>
  );
}
