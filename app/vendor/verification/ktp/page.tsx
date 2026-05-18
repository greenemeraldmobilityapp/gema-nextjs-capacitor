'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    if (f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      let fileUrl = '';
      if (file) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const filePath = `${userId}/ktp/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('verification')
            .upload(filePath, file);
          if (uploadError) throw new Error(uploadError.message || 'Gagal upload foto KTP');
          const { data: urlData } = supabase.storage.from('verification').getPublicUrl(filePath);
          fileUrl = urlData?.publicUrl || '';
        }
      }

      if (!fileUrl) throw new Error('Gagal mendapatkan URL file KTP');

      await submitKtp.mutateAsync({
        userId: profile.id,
        nik: formData.nik,
        ktpName: formData.name,
        ktpUrl: fileUrl,
      });

      toast.success('Dokumen KTP berhasil disimpan');
      router.push('/vendor/verification/certification');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal upload KTP';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

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
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50">
              {preview ? (
                <img src={preview} alt="KTP preview" className="h-full object-contain rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm font-medium">Tap untuk upload foto KTP</p>
                  <p className="text-xs mt-1">Format JPG/PNG, maks 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
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
