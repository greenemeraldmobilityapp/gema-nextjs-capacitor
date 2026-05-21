'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useCreateService } from '@/lib/services/useVendors';
import { useUploadMultipleServiceImages } from '@/lib/services/useServiceImages';
import { useCategories } from '@/lib/services/useCategories';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DURATION_TYPES = [
  { value: 30, label: '30 menit' },
  { value: 60, label: '1 jam' },
  { value: 120, label: '2 jam' },
  { value: 180, label: '3 jam' },
  { value: 240, label: '4 jam' },
  { value: 480, label: '8 jam (1 hari)' },
  { value: 960, label: '2 hari' },
  { value: 1440, label: '3+ hari' },
];

const MAX_IMAGES = 5;

export default function VendorAddPortfolioPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const createService = useCreateService();
  const uploadImagesMutation = useUploadMultipleServiceImages();
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    categoryId: '',
    price: '',
    description: '',
  });
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = imageFiles.length + files.length;
    if (total > MAX_IMAGES) {
      toast.warning(`Maksimal ${MAX_IMAGES} gambar`, { duration: 4000 });
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.warning(`"${f.name}" bukan file gambar`, { duration: 4000 });
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`"${f.name}" melebihi 5MB`, { duration: 4000 });
        return false;
      }
      return true;
    });

    const newPreviews: string[] = [];
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(f);
    });

    setImageFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (!formData.category || !formData.categoryId) {
      toast.warning('Pilih kategori terlebih dahulu', { duration: 4000 });
      return;
    }

    setSaving(true);
    const submitPromise = (async () => {
      const service = await createService.mutateAsync({
        vendor_id: profile.id,
        title: formData.title,
        category: formData.category,
        category_id: formData.categoryId || undefined,
        price: Number(formData.price),
        description: formData.description || undefined,
        duration_minutes: durationMinutes,
      });

      if (imageFiles.length > 0) {
        await uploadImagesMutation.mutateAsync({
          vendorId: profile.id,
          serviceId: service.id,
          files: imageFiles,
        });
      }
    })();

    toast.promise(submitPromise, {
      loading: 'Menambahkan portofolio...',
      success: () => {
        router.push('/vendor/portfolio');
        return 'Portofolio berhasil ditambahkan';
      },
      error: (err) => err?.message || 'Gagal menambahkan portofolio',
      duration: 4000,
    });

    try {
      await submitPromise;
    } finally {
      setSaving(false);
    }
  };

  const isPending = createService.isPending || saving || uploadImagesMutation.isPending;

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
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Gambar Layanan (maks. {MAX_IMAGES})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                  <Image src={preview} alt={`Gambar ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {imageFiles.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer"
                >
                  <Upload size={20} />
                  <span className="text-[10px] font-medium">Tambah</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImagesSelect}
              className="hidden"
            />
            <p className="text-[11px] text-stone-400">Format: JPEG, PNG, WebP. Maks. 5MB per gambar</p>
          </div>

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
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.slug, categoryId: cat.id }))}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200",
                    formData.category === cat.slug
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Durasi</label>
              <select
                value={durationMinutes ?? ''}
                onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 px-3 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              >
                <option value="">Pilih durasi</option>
                {DURATION_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
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
          disabled={isPending}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span>
          ) : 'Simpan Portofolio'}
        </Button>
      </form>
    </div>
  );
}
