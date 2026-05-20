'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useVendorServices, useUpdateService, useDeleteService } from '@/lib/services/useVendors';
import { useServiceImages, useUploadMultipleServiceImages, useDeleteServiceImage } from '@/lib/services/useServiceImages';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'tukang-bangunan', label: 'Tukang Bangunan' },
  { id: 'teknisi-listrik', label: 'Teknisi Listrik' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'cat-interior', label: 'Cat & Interior' },
  { id: 'ac-kulkas', label: 'AC & Kulkas' },
  { id: 'elektronik', label: 'Elektronik' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'pest-control', label: 'Pest Control' },
];

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

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useAuthStore((s) => s.profile);
  const { data: services, isLoading: loadingServices } = useVendorServices(profile?.id);
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const deleteServiceImage = useDeleteServiceImage();
  const uploadImagesMutation = useUploadMultipleServiceImages();

  const serviceId = searchParams.get('id');
  const service = services?.find((s) => s.id === serviceId);

  const { data: existingImages, isLoading: loadingImages } = useServiceImages(serviceId ?? undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
  });
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        category: service.category,
        price: service.price.toString(),
        description: service.description || '',
      });
      setDurationMinutes(service.duration_minutes ?? null);
    }
  }, [service]);

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = (existingImages?.length || 0) + newFiles.length;
    const total = existingCount + files.length;
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

    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        setNewPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(f);
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (image: { id: string; image_url: string }) => {
    if (!serviceId) return;
    setDeletingImageId(image.id);
    const delPromise = deleteServiceImage.mutateAsync({
      serviceId,
      imageId: image.id,
      imageUrl: image.image_url,
    });

    toast.promise(delPromise, {
      loading: 'Menghapus gambar...',
      success: 'Gambar berhasil dihapus',
      error: (err) => err?.message || 'Gagal menghapus gambar',
      duration: 3000,
    });

    try {
      await delPromise;
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !service) return;
    if (!formData.category) {
      toast.warning('Pilih kategori terlebih dahulu', { duration: 4000 });
      return;
    }

    setSaving(true);
    const submitPromise = (async () => {
      await updateService.mutateAsync({
        id: service.id,
        vendor_id: profile.id,
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description || null,
        duration_minutes: durationMinutes,
      });

      if (newFiles.length > 0) {
        await uploadImagesMutation.mutateAsync({
          vendorId: profile.id,
          serviceId: service.id,
          files: newFiles,
        });
      }
    })();

    toast.promise(submitPromise, {
      loading: 'Memperbarui portofolio...',
      success: () => {
        router.push('/vendor/portfolio');
        return 'Portofolio berhasil diperbarui';
      },
      error: (err) => err?.message || 'Gagal memperbarui portofolio',
      duration: 4000,
    });

    try {
      await submitPromise;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile?.id || !service) return;

    const deletePromise = deleteService.mutateAsync({ id: service.id, vendor_id: profile.id });

    toast.promise(deletePromise, {
      loading: 'Menghapus portofolio...',
      success: () => {
        router.push('/vendor/portfolio');
        return 'Portofolio berhasil dihapus';
      },
      error: (err) => err?.message || 'Gagal menghapus portofolio',
      duration: 4000,
    });

    try {
      await deletePromise;
    } catch {
      // toast handled by toast.promise
    }
  };

  if (loadingServices || loadingImages) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-400">
        <p className="font-medium">Portofolio tidak ditemukan</p>
        <Link href="/vendor/portfolio" className="mt-4 text-sm text-emerald-600 hover:underline">
          Kembali
        </Link>
      </div>
    );
  }

  const totalImages = (existingImages?.length || 0) + newFiles.length;
  const isPending = updateService.isPending || saving || uploadImagesMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <header className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/portfolio" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Edit Portofolio</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Gambar Layanan ({totalImages}/{MAX_IMAGES})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {existingImages?.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                  <Image src={img.image_url} alt={formData.title || 'Gambar layanan'} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    disabled={deletingImageId === img.id}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {deletingImageId === img.id ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </div>
              ))}
              {newPreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-emerald-300 ring-2 ring-emerald-200 group">
                  <Image src={preview} alt={`Gambar baru ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200",
                    formData.category === cat.id
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  )}
                >
                  {cat.label}
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

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            variant="premium"
            size="lg"
            className="flex-1 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span>
            ) : 'Simpan Perubahan'}
          </Button>

          {confirmDelete ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setConfirmDelete(false)}
                className="h-12 rounded-xl border-stone-200"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={deleteService.isPending}
                className="h-12 rounded-xl"
              >
                {deleteService.isPending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setConfirmDelete(true)}
              className="h-12 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function VendorEditPortfolioPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>}>
      <EditForm />
    </Suspense>
  );
}
