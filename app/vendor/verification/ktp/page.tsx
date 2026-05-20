'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { useSubmitKtp } from '@/lib/services/useVerification';
import { toast } from 'sonner';

const supabase = createClient();

export default function KtpVerificationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const submitKtp = useSubmitKtp();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDataPromiseRef = useRef<Promise<{ buffer: ArrayBuffer; contentType: string; fileName: string } | null>>(Promise.resolve(null));
  const [formData, setFormData] = useState({ nik: '', name: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    fileDataPromiseRef.current = new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ buffer: reader.result as ArrayBuffer, contentType: f.type || 'image/jpeg', fileName: f.name });
      reader.onerror = () => { if (process.env.NODE_ENV !== 'production') console.error('[KTP] FileReader error'); resolve(null); };
      reader.readAsArrayBuffer(f);
    });
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.warning('Silakan login terlebih dahulu', { duration: 4000 });
      return;
    }
    setSaving(true);
    const submitPromise = (async () => {
      const userId = profile.id;
      const fileData = await fileDataPromiseRef.current;
      if (!fileData) throw new Error('Gagal membaca file KTP');
      const safeName = fileData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${userId}/ktp/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('verification')
        .upload(filePath, fileData.buffer, { contentType: fileData.contentType });
      if (uploadError) throw new Error(uploadError.message || 'Gagal upload foto KTP');
      const { data: urlData } = supabase.storage.from('verification').getPublicUrl(filePath);
      const fileUrl = urlData?.publicUrl || '';

      if (!fileUrl) throw new Error('Gagal mendapatkan URL file KTP');

      await submitKtp.mutateAsync({
        userId: profile.id,
        nik: formData.nik,
        ktpName: formData.name,
        ktpUrl: fileUrl,
      });

      cleanupOldFiles(userId, filePath.split('/').pop()!);

      router.push('/vendor/verification/certification');
    })();

    toast.promise(submitPromise, {
      loading: 'Menyimpan dokumen KTP...',
      success: 'Dokumen KTP berhasil disimpan',
      error: (err) => err instanceof Error ? err.message : 'Gagal upload KTP',
      duration: 5000,
    });

    try {
      await submitPromise;
    } finally {
      setSaving(false);
    }
  };

  async function cleanupOldFiles(userId: string, keepFileName: string) {
    try {
      const { data: files } = await supabase.storage
        .from('verification')
        .list(`${userId}/ktp`);
      if (!files?.length) return;
      const toDelete = files
        .filter((f) => f.name !== keepFileName)
        .map((f) => `${userId}/ktp/${f.name}`);
      if (toDelete.length > 0) {
        await supabase.storage.from('verification').remove(toDelete);
      }
    } catch {
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/verification" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Verifikasi KTP</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Foto KTP</label>
            <div
              onClick={() => inputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50"
            >
              {preview ? (
                <Image src={preview} alt="KTP preview" fill className="object-contain !rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm font-medium">Ketuk untuk upload foto KTP</p>
                  <p className="text-xs mt-1">Format JPG/PNG, maks 5MB</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">NIK</label>
            <Input
              required
              value={formData.nik}
              onChange={(e) => setFormData(p => ({ ...p, nik: e.target.value }))}
              placeholder="16 digit NIK"
              maxLength={16}
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Sesuai KTP</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Nama lengkap"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || !file || !formData.nik || !formData.name}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {saving ? <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span> : 'Simpan & Lanjutkan'}
        </Button>
      </form>
    </div>
  );
}
