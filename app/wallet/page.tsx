'use client';

import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Loader2, AlertCircle, Plus, Gift, Banknote, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useWallet, useWalletTransactions } from '@/lib/services/useWallet';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function WalletPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: wallet, isLoading: walletLoading, error: walletError } = useWallet(profile?.id);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id);

  const isLoading = walletLoading;
  const error = walletError;

  const formattedDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';

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
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-800">Dompet Saya</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-4">
              <Skeleton className="h-5 w-1/3 mb-4" />
              <SkeletonList rows={3} />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat dompet</p>
            <p className="text-sm text-gray-400 mt-1">Lakukan Top Up untuk membuat dompet</p>
            <Button
              onClick={() => router.push('/wallet/topup')}
              variant="premium"
              className="mt-4"
            >
              <Plus size={18} /> Top Up
            </Button>
          </div>
        ) : (
          <>
            {/* Balance Card - Emerald Premium */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/20">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-transparent to-emerald-300/5" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:16px_16px]" />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Wallet size={20} className="text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-[11px] text-emerald-100/70 font-medium tracking-wider uppercase">Saldo Tersedia</p>
                    </div>
                  </div>
                  <Sparkles size={16} className="text-emerald-300/60" />
                </div>

                <p className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</p>

                <div className="flex gap-3 mt-6">
                  <Button onClick={() => router.push('/wallet/topup')} variant="pill" className="flex-1 bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm h-12 gap-2">
                    <Plus size={18} />
                    Top Up
                  </Button>
                  <Button onClick={() => router.push('/wallet/withdraw')} className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl h-12 gap-2 backdrop-blur-sm">
                    <ArrowUpRight size={18} />
                    Tarik
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {transactions && transactions.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pemasukan</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-emerald-600">
                    Rp {transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight size={14} className="text-red-500" />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pengeluaran</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-red-500">
                    Rp {transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Riwayat Transaksi
                </h2>
                <button onClick={() => router.push('/wallet/vouchers')} className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5 flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer">
                  <Gift size={13} />
                  Promo Saya
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {txLoading ? (
                  <div className="px-4 py-4">
                    <SkeletonList rows={3} />
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <div className="px-4 py-10 text-center text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Wallet size={22} className="opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Belum ada transaksi</p>
                    <p className="text-xs mt-1">Transaksi akan muncul di sini</p>
                  </div>
                ) : transactions.slice(0, 20).map(tx => {
                  const { icon: Icon, bg, color } = txIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                          <Icon size={18} className={color} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{txLabel(tx.type)}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formattedDate(tx.created_at)}</span>
                            {tx.status === 'pending' && (
                              <span className="flex items-center gap-0.5 text-yellow-600">
                                <Clock size={11} /> Tertunda
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        'text-sm font-bold',
                        tx.amount > 0 ? 'text-emerald-600' : 'text-gray-700'
                      )}>
                        {tx.amount > 0 ? '+' : '-'}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
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
