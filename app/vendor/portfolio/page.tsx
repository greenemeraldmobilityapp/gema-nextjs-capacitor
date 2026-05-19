'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Wrench, Zap, Droplets, Paintbrush, Thermometer, Cable, Hammer, Bug, Loader2, AlertCircle, ImageIcon, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendorServices, useDeleteService } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categoryIcons: Record<string, typeof Wrench> = {
  'tukang-bangunan': Wrench,
  'teknisi-listrik': Zap,
  'plumbing': Droplets,
  'cat-interior': Paintbrush,
  'ac-kulkas': Thermometer,
  'elektronik': Cable,
  'furniture': Hammer,
  'pest-control': Bug,
};

const categoryLabels: Record<string, string> = {
  'tukang-bangunan': 'Tukang Bangunan',
  'teknisi-listrik': 'Teknisi Listrik',
  'plumbing': 'Plumbing',
  'cat-interior': 'Cat & Interior',
  'ac-kulkas': 'AC & Kulkas',
  'elektronik': 'Elektronik',
  'furniture': 'Furniture',
  'pest-control': 'Pest Control',
};

const ALL_CATEGORY = 'all';

export default function VendorPortfolioPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: services, isLoading, error } = useVendorServices(profile?.id);
  const deleteService = useDeleteService();
  const [filter, setFilter] = useState(ALL_CATEGORY);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredServices = services?.filter(
    (s) => filter === ALL_CATEGORY || s.category === filter
  );

  const handleDelete = async (id: string) => {
    if (!profile?.id) return;
    setDeletingId(id);
    const deletePromise = deleteService.mutateAsync({ id, vendor_id: profile.id });

    toast.promise(deletePromise, {
      loading: 'Menghapus portofolio...',
      success: 'Portofolio berhasil dihapus',
      error: (err) => err?.message || 'Gagal menghapus portofolio',
      duration: 4000,
    });

    try {
      await deletePromise;
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <header className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-heading text-xl font-bold text-stone-800">Portofolio</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
            >
              {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
            <Link href="/vendor/portfolio/add">
              <Button variant="premium" size="lg" className="gap-1.5">
                <Plus size={18} />
                Tambah
              </Button>
            </Link>
          </div>
        </div>

        {services && services.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter(ALL_CATEGORY)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                filter === ALL_CATEGORY
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              )}
            >
              Semua ({services.length})
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = services.filter((s) => s.category === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    filter === key
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  )}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat portofolio...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat portofolio</p>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-stone-400">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={32} className="opacity-50" />
            </div>
            <p className="font-medium">Belum ada portofolio</p>
            <p className="text-sm mt-1">Tambahkan layanan yang Anda tawarkan</p>
            <Link href="/vendor/portfolio/add" className="mt-4">
              <Button variant="premium" size="lg">
                <Plus size={18} />
                Tambah Portofolio
              </Button>
            </Link>
          </div>
        ) : filteredServices && filteredServices.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-stone-400">
            <Briefcase size={32} className="opacity-50 mb-3" />
            <p className="font-medium">Tidak ada layanan di kategori ini</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredServices?.map((service) => {
              const Icon = categoryIcons[service.category] || Briefcase;
              return (
                <div
                  key={service.id}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-elegant hover:shadow-lifted transition-all duration-300"
                >
                  <Link href={`/vendor/portfolio/edit?id=${service.id}`}>
                    <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={32} className="text-stone-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-bold text-sm">Rp {service.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                          {categoryLabels[service.category] || service.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-stone-800 line-clamp-2 leading-snug">{service.title}</h3>
                      {service.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                  </Link>

                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => router.push(`/vendor/portfolio/edit/${service.id}`)}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-600 hover:bg-white shadow-sm transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={deletingId === service.id}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm transition-colors disabled:opacity-50"
                    >
                      {deletingId === service.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  <div className="absolute top-2 left-2">
                    {service.status === 'pending' ? (
                      <span className="bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        Tertunda
                      </span>
                    ) : service.status === 'rejected' ? (
                      <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        Ditolak
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredServices?.map((service) => {
              const Icon = categoryIcons[service.category] || Briefcase;
              return (
                <div
                  key={service.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {service.image_url ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center shrink-0">
                        <Icon size={24} className="text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                          {categoryLabels[service.category] || service.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-800">{service.title}</h3>
                      {service.description && (
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{service.description}</p>
                      )}
                      <p className="font-bold text-emerald-600 text-sm mt-1">Rp {service.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {service.status === 'pending' && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Tertunda
                        </span>
                      )}
                      {service.status === 'rejected' && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Ditolak
                        </span>
                      )}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => router.push(`/vendor/portfolio/edit/${service.id}`)}
                        className="w-9 h-9 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors flex items-center justify-center"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {deletingId === service.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
