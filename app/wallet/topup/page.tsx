'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWallet, useRequestTopup } from '@/lib/services/useWallet';

export default function TopupPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: wallet } = useWallet(profile?.id);
  const topup = useRequestTopup();
  const [amount, setAmount] = useState('');

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (!wallet?.id) {
      toast.error('Dompet tidak ditemukan');
      return;
    }
    if (numericAmount < 10000) {
      toast.error('Minimal top up Rp 10.000');
      return;
    }
    topup.mutate(
      { walletId: wallet.id, amount: numericAmount },
      {
        onSuccess: () => {
          toast.success('Permintaan top up berhasil dikirim');
          router.push('/wallet');
        },
        onError: (err) => toast.error(err.message || 'Gagal mengirim permintaan'),
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b flex items-center gap-3">
        <Link href="/wallet" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Top Up Saldo</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white rounded-xl p-4 border space-y-3">
          <p className="text-sm text-gray-500">Jumlah Top Up</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-400">Rp</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="text-2xl font-bold h-12 border-0 focus-visible:ring-0 px-0"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[50000, 100000, 200000, 500000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v.toString())}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              >
                Rp {v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Jumlah Top Up</span>
            <span className="font-bold">Rp {numericAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Biaya</span>
            <span className="font-bold text-emerald-600">Gratis</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">Rp {numericAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <Button
          onClick={handleSubmit}
          disabled={numericAmount < 10000 || topup.isPending}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold"
        >
          {topup.isPending ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Memproses...</>
          ) : (
            <><Plus size={20} /> Top Up Rp {numericAmount.toLocaleString()}</>
          )}
        </Button>
      </div>
    </div>
  );
}
