'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, Wallet, Sparkles, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWallet } from '@/lib/services/useWallet';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function TopupPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: wallet } = useWallet(profile?.id);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (numericAmount < 10000) {
      toast.warning('Minimal top up Rp 10.000', { duration: 4000 });
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');

      let walletId = wallet?.id;
      if (!walletId) {
        const { data: newWallet, error: createErr } = await supabase
          .from('wallets')
          .insert({ user_id: profile?.id, balance: 0 })
          .select()
          .single();
        if (createErr || !newWallet) {
          throw new Error('Dompet tidak ditemukan');
        }
        walletId = newWallet.id;
      }

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-topup-invoice`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wallet_id: walletId, amount: numericAmount, origin: window.location.origin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat invoice top up');

      // Redirect to Xendit payment page
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: data.invoice_url });
        router.push(`/wallet/topup/success?tx_id=${data.tx_id}`);
      } else {
        window.location.href = data.invoice_url;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses top up';
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-800">Top Up Saldo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 pb-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-5 text-white shadow-lg shadow-emerald-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-transparent to-emerald-300/5" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:16px_16px]" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Wallet size={20} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-100/70 font-medium tracking-wider uppercase">Saldo Saat Ini</p>
              <p className="font-heading text-xl font-bold">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Jumlah Top Up</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200">
              <span className="text-xl font-bold text-gray-400">Rp</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                className="text-2xl font-bold h-auto border-0 focus-visible:ring-0 px-0 bg-transparent"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Cepat pilih:</p>
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v.toString())}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer",
                    numericAmount === v
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  Rp {v.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-emerald-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ringkasan</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Jumlah Top Up</span>
            <span className="font-bold text-gray-800">Rp {numericAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Biaya Layanan</span>
            <span className="font-bold text-emerald-600">Gratis</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-heading text-xl font-bold text-gray-800">Rp {numericAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <ExternalLink size={16} />
            Pembayaran via Xendit
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Anda akan diarahkan ke halaman pembayaran Xendit untuk menyelesaikan top up.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <Button
          onClick={handleSubmit}
          disabled={numericAmount < 10000 || isProcessing}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {isProcessing ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Menyiapkan pembayaran...</>
          ) : (
            <><Plus size={20} /> Top Up Rp {numericAmount.toLocaleString('id-ID')}</>
          )}
        </Button>
      </div>
    </div>
  );
}
