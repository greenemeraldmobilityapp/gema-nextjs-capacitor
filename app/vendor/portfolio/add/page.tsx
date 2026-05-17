'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useCreateService } from '@/lib/services/useVendors';
import { cn } from '@/lib/utils';
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
    <div className="flex flex-col min-h-screen bg-stone-50">
      <header className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/portfolio" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Tambah Portofolio</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Layanan</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="cth: Perbaikan AC Bocor"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Kategori</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200",
                    formData.category === cat
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Harga (Rp)</label>
            <Input
              required
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="150000"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Jelaskan layanan yang Anda tawarkan..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={createService.isPending}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {createService.isPending ? (
            <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span>
          ) : 'Simpan Portofolio'}
        </Button>
      </form>
    </div>
  );
}
