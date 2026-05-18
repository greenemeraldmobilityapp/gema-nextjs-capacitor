'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeftRight, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllTransactions, useApproveTransaction, useRejectTransaction } from '@/lib/services/useAdmin';
import { useApproveWithdrawDisbursement } from '@/lib/services/useWallet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const typeLabels: Record<string, string> = {
  topup: 'Top Up',
  withdrawal: 'Tarik',
  payment: 'Pembayaran',
  escrow_release: 'Rilis Escrow',
  refund: 'Refund',
};

const statusLabels: Record<string, string> = {
  pending: 'Tertunda',
  success: 'Berhasil',
  failed: 'Gagal',
};

export default function AdminTransactions() {
  const { data: transactions, isLoading, error } = useAllTransactions();
  const approveTx = useApproveTransaction();
  const approveWithdraw = useApproveWithdrawDisbursement();
  const rejectTx = useRejectTransaction();
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');

  const filtered = (transactions || []).filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleApprove = async (tx: { id: string; wallet_id: string; amount: number; type: string }) => {
    try {
      if (tx.type === 'withdrawal') {
        await approveWithdraw.mutateAsync({ txId: tx.id, walletId: tx.wallet_id, amount: tx.amount });
        toast.success('Disbursement berhasil dikirim ke Xendit');
      } else {
        await approveTx.mutateAsync({ txId: tx.id, walletId: tx.wallet_id, amount: tx.amount });
        toast.success('Transaksi berhasil disetujui');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui transaksi';
      toast.error(msg);
    }
  };

  const handleReject = async (txId: string) => {
    try {
      await rejectTx.mutateAsync(txId);
      toast.success('Transaksi ditolak');
    } catch {
      toast.error('Gagal menolak transaksi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Transaksi</h1>
            <p className="text-emerald-100 text-sm">Riwayat transaksi wallet</p>
          </div>
          <Link href="/admin/profile" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
            <User size={20} />
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex">
          {(['all', 'pending', 'success', 'failed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                filter === t
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'all' ? 'Semua' : statusLabels[t]}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data transaksi</span>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ArrowLeftRight size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">Tidak ada transaksi</p>
          </div>
        )}

        {filtered.map((tx) => (
          <div key={tx.id} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{typeLabels[tx.type] || tx.type}</h3>
                <p className="text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <span className={cn(
                  'font-bold',
                  tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full inline-block',
              tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
              tx.status === 'failed' ? 'bg-red-50 text-red-600' :
              'bg-orange-50 text-orange-600'
            )}>
              {statusLabels[tx.status] || tx.status}
            </div>

            {tx.status === 'pending' && (tx.type === 'topup' || tx.type === 'withdrawal') && (
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleApprove(tx)}
                  disabled={tx.type === 'withdrawal' ? approveWithdraw.isPending : approveTx.isPending}
                >
                  <CheckCircle size={14} /> Setujui
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(tx.id)}
                  disabled={rejectTx.isPending}
                >
                  <XCircle size={14} /> Tolak
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
