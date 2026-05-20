'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

const SPECIALIZATIONS = [
  { value: 'Tukang Bangunan', label: 'Tukang Bangunan' },
  { value: 'Teknisi Listrik', label: 'Teknisi Listrik' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Cat & Interior', label: 'Cat & Interior' },
  { value: 'AC & Kulkas', label: 'AC & Kulkas' },
  { value: 'Elektronik', label: 'Elektronik' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Pest Control', label: 'Pest Control' },
];

export default function RegisterVendorPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setMode = useAuthStore((s) => s.setMode);
  const setVendorStatus = useAuthStore((s) => s.setVendorStatus);

  const [specialization, setSpecialization] = useState('');
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [showSpecializations, setShowSpecializations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'success'>('form');

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!specialization) errors.specialization = 'Pilih spesialisasi';
    if (!storeName.trim()) errors.storeName = 'Masukkan nama toko/mitra';
    if (!bio.trim()) errors.bio = 'Masukkan deskripsi singkat';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('vendor_profiles').insert({
        user_id: profile.id,
        specialization,
        bio: bio.trim(),
      });

      if (insertError) throw insertError;

      setVendorStatus(true);
      setStep('success');
      toast.success('Selamat datang sebagai Mitra GEMA!');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('duplicate')) {
        setError('Anda sudah terdaftar sebagai mitra');
      } else if (msg.includes('violates row-level security')) {
        setError('Terjadi kesalahan akses. Silakan login ulang.');
      } else {
        setError(msg || 'Gagal mendaftar sebagai mitra');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToVendorDashboard = () => {
    setMode('vendor');
    localStorage.setItem('gema_mode', 'vendor');
    router.push('/vendor/dashboard');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 text-center mb-2">
          Selamat Bergabung!
        </h1>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          Akun mitra Anda sudah aktif. Mulai kelola layanan dan terima pesanan sekarang.
        </p>
        <Button
          onClick={goToVendorDashboard}
          className="w-full max-w-xs h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
        >
          Buka Dashboard Mitra
        </Button>
        <button
          onClick={() => router.push('/customer/home')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          Nanti, kembali ke halaman utama
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-heading font-bold text-white">Daftar sebagai Mitra</h1>
            <p className="text-sm text-emerald-100">Bergabung dan mulai terima pesanan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-4">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Spesialisasi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Store size={18} className="text-emerald-500" />
              </div>
              <button
                type="button"
                onClick={() => setShowSpecializations(!showSpecializations)}
                className="w-full pl-10 pr-4 h-12 bg-transparent border border-gray-200 rounded-xl text-left text-sm text-gray-700 hover:border-emerald-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 cursor-pointer"
              >
                {specialization || <span className="text-gray-400">Pilih spesialisasi</span>}
              </button>
            </div>
            {fieldErrors.specialization && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={12} /> {fieldErrors.specialization}
              </p>
            )}
            {showSpecializations && (
              <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                {SPECIALIZATIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSpecialization(opt.value);
                      setShowSpecializations(false);
                      setFieldErrors((prev) => ({ ...prev, specialization: '' }));
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors cursor-pointer ${
                      specialization === opt.value ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nama Toko / Mitra</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Store size={18} className="text-gray-400" />
              </div>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onFocus={() => setFieldErrors((prev) => ({ ...prev, storeName: '' }))}
                placeholder="Contoh: Bangun Jaya"
                className="pl-10 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
              />
            </div>
            {fieldErrors.storeName && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={12} /> {fieldErrors.storeName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <FileText size={18} className="text-gray-400" />
              </div>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onFocus={() => setFieldErrors((prev) => ({ ...prev, bio: '' }))}
                placeholder="Ceritakan tentang layanan Anda..."
                rows={4}
                className="pl-10 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 resize-none"
              />
            </div>
            {fieldErrors.bio && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={12} /> {fieldErrors.bio}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Mendaftarkan...
              </span>
            ) : (
              'Daftar sebagai Mitra'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4 mb-8 px-4">
          Dengan mendaftar, Anda menyetujui Ketentuan Mitra GEMA
        </p>
      </div>
    </div>
  );
}
