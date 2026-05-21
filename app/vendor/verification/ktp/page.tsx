'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Camera, Loader2, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CameraCapture from '@/components/shared/CameraCapture';
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

type Step = 'ktp' | 'selfie' | 'selfie_ktp' | 'form';

export default function KtpVerificationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const submitKtp = useSubmitKtp();

  const [step, setStep] = useState<Step>('ktp');
  const [formData, setFormData] = useState({ nik: '', name: '' });

  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [selfieKtpFile, setSelfieKtpFile] = useState<File | null>(null);
  const [selfieKtpPreview, setSelfieKtpPreview] = useState<string | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('environment');

  type PendingCapture = {
    setFile: (f: File | null) => void;
    setPreview: (p: string | null) => void;
    nextStep: Step;
  };
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);

  const openCamera = (
    mode: 'user' | 'environment',
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
    nextStep: Step,
  ) => {
    setCameraMode(mode);
    setPendingCapture({ setFile, setPreview, nextStep });
    setShowCamera(true);
  };

  const handleCameraCapture = (file: File) => {
    if (!pendingCapture) return;
    pendingCapture.setFile(file);
    pendingCapture.setPreview(URL.createObjectURL(file));
    setStep(pendingCapture.nextStep);
    setShowCamera(false);
    setPendingCapture(null);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    setPendingCapture(null);
  };

  const stepTitle = {
    ktp: 'Foto KTP',
    selfie: 'Foto Selfie',
    selfie_ktp: 'Selfie + Pegang KTP',
    form: 'Data Diri',
  };

  async function cleanupFolder(userId: string, folder: string, keepFileName: string) {
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
      // non-fatal
    }
  }

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.warning('Silakan login terlebih dahulu');
      return;
    }
    if (!ktpFile || !selfieFile || !selfieKtpFile || !formData.nik || !formData.name) {
      toast.warning('Lengkapi semua data terlebih dahulu');
      return;
    }

    setSaving(true);

    try {
      const userId = profile.id;

      const ktpData = await fileToBuffer(ktpFile);
      const safeKtpName = ktpData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ktpPath = `${userId}/ktp/${Date.now()}_${safeKtpName}`;
      const { error: ktpUploadError } = await supabase.storage
        .from('verification')
        .upload(ktpPath, ktpData.buffer, { contentType: ktpData.contentType });
      if (ktpUploadError) throw new Error(ktpUploadError.message || 'Gagal upload foto KTP');
      const { data: ktpUrlData } = supabase.storage.from('verification').getPublicUrl(ktpPath);
      const ktpUrl = ktpUrlData?.publicUrl || '';
      if (!ktpUrl) throw new Error('Gagal mendapatkan URL file KTP');

      const selfieData = await fileToBuffer(selfieFile);
      const safeSelfieName = selfieData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const selfiePath = `${userId}/selfie/${Date.now()}_${safeSelfieName}`;
      const { error: selfieUploadError } = await supabase.storage
        .from('verification')
        .upload(selfiePath, selfieData.buffer, { contentType: selfieData.contentType });
      if (selfieUploadError) throw new Error(selfieUploadError.message || 'Gagal upload foto selfie');
      const { data: selfieUrlData } = supabase.storage.from('verification').getPublicUrl(selfiePath);
      const selfieUrl = selfieUrlData?.publicUrl || '';
      if (!selfieUrl) throw new Error('Gagal mendapatkan URL file selfie');

      const selfieKtpData = await fileToBuffer(selfieKtpFile);
      const safeSelfieKtpName = selfieKtpData.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const selfieKtpPath = `${userId}/selfie_ktp/${Date.now()}_${safeSelfieKtpName}`;
      const { error: selfieKtpUploadError } = await supabase.storage
        .from('verification')
        .upload(selfieKtpPath, selfieKtpData.buffer, { contentType: selfieKtpData.contentType });
      if (selfieKtpUploadError) throw new Error(selfieKtpUploadError.message || 'Gagal upload foto selfie+KTP');
      const { data: selfieKtpUrlData } = supabase.storage.from('verification').getPublicUrl(selfieKtpPath);
      const selfieKtpUrl = selfieKtpUrlData?.publicUrl || '';
      if (!selfieKtpUrl) throw new Error('Gagal mendapatkan URL file selfie+KTP');

      await cleanupFolder(userId, 'ktp', ktpPath.split('/').pop()!);
      await cleanupFolder(userId, 'selfie', selfiePath.split('/').pop()!);
      await cleanupFolder(userId, 'selfie_ktp', selfieKtpPath.split('/').pop()!);

      await submitKtp.mutateAsync({
        userId: profile.id,
        nik: formData.nik,
        ktpName: formData.name,
        ktpUrl: ktpUrl,
        selfieUrl: selfieKtpUrl,
        selfieFaceUrl: selfieUrl,
      });

      toast.success('Dokumen berhasil disimpan');

      router.push('/vendor/verification/certification');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal upload dokumen');
    } finally {
      setSaving(false);
    }
  };

  const renderUploadZone = (
    preview: string | null,
    label: string,
    hint: string,
    icon: typeof Camera | typeof Upload,
    mode: 'user' | 'environment',
    nextStep: Step,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void,
  ) => {
    const Icon = icon;
    return (
      <div
        onClick={() => openCamera(mode, setFile, setPreview, nextStep)}
        className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50 overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-stone-400">
            <Icon size={32} className="mb-2" />
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs mt-1">{hint}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/verification" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading text-lg font-bold text-stone-800">{stepTitle[step]}</h1>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4 px-1">
          {(['ktp', 'selfie', 'selfie_ktp', 'form'] as Step[]).map((s, i) => {
            const idx = ['ktp', 'selfie', 'selfie_ktp', 'form'].indexOf(step);
            return (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= idx ? 'bg-emerald-500' : 'bg-stone-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-5">
          {step === 'ktp' && renderUploadZone(
            ktpPreview, 'Ambil foto KTP', 'Pastikan KTP jelas & terbaca', Upload, 'environment',
            'selfie', setKtpFile, setKtpPreview,
          )}

          {step === 'selfie' && renderUploadZone(
            selfiePreview, 'Ambil foto selfie', 'Foto wajah Anda saja', Camera, 'user',
            'selfie_ktp', setSelfieFile, setSelfiePreview,
          )}

          {step === 'selfie_ktp' && renderUploadZone(
            selfieKtpPreview, 'Selfie + Pegang KTP', 'Pastikan KTP terlihat jelas di foto', Camera, 'user',
            'form', setSelfieKtpFile, setSelfieKtpPreview,
          )}

          {step === 'form' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { img: ktpPreview, label: 'KTP' },
                  { img: selfiePreview, label: 'Selfie' },
                  { img: selfieKtpPreview, label: 'Selfie+KTP' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      {item.img ? (
                        <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-stone-300">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Check size={12} className="text-emerald-500" />
                      <p className="text-[10px] font-medium text-stone-500">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-stone-100" />

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
            </>
          )}
        </div>

        {step !== 'form' ? (
          <Button
            type="button"
            variant="premium"
            size="lg"
            className="w-full"
            onClick={() => {
              if (step === 'ktp' && ktpPreview) setStep('selfie');
              else if (step === 'selfie' && selfiePreview) setStep('selfie_ktp');
              else if (step === 'selfie_ktp' && selfieKtpPreview) setStep('form');
            }}
          >
            Lanjutkan
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={saving || !formData.nik || !formData.name}
            variant="premium"
            size="lg"
            className="w-full disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span>
            ) : (
              'Simpan & Lanjutkan'
            )}
          </Button>
        )}
      </form>
      {showCamera && (
        <CameraCapture
          facingMode={cameraMode}
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
        />
      )}
    </div>
  );
}
