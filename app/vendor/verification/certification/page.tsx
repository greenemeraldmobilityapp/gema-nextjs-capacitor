'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, AlertCircle } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDataPromiseRef = useRef<Promise<{ buffer: ArrayBuffer; contentType: string; fileName: string } | null>>(Promise.resolve(null));
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
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    fileDataPromiseRef.current = new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = { buffer: reader.result as ArrayBuffer, contentType: f.type || 'image/jpeg', fileName: f.name };
        resolve(data);
      };
      reader.onerror = () => { resolve(null); };
      reader.readAsArrayBuffer(f);
    });
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const hasCertData = file !== null || formData.name.trim() || formData.publisher.trim() || formData.year.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Cert] handleSubmit, submission:', submission?.id);
    if (!profile?.id) {
      toast.warning('Silakan login terlebih dahulu', { duration: 4000 });
      return;
    }
    if (!submission?.id) {
      toast.warning('Data verifikasi tidak ditemukan, silakan ulangi dari KTP', { duration: 4000 });
      return;
    }
    setSaving(true);
    const submitPromise = (async () => {
      let certUrl: string | null = null;
      let uploadedFileName: string | null = null;
      const fileData = await fileDataPromiseRef.current;
      if (fileData) {
        const userId = profile.id;
        const safeName = fileData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        uploadedFileName = `${Date.now()}_${safeName}`;
        const filePath = `${userId}/certificate/${uploadedFileName}`;
        const { error: uploadError } = await supabase.storage
          .from('verification')
          .upload(filePath, fileData.buffer, { contentType: fileData.contentType });
        if (uploadError) {
          throw new Error(uploadError.message || 'Gagal upload file sertifikat');
        }
        const { data: urlData } = supabase.storage.from('verification').getPublicUrl(filePath);
        certUrl = urlData?.publicUrl || null;
        if (!certUrl) throw new Error('Gagal mendapatkan URL sertifikat');
      }

      await submitCertificate.mutateAsync({
        userId: profile.id,
        submissionId: submission.id,
        certificateUrl: certUrl,
        certificateName: formData.name,
        certificateIssuer: formData.publisher,
        certificateYear: parseInt(formData.year) || new Date().getFullYear(),
      });

      if (uploadedFileName) {
        cleanupOldFiles(profile.id, uploadedFileName);
      }

      router.push('/vendor/verification/review');
    })();

    toast.promise(submitPromise, {
      loading: 'Menyimpan sertifikat...',
      success: 'Sertifikat berhasil disimpan',
      error: (err) => err instanceof Error ? err.message : 'Gagal menyimpan sertifikat',
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
        .list(`${userId}/certificate`);
      if (!files?.length) return;
      const toDelete = files
        .filter((f) => f.name !== keepFileName)
        .map((f) => `${userId}/certificate/${f.name}`);
      if (toDelete.length > 0) {
        await supabase.storage.from('verification').remove(toDelete);
        console.log('[Cert] cleaned up', toDelete.length, 'old file(s)');
      }
    } catch (err) {
      console.warn('[Cert] cleanup error (non-fatal):', err);
    }
  }

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
              <div
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full min-h-[8rem] border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50 overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview sertifikat" className="w-full object-contain max-h-40 rounded-2xl" />
                ) : submission.certificate_url ? (
                  <div className="flex flex-col items-center py-6 text-emerald-600">
                    <img
                      src={submission.certificate_url}
                      alt="Sertifikat terupload"
                      className="w-full object-contain max-h-32 rounded-xl opacity-60"
                    />
                    <p className="text-xs mt-2 text-stone-400">Tap untuk mengganti file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-stone-400">
                    <Upload size={28} className="mb-2" />
                    <p className="text-sm font-medium">Tap untuk upload sertifikat</p>
                    <p className="text-xs mt-1">Format JPG/PNG, maks 5MB</p>
                  </div>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
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
              disabled={saving || !hasCertData}
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
