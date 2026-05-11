'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, XCircle, Search, Store, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllVendors, useVerifyVendor } from '@/lib/services/useAdmin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminVendors() {
  const { data: vendors, isLoading, error } = useAllVendors();
  const verifyVendor = useVerifyVendor();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [search, setSearch] = useState('');

  const filteredVendors = (vendors || []).filter((v) => {
    if (filter === 'pending') return !v.is_verified;
    if (filter === 'verified') return v.is_verified;
    return true;
  }).filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.users?.full_name?.toLowerCase().includes(q) || v.specialization?.toLowerCase().includes(q);
  });

  const handleVerify = async (userId: string, verified: boolean) => {
    try {
      await verifyVendor.mutateAsync({ userId, verified });
      toast.success(verified ? 'Vendor berhasil diverifikasi' : 'Vendor dinonaktifkan');
    } catch {
      toast.error('Gagal memperbarui status vendor');
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
        <h1 className="text-xl font-bold">Vendor</h1>
        <p className="text-emerald-100 text-sm">Kelola verifikasi vendor</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex">
          {(['all', 'pending', 'verified'] as const).map((t) => (
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
              {t === 'all' ? 'Semua' : t === 'pending' ? 'Tertunda' : 'Terverifikasi'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data vendor</span>
          </div>
        )}

        {filteredVendors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Store size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">
              {search ? 'Vendor tidak ditemukan' : filter === 'pending' ? 'Semua vendor sudah terverifikasi' : 'Belum ada vendor'}
            </p>
          </div>
        )}

        {filteredVendors.map((vendor) => (
          <div key={vendor.user_id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Unknown'}</h3>
                <p className="text-sm text-gray-500">{vendor.users?.email}</p>
                {vendor.specialization && (
                  <p className="text-xs text-gray-400 mt-1">{vendor.specialization}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {vendor.is_verified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle size={12} />
                    Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <Clock size={12} />
                    Tertunda
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>⭐ {vendor.rating?.toFixed(1) || '0.0'}</span>
              <span>{vendor.total_jobs || 0} pekerjaan</span>
            </div>

            <div className="flex gap-2">
              {!vendor.is_verified ? (
                <Button
                  className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleVerify(vendor.user_id, true)}
                  disabled={verifyVendor.isPending}
                >
                  {verifyVendor.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Setujui
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleVerify(vendor.user_id, false)}
                  disabled={verifyVendor.isPending}
                >
                  <XCircle size={14} />
                  Nonaktifkan
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

