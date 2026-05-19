'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useVendorServices, useUpdateService, useDeleteService } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image-utils';
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

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useAuthStore((s) => s.profile);
  const { data: services, isLoading: loadingServices } = useVendorServices(profile?.id);
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const serviceId = searchParams.get('id');
const service = services?.find((s) => s.id === serviceId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        category: service.category,
        price: service.price.toString(),
        description: service.description || '',
      });
      if (service.image_url) {
        setExistingImage(service.image_url);
      }
    }
  }, [service]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Hanya file gambar yang diizinkan', { duration: 4000 });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Maksimal ukuran gambar 5MB', { duration: 4000 });
      return;
    }

    setImageFile(file);
    setExistingImage(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (vendorId: string): Promise<string | null> => {
    if (!imageFile) return existingImage || null;

    const supabase = createClient();
    const compressed = await compressImage(imageFile);
    const ext = 'jpg';
    const fileName = `${vendorId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, compressed, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      toast.error(uploadError.message || 'Gagal mengunggah gambar', { duration: 5000 });
      return existingImage || null;
    }

    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !service) return;
    if (!formData.category) {
      toast.warning('Pilih kategori terlebih dahulu', { duration: 4000 });
      return;
    }

    setUploading(true);
    const submitPromise = (async () => {
      const imageUrl = await uploadImage(profile.id);

      await updateService.mutateAsync({
        id: service.id,
        vendor_id: profile.id,
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description || null,
        image_url: imageUrl,
      });
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
      setUploading(false);
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

  if (loadingServices) {
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

  const previewUrl = imagePreview || existingImage;
  const isPending = updateService.isPending || uploading;

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
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Gambar Layanan</label>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer"
              >
                <Upload size={28} />
                <span className="text-sm font-medium">Upload Gambar</span>
                <span className="text-xs">Maks. 5MB (JPEG, PNG, WebP)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
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
              {CATEGORIES.map(cat => (
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
    <Suspense>
      <EditForm />
    </Suspense>
  );
}
