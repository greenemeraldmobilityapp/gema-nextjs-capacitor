'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';
import { useWallet, useWalletTransactions } from '@/lib/services/useWallet';

export default function VendorEarningsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useVendorOrders(profile?.id);
  const { data: wallet, isLoading: walletLoading } = useWallet(profile?.id);
  const { data: transactions, isLoading: txLoading } = useWalletTransactions(wallet?.id);

  const completedOrders = (orders || []).filter(o => o.order_status === 'completed');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.vendor_payout, 0);
  const pendingAmount = (orders || [])
    .filter(o => o.payment_status === 'escrow')
    .reduce((sum, o) => sum + o.vendor_payout, 0);
  const refundedAmount = (orders || [])
    .filter(o => o.payment_status === 'refunded')
    .reduce((sum, o) => sum + o.vendor_payout, 0);
  const completedJobs = completedOrders.length;

  const formattedDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID') : '';

  const periodLabel = period === 'week' ? 'Minggu' : period === 'month' ? 'Bulan' : 'Tahun';

  const isLoading = ordersLoading || walletLoading || txLoading;
  const error = ordersError;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Pendapatan</h1>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
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
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Wallet size={18} />
                  <span className="text-sm opacity-90">Saldo Tersedia</span>
                </div>
                <button className="text-sm font-semibold flex items-center gap-1 bg-white/20 rounded-full px-4 py-1.5 hover:bg-white/30 transition-colors">
                  Tarik Saldo <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-3xl font-bold mt-1">Rp {(wallet?.balance || 0).toLocaleString()}</p>
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-xs opacity-80">Total Pendapatan</p>
                  <p className="text-lg font-bold">Rp {totalEarnings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Pesanan Selesai</p>
                  <p className="text-lg font-bold">{completedJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Ringkasan</h2>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  {(['week', 'month', 'year'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      )}
                    >
                      {p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-medium">Pemasukan</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">Rp {totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Periode ini ({periodLabel})</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-orange-600 mb-1">
                    <ArrowDownRight size={16} />
                    <span className="text-xs font-medium">Tertunda</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">Rp {pendingAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Menunggu escrow</p>
                </div>
              </div>
              {refundedAmount > 0 && (
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-red-600 mb-1">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-medium">Refund</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">-Rp {refundedAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total refund</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
              </div>
              <div className="divide-y">
                {!transactions || transactions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <p className="text-sm">Belum ada transaksi</p>
                  </div>
                ) : transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        tx.type === 'payment' || tx.type === 'topup' ? 'bg-emerald-100' : 'bg-red-100'
                      )}>
                        {tx.type === 'payment' || tx.type === 'topup' ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                          <ArrowUpRight size={18} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
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
                      {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString()}
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
