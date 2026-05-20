'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';
import { useWallet, useWalletTransactions } from '@/lib/services/useWallet';

export default function VendorEarningsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useVendorOrders(profile?.id);
  const { data: wallet, isLoading: walletLoading } = useWallet(profile?.id);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id);

  useEffect(() => {
    if (ordersError) toast.error('Gagal memuat data pendapatan');
  }, [ordersError]);

  const now = new Date();
  const periodCutoff = new Date(now);
  if (period === 'week') periodCutoff.setDate(now.getDate() - 7);
  else if (period === 'month') periodCutoff.setDate(now.getDate() - 30);
  else periodCutoff.setFullYear(now.getFullYear() - 1);

  const ordersInPeriod = (orders || []).filter(o => {
    if (!o.created_at) return true;
    return new Date(o.created_at) >= periodCutoff;
  });
  const completedOrders = ordersInPeriod.filter(o => o.order_status === 'completed');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.vendor_payout, 0);
  const pendingAmount = ordersInPeriod
    .filter(o => o.payment_status === 'escrow')
    .reduce((sum, o) => sum + o.vendor_payout, 0);
  const refundedAmount = ordersInPeriod
    .filter(o => o.payment_status === 'refunded')
    .reduce((sum, o) => sum + o.vendor_payout, 0);
  const completedJobs = completedOrders.length;

  const formattedDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID') : '';

  const periodLabel = period === 'week' ? 'Minggu' : period === 'month' ? 'Bulan' : 'Tahun';

  const isLoading = ordersLoading || walletLoading || txLoading;
  const error = ordersError;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <h1 className="font-heading text-xl font-bold text-stone-800">Pendapatan</h1>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mx-4" />

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat data pendapatan</p>
          </div>
        ) : (
          <>
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 rounded-3xl p-5 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
              <div className="relative flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-white" />
                  <span className="text-sm text-emerald-100">Saldo Tersedia</span>
                </div>
                <button onClick={() => router.push('/wallet/withdraw')} className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/30 transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
                  Tarik Saldo <ArrowRight size={14} />
                </button>
              </div>
              <p className="font-heading text-3xl font-bold text-white mt-1">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</p>
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-xs text-emerald-100">Total Pendapatan</p>
                  <p className="font-heading text-lg font-bold text-white">Rp {totalEarnings.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-100">Pesanan Selesai</p>
                  <p className="font-heading text-lg font-bold text-white">{completedJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-stone-800">Ringkasan</h2>
                <div className="flex bg-stone-100/80 backdrop-blur-sm rounded-full p-1">
                  {(['week', 'month', 'year'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-all duration-200',
                        period === p ? 'bg-white shadow-md text-stone-800' : 'text-stone-500'
                      )}
                    >
                      {p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-semibold">Pemasukan</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-stone-800">Rp {totalEarnings.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Periode ini ({periodLabel})</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <ArrowDownRight size={16} />
                    <span className="text-xs font-semibold">Tertunda</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-stone-800">Rp {pendingAmount.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Menunggu escrow</p>
                </div>
              </div>
              {refundedAmount > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-4 mt-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-red-600 mb-1">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-semibold">Pengembalian Dana</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-stone-800">-Rp {refundedAmount.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Total Pengembalian Dana</p>
                </div>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-elegant">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-800">Riwayat Transaksi</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {!transactions || transactions.length === 0 ? (
                  <div className="px-5 py-8 text-center text-stone-400">
                    <p className="text-sm">Belum ada transaksi</p>
                  </div>
                ) : transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-stone-50/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200',
                        tx.type === 'payment' || tx.type === 'topup' ? 'bg-gradient-to-br from-emerald-100 to-emerald-50' : 'bg-gradient-to-br from-red-100 to-red-50'
                      )}>
                        {tx.type === 'payment' || tx.type === 'topup' ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                          <ArrowUpRight size={18} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 capitalize">{tx.type}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-400">
                          <span>{formattedDate(tx.created_at)}</span>
                          {tx.status === 'pending' && (
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <Clock size={12} /> Tertunda
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      'text-sm font-bold',
                      tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}