'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { useSubmitKtp } from '@/lib/services/useVerification';
import { toast } from 'sonner';

const supabase = createClient();

async function fileToBuffer(file: File): Promise<{ buffer: ArrayBuffer; contentType: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ buffer: reader.result as ArrayBuffer, contentType: file.type || 'image/jpeg', fileName: file.name });
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

export default function KtpVerificationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const submitKtp = useSubmitKtp();
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ nik: '', name: '' });

  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (ktpPreview) URL.revokeObjectURL(ktpPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [ktpPreview, selfiePreview]);

  const handleKtpFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (ktpPreview) URL.revokeObjectURL(ktpPreview);
    setKtpFile(f);
    setKtpPreview(URL.createObjectURL(f));
  };

  const handleSelfieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(f);
    setSelfiePreview(URL.createObjectURL(f));
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

      const ktpData = await fileToBuffer(ktpFile!);
      const safeKtpName = ktpData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ktpPath = `${userId}/ktp/${Date.now()}_${safeKtpName}`;
      const { error: ktpUploadError } = await supabase.storage
        .from('verification')
        .upload(ktpPath, ktpData.buffer, { contentType: ktpData.contentType });
      if (ktpUploadError) throw new Error(ktpUploadError.message || 'Gagal upload foto KTP');
      const { data: ktpUrlData } = supabase.storage.from('verification').getPublicUrl(ktpPath);
      const ktpUrl = ktpUrlData?.publicUrl || '';
      if (!ktpUrl) throw new Error('Gagal mendapatkan URL file KTP');

      const selfieData = await fileToBuffer(selfieFile!);
      const safeSelfieName = selfieData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const selfiePath = `${userId}/selfie/${Date.now()}_${safeSelfieName}`;
      const { error: selfieUploadError } = await supabase.storage
        .from('verification')
        .upload(selfiePath, selfieData.buffer, { contentType: selfieData.contentType });
      if (selfieUploadError) throw new Error(selfieUploadError.message || 'Gagal upload foto selfie');
      const { data: selfieUrlData } = supabase.storage.from('verification').getPublicUrl(selfiePath);
      const selfieUrl = selfieUrlData?.publicUrl || '';
      if (!selfieUrl) throw new Error('Gagal mendapatkan URL file selfie');

      await submitKtp.mutateAsync({
        userId: profile.id,
        nik: formData.nik,
        ktpName: formData.name,
        ktpUrl: ktpUrl,
        selfieUrl: selfieUrl,
      });

      cleanupOldFiles(userId, 'ktp', ktpPath.split('/').pop()!);
      cleanupOldFiles(userId, 'selfie', selfiePath.split('/').pop()!);

      router.push('/vendor/verification/certification');
    })();

    toast.promise(submitPromise, {
      loading: 'Menyimpan dokumen...',
      success: 'Dokumen berhasil disimpan',
      error: (err) => err instanceof Error ? err.message : 'Gagal upload dokumen',
      duration: 5000,
    });

    try {
      await submitPromise;
    } finally {
      setSaving(false);
    }
  };

  async function cleanupOldFiles(userId: string, folder: string, keepFileName: string) {
    try {
      const { data: files } = await supabase.storage
        .from('verification')
        .list(`${userId}/${folder}`);
      if (!files?.length) return;
      const toDelete = files
        .filter((f) => f.name !== keepFileName)
        .map((f) => `${userId}/${folder}/${f.name}`);
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
          <h1 className="font-heading text-lg font-bold text-stone-800">Verifikasi Identitas</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-5">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Foto KTP</label>
            <div
              onClick={() => ktpInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50 overflow-hidden"
            >
              {ktpPreview ? (
                <Image src={ktpPreview} alt="KTP preview" fill className="object-contain" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm font-medium">Upload foto KTP</p>
                  <p className="text-xs mt-1">Format JPG/PNG, maks 5MB</p>
                </div>
              )}
            </div>
            <input ref={ktpInputRef} type="file" accept="image/*" capture="environment" onChange={handleKtpFile} className="hidden" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 block">
              Selfie + Pegang KTP
            </label>
            <div
              onClick={() => selfieInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50 overflow-hidden"
            >
              {selfiePreview ? (
                <Image src={selfiePreview} alt="Selfie preview" fill className="object-contain" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Camera size={32} className="mb-2" />
                  <p className="text-sm font-medium">Ambil foto selfie</p>
                  <p className="text-xs mt-1">Pastikan KTP terlihat jelas di foto</p>
                </div>
              )}
            </div>
            <input ref={selfieInputRef} type="file" accept="image/*" capture="user" onChange={handleSelfieFile} className="hidden" />
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
          disabled={saving || !ktpFile || !selfieFile || !formData.nik || !formData.name}
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
