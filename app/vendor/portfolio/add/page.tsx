'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useCreateService } from '@/lib/services/useVendors';
import { toast } from 'sonner';

const CATEGORIES = ['AC', 'Listrik', 'Pipa', 'Cat', 'Lainnya'];

export default function VendorAddPortfolioPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const createService = useCreateService();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      await createService.mutateAsync({
        vendor_id: profile.id,
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description || undefined,
      });
      toast.success('Portofolio berhasil ditambahkan');
      router.push('/vendor/portfolio');
    } catch {
      toast.error('Gagal menambahkan portofolio');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/vendor/portfolio" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Tambah Portofolio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nama Layanan</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="cth: Perbaikan AC Bocor"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Kategori</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    formData.category === cat
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Harga (Rp)</label>
            <Input
              required
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="150000"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Jelaskan layanan yang Anda tawarkan..."
              className="w-full h-24 bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={createService.isPending}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm disabled:opacity-50"
        >
          {createService.isPending ? (
            <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span>
          ) : 'Simpan Portofolio'}
        </Button>
      </form>
    </div>
  );
}
