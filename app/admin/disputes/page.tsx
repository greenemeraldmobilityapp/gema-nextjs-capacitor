'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllDisputes, useResolveDispute } from '@/lib/services/useAdmin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminDisputes() {
  const { data: disputes, isLoading, error } = useAllDisputes();
  const resolveDispute = useResolveDispute();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [resolutionText, setResolutionText] = useState<Record<string, string>>({});

  const filteredDisputes = (disputes || []).filter((d) => {
    if (filter === 'open') return d.status === 'open';
    if (filter === 'resolved') return d.status === 'resolved';
    return true;
  });

  const handleResolve = async (disputeId: string) => {
    const resolution = resolutionText[disputeId];
    if (!resolution?.trim()) {
      toast.error('Harap isi catatan resolusi');
      return;
    }
    try {
      await resolveDispute.mutateAsync({ disputeId, resolution: resolution.trim() });
      toast.success('Sengketa berhasil diselesaikan');
      setResolutionText((prev) => ({ ...prev, [disputeId]: '' }));
    } catch {
      toast.error('Gagal menyelesaikan sengketa');
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
        <h1 className="text-xl font-bold">Sengketa</h1>
        <p className="text-emerald-100 text-sm">Kelola sengketa pesanan</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex">
          {(['all', 'open', 'resolved'] as const).map((t) => (
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
              {t === 'all' ? 'Semua' : t === 'open' ? 'Aktif' : 'Selesai'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data sengketa</span>
          </div>
        )}

        {filteredDisputes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Scale size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">Tidak ada sengketa</p>
          </div>
        )}

        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {dispute.orders?.service_name || 'Pesanan tidak ditemukan'}
                </h3>
                <p className="text-sm text-gray-500">
                  Dibuka oleh: {dispute.users?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(dispute.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={cn(
                'shrink-0 text-xs font-medium px-2 py-1 rounded-full',
                dispute.status === 'open'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              )}>
                {dispute.status === 'open' ? 'Aktif' : 'Selesai'}
              </span>
            </div>

            {dispute.orders && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Rp {dispute.orders.total_amount.toLocaleString()}</span>
                <span>Status: {dispute.orders.order_status}</span>
              </div>
            )}

            {dispute.status === 'resolved' && dispute.resolution && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Resolusi:</p>
                <p>{dispute.resolution}</p>
              </div>
            )}

            {dispute.status === 'open' && (
              <div className="space-y-2">
                <textarea
                  placeholder="Catatan resolusi..."
                  value={resolutionText[dispute.id] || ''}
                  onChange={(e) => setResolutionText((prev) => ({ ...prev, [dispute.id]: e.target.value }))}
                  className="w-full h-20 p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                <Button
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleResolve(dispute.id)}
                  disabled={resolveDispute.isPending}
                >
                  {resolveDispute.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Selesaikan Sengketa
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
