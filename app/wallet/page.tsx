'use client';

import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Loader2, AlertCircle, Plus, Gift, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useWallet, useWalletTransactions, useCreateWallet } from '@/lib/services/useWallet';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function WalletPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: wallet, isLoading: walletLoading, error: walletError } = useWallet(profile?.id);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id);
  const createWallet = useCreateWallet();

  useEffect(() => {
    if (!walletLoading && !wallet && !walletError && profile?.id) {
      createWallet.mutate(profile.id, {
        onError: (err) => toast.error(err.message || 'Gagal membuat dompet'),
      });
    }
  }, [walletLoading, wallet, walletError, profile?.id]);

  const isLoading = walletLoading || createWallet.isPending;
  const error = walletError;

  const formattedDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID') : '';

  const txIcon = (type: string) => {
    switch (type) {
      case 'topup': return { icon: Plus, bg: 'bg-emerald-100', color: 'text-emerald-600' };
      case 'withdrawal': return { icon: ArrowUpRight, bg: 'bg-red-100', color: 'text-red-500' };
      case 'payment': return { icon: Banknote, bg: 'bg-blue-100', color: 'text-blue-600' };
      default: return { icon: CheckCircle2, bg: 'bg-gray-100', color: 'text-gray-500' };
    }
  };

  const txLabel = (type: string) => {
    switch (type) {
      case 'payment': return 'Pembayaran';
      case 'topup': return 'Top Up';
      case 'withdrawal': return 'Penarikan';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Dompet Saya</h1>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <div className="bg-white rounded-3xl shadow-sm border p-4">
              <Skeleton className="h-5 w-1/3 mb-4" />
              <SkeletonList rows={3} />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat dompet</p>
            <p className="text-sm text-gray-400 mt-1">Pastikan Anda memiliki wallet yang sudah dibuat</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={20} />
                <span className="text-sm text-emerald-100">Saldo Tersedia</span>
              </div>
              <p className="font-heading text-4xl font-bold mt-1">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</p>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => router.push('/wallet/topup')} variant="pill" className="flex-1 bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm">
                  <Plus size={18} />
                  Top Up
                </Button>
                <Button onClick={() => router.push('/wallet/withdraw')} className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl h-12 gap-2">
                  <ArrowUpRight size={18} />
                  Tarik
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
                <button onClick={() => router.push('/wallet/vouchers')} className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <Gift size={14} />
                  Promo Saya
                </button>
              </div>
              <div className="divide-y">
                {txLoading ? (
                  <div className="px-4 py-4">
                    <SkeletonList rows={3} />
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <Wallet size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada transaksi</p>
                  </div>
                ) : transactions.slice(0, 20).map(tx => {
                  const { icon: Icon, bg, color } = txIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', bg)}>
                          <Icon size={18} className={color} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{txLabel(tx.type)}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formattedDate(tx.created_at)}</span>
                            {tx.status === 'pending' && (
                              <span className="flex items-center gap-0.5 text-yellow-600">
                                <Clock size={12} /> Tertunda
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        'text-sm font-bold',
                        tx.amount > 0 ? 'text-emerald-700' : 'text-red-600'
                      )}>
                        {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
