'use client';

import Link from 'next/link';
import { Plus, Briefcase, Wrench, Zap, Droplets, Paintbrush, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendorServices } from '@/lib/services/useVendors';

const categoryIcons: Record<string, typeof Wrench> = {
  'AC': Wrench,
  'Listrik': Zap,
  'Pipa': Droplets,
  'Cat': Paintbrush,
};

export default function VendorPortfolioPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: services, isLoading, error } = useVendorServices(profile?.id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Portofolio</h1>
        <Link href="/vendor/portfolio/add">
          <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-1.5">
            <Plus size={18} />
            Tambah
          </Button>
        </Link>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Memuat portofolio...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-red-400">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Gagal memuat portofolio</p>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Briefcase size={48} className="mb-3 opacity-50" />
            <p className="font-medium">Belum ada portofolio</p>
            <p className="text-sm mt-1">Tambahkan layanan yang Anda tawarkan</p>
            <Link href="/vendor/portfolio/add" className="mt-4">
              <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Plus size={18} className="mr-1" />
                Tambah Portofolio
              </Button>
            </Link>
          </div>
        ) : (
          services.map((service) => {
            const Icon = categoryIcons[service.category] || Briefcase;
            return (
              <div key={service.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{service.category}</p>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-700">Rp {service.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
