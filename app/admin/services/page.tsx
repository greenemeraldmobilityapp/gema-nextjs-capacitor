'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, XCircle, Search, Briefcase, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllServices, useUpdateServiceStatus } from '@/lib/services/useAdmin';
import { useCategories } from '@/lib/services/useCategories';
import { getCategoryLabel } from '@/lib/category-utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Tertunda',
  active: 'Aktif',
  rejected: 'Ditolak',
};

export default function AdminServices() {
  const { data: services, isLoading, error } = useAllServices();
  const { data: categories = [] } = useCategories();
  const updateStatus = useUpdateServiceStatus();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const filtered = (services || []).filter((s) => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'active') return s.status === 'active';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  }).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q)
      || s.vendor_profiles?.users?.full_name?.toLowerCase().includes(q);
  });

  const handleApprove = async (serviceId: string) => {
    const promise = updateStatus.mutateAsync({ serviceId, status: 'active' });

    toast.promise(promise, {
      loading: 'Menyetujui portofolio...',
      success: 'Portofolio berhasil disetujui',
      error: (err) => err instanceof Error ? err.message : 'Gagal menyetujui portofolio',
      duration: 5000,
    });

    try { await promise; } catch {}
  };

  const handleReject = async (serviceId: string) => {
    const promise = updateStatus.mutateAsync({ serviceId, status: 'rejected' });

    toast.promise(promise, {
      loading: 'Menolak portofolio...',
      success: 'Portofolio ditolak',
      error: (err) => err instanceof Error ? err.message : 'Gagal menolak portofolio',
      duration: 5000,
    });

    try { await promise; } catch {}
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
            <h1 className="text-xl font-bold">Portofolio Vendor</h1>
            <p className="text-emerald-100 text-sm">Kelola layanan vendor</p>
          </div>
          <Link href="/admin/profile" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
            <User size={20} />
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-1 flex">
          {(['all', 'pending', 'active', 'rejected'] as const).map((t) => (
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

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari layanan atau vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data portofolio</span>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Briefcase size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">
              {search ? 'Portofolio tidak ditemukan' : filter === 'pending' ? 'Semua portofolio sudah diproses' : 'Belum ada portofolio'}
            </p>
          </div>
        )}

        {filtered.map((service) => {
          const vendorName = service.vendor_profiles?.users?.full_name || 'Unknown Vendor';

          return (
            <div key={service.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Store size={14} className="text-gray-400 shrink-0" />
                    <span className="text-xs font-medium text-gray-500 truncate">{vendorName}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{service.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getCategoryLabel(categories, service.category)}
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">
                      Rp {service.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                  )}
                </div>
                <div className="shrink-0 ml-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    service.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                    service.status === 'rejected' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  )}>
                    {statusLabels[service.status] || service.status}
                  </span>
                </div>
              </div>

              {service.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(service.id)}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Setujui
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(service.id)}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle size={14} />
                    Tolak
                  </Button>
                </div>
              )}

              {service.status === 'rejected' && (
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(service.id)}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle size={14} />
                    Aktifkan
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
