'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { useLatestSubmission, useSubmitCertificate } from '@/lib/services/useVerification';
import { toast } from 'sonner';

const supabase = createClient();

export default function CertificationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: submission, isLoading } = useLatestSubmission(profile?.id);
  const submitCertificate = useSubmitCertificate();
  const [formData, setFormData] = useState({ name: '', publisher: '', year: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (submission?.certificate_name) {
      setFormData({
        name: submission.certificate_name || '',
        publisher: submission.certificate_issuer || '',
        year: submission.certificate_year?.toString() || '',
      });
    }
  }, [submission]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(f);
      if (f.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(f));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !submission?.id) return;
    setSaving(true);
    try {
      let certUrl = '';
      if (file) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const filePath = `${userId}/cert/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('verification')
            .upload(filePath, file);
          if (uploadError) throw new Error('Gagal upload file sertifikat');
          const { data: urlData } = supabase.storage.from('verification').getPublicUrl(filePath);
          certUrl = urlData?.publicUrl || '';
        }
      }

      await submitCertificate.mutateAsync({
        userId: profile.id,
        submissionId: submission.id,
        certificateUrl: certUrl,
        certificateName: formData.name,
        certificateIssuer: formData.publisher,
        certificateYear: parseInt(formData.year) || new Date().getFullYear(),
      });

      toast.success('Sertifikat berhasil disimpan');
      router.push('/vendor/verification/review');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan sertifikat';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-stone-50">
        <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/vendor/verification/ktp" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-heading text-lg font-bold text-stone-800">Sertifikat Profesi</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/verification/ktp" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Sertifikat Profesi</h1>
        </div>
      </div>

      {!submission && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <AlertCircle size={40} className="text-stone-300 mb-3" />
          <p className="text-sm text-stone-500">Silakan lengkapi data KTP terlebih dahulu</p>
          <Link href="/vendor/verification/ktp" className="mt-4">
            <Button variant="premium">Kembali ke Verifikasi KTP</Button>
          </Link>
        </div>
      )}

      {submission && (
        <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Upload Sertifikat (Opsional)</label>
              <label className="flex flex-col items-center justify-center w-full min-h-[8rem] border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview sertifikat" className="w-full object-contain max-h-40 rounded-2xl" />
                ) : file ? (
                  <div className="flex flex-col items-center py-6 text-stone-400">
                    <FileText size={32} className="mb-1" />
                    <p className="text-sm font-medium text-stone-500">{file.name}</p>
                  </div>
                ) : submission.certificate_url ? (
                  <div className="flex flex-col items-center py-6 text-emerald-600">
                    {submission.certificate_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                      <img
                        src={submission.certificate_url}
                        alt="Sertifikat terupload"
                        className="w-full object-contain max-h-32 rounded-xl opacity-60"
                      />
                    ) : (
                      <>
                        <FileText size={32} className="mb-1" />
                        <p className="text-sm font-medium">Sertifikat sudah diupload</p>
                      </>
                    )}
                    <p className="text-xs mt-2 text-stone-400">Tap untuk mengganti file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-stone-400">
                    <Upload size={28} className="mb-2" />
                    <p className="text-sm font-medium">Tap untuk upload sertifikat</p>
                    <p className="text-xs mt-1">Format PDF/JPG/PNG, maks 5MB</p>
                  </div>
                )}
                <input type="file" accept=".pdf,image/*" onChange={handleFile} className="hidden" />
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Sertifikat</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="cth: Sertifikat Teknisi AC"
                className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Penerbit</label>
              <Input
                value={formData.publisher}
                onChange={(e) => setFormData(p => ({ ...p, publisher: e.target.value }))}
                placeholder="Lembaga/instansi penerbit"
                className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tahun</label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                placeholder="2024"
                maxLength={4}
                className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/vendor/verification/review" className="flex-1">
              <Button type="button" variant="outline" size="lg" className="w-full h-12 rounded-xl border-2 border-stone-200">
                Lewati
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              variant="premium"
              size="lg"
              className="flex-1 disabled:opacity-50"
            >
              {saving ? <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span> : 'Simpan & Lanjutkan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
