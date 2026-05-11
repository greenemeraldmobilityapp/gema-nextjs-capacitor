'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, ShieldAlert, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFraudAlerts, useUpdateFraudAlert } from '@/lib/services/useAdmin';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusLabels: Record<string, string> = {
  open: 'Terbuka',
  investigating: 'Diselidiki',
  resolved: 'Selesai',
  false_positive: 'False Positive',
};

const typeLabels: Record<string, string> = {
  role_escalation: 'Role Escalation',
  burst_registration: 'Registrasi Massal',
  rapid_completion: 'Penyelesaian Cepat',
  self_dealing: 'Transaksi Mandiri',
  review_bomb: 'Review Bomb',
  off_platform: 'Kontak Off-Platform',
  negative_balance: 'Saldo Negatif',
  stale_transaction: 'Transaksi Tertunda',
};

export default function AdminFraud() {
  const { data: alerts, isLoading, error } = useFraudAlerts();
  const updateAlert = useUpdateFraudAlert();
  const profile = useAuthStore((s) => s.profile);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = (alerts || []).filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  });

  const handleUpdate = async (id: string, status: 'investigating' | 'resolved' | 'false_positive') => {
    try {
      await updateAlert.mutateAsync({ id, status, resolvedBy: profile?.id });
      toast.success('Status berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui status');
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
        <h1 className="text-xl font-bold">Fraud Alerts</h1>
        <p className="text-emerald-100 text-sm">Monitoring aktivitas mencurigakan</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex overflow-x-auto gap-1">
          {['all', 'open', 'investigating', 'resolved', 'false_positive'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'shrink-0 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                filter === s ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s === 'all' ? 'Semua' : statusLabels[s] || s}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari alert..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertTriangle size={16} />
            <span>Gagal memuat data alerts</span>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShieldAlert size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">Tidak ada alert</p>
          </div>
        )}

        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'bg-white rounded-xl shadow-sm border-l-4 p-4 space-y-3 cursor-pointer',
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-gray-300'
            )}
            onClick={() => setExpanded((prev) => ({ ...prev, [alert.id]: !prev[alert.id] }))}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full border',
                    severityColors[alert.severity] || ''
                  )}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {typeLabels[alert.type] || alert.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(alert.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={cn(
                'shrink-0 text-xs font-medium px-2 py-1 rounded-full',
                alert.status === 'open' ? 'bg-red-50 text-red-600' :
                alert.status === 'investigating' ? 'bg-blue-50 text-blue-600' :
                alert.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                'bg-gray-50 text-gray-500'
              )}>
                {statusLabels[alert.status] || alert.status}
              </span>
            </div>

            {expanded[alert.id] && (
              <div className="space-y-3 pt-2 border-t">
                {alert.metadata && (
                  <div className="p-2 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 max-h-32 overflow-y-auto">
                    {JSON.stringify(alert.metadata, null, 2)}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {alert.status === 'open' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                        onClick={(e) => { e.stopPropagation(); handleUpdate(alert.id, 'investigating'); }}
                        disabled={updateAlert.isPending}
                      >
                        Selidiki
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        onClick={(e) => { e.stopPropagation(); handleUpdate(alert.id, 'resolved'); }}
                        disabled={updateAlert.isPending}
                      >
                        <CheckCircle size={14} /> Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-gray-200 text-gray-500"
                        onClick={(e) => { e.stopPropagation(); handleUpdate(alert.id, 'false_positive'); }}
                        disabled={updateAlert.isPending}
                      >
                        <XCircle size={14} /> False Positive
                      </Button>
                    </>
                  )}
                  {alert.status === 'investigating' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        onClick={(e) => { e.stopPropagation(); handleUpdate(alert.id, 'resolved'); }}
                        disabled={updateAlert.isPending}
                      >
                        <CheckCircle size={14} /> Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-gray-200 text-gray-500"
                        onClick={(e) => { e.stopPropagation(); handleUpdate(alert.id, 'false_positive'); }}
                        disabled={updateAlert.isPending}
                      >
                        <XCircle size={14} /> False Positive
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
