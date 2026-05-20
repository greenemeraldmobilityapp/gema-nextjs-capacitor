'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Mail, Lock, ArrowLeft, LogIn, User as UserIcon,
  Eye, EyeOff, Loader2, AlertCircle, AlertTriangle, X, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

const supabase = createClient();

function getPasswordStrength(password: string): {
  label: string; color: string; width: string
} {
  if (!password) return { label: '', color: '', width: 'w-0' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Lemah', color: 'bg-red-500', width: 'w-1/6' };
  if (score <= 2) return { label: 'Cukup', color: 'bg-orange-500', width: 'w-2/6' };
  if (score <= 4) return { label: 'Kuat', color: 'bg-emerald-500', width: 'w-4/6' };
  return { label: 'Sangat Kuat', color: 'bg-emerald-600', width: 'w-full' };
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Memuat...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'customer';
  const router = useRouter();
  const setVendorStatus = useAuthStore((s) => s.setVendorStatus);
  const setMode = useAuthStore((s) => s.setMode);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Nama lengkap wajib diisi';
        if (value.trim().length < 2) return 'Nama lengkap minimal 2 karakter';
        return '';
      case 'email':
        if (!value.trim()) return 'Email wajib diisi';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Format email tidak valid';
        return '';
      case 'password':
        if (!value) return 'Kata sandi wajib diisi';
        if (value.length < 8) return 'Kata sandi minimal 8 karakter';
        return '';
      case 'confirmPassword':
        if (!value) return 'Konfirmasi kata sandi wajib diisi';
        if (value !== formData.password) return 'Kata sandi tidak cocok';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    const value = formData[field as keyof typeof formData];
    const err = validateField(field, value);
    setFieldErrors((prev) => {
      if (err) return { ...prev, [field]: err };
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('Anda harus menyetujui Syarat & Ketentuan');
      return;
    }

    const errors: Record<string, string> = {};
    for (const field of ['fullName', 'email', 'password', 'confirmPassword'] as const) {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const isNative = typeof window !== 'undefined' &&
        !!(window as any).Capacitor?.isNativePlatform();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
          emailRedirectTo: isNative
            ? 'com.greenemerald.gema://callback'
            : window.location.origin,
        },
      });

      if (authError) {
        if (authError.message?.includes('already registered')) {
          throw new Error('Email ini sudah terdaftar. Silakan login.');
        }
        throw new Error(`Gagal mendaftar: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Tidak ada data user dari server.');
      }

      if (!authData.session) {
        localStorage.setItem('gema_has_onboarded', 'true');
        router.push('/login?registered=success');
        return;
      }

      localStorage.setItem('gema_has_onboarded', 'true');

      if (role === 'vendor') {
        const { error: vendorError } = await supabase.from('vendor_profiles').insert({
          user_id: authData.user.id,
          specialization: '',
          bio: '',
        });
        if (vendorError && !vendorError.message?.includes('duplicate')) {
          if (process.env.NODE_ENV !== 'production') console.error('Gagal buat vendor profile:', vendorError);
        }
        setVendorStatus(true);
        setMode('vendor');
        localStorage.setItem('gema_mode', 'vendor');
        router.push('/vendor/profile/edit?from=register');
      } else {
        router.push('/customer/home');
      }
    } catch (error: any) {
      const msg = error?.message || 'Pendaftaran gagal. Coba lagi.';
      const code = error?.code || '';
      const status = error?.status || '';
      setError(msg);
      setErrorDetail(code ? `Kode: ${code}${status ? ` (${status})` : ''}` : null);
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass = (field: string) =>
    `transition-colors duration-200 ${focusedField === field ? 'text-emerald-500' : 'text-gray-400'}`;

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 pb-safe overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-50 rounded-full opacity-60 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-center">
        <Link
          href="/register/role"
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-lg font-bold text-emerald-700 tracking-[0.15em]">GEMA</h1>
      </header>

      <div className="relative flex-1 p-6 flex flex-col z-10">
        <div className="mb-8 text-center">
          <Image
            src="/images/gema-logo.png"
            alt="GEMA Logo"
            width={56}
            height={56}
            className="w-14 h-14 mx-auto mb-4"
          />
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">
            Buat Akun{' '}
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold ml-1 align-middle">
              {role === 'vendor' ? 'Mitra' : 'Pelanggan'}
            </span>
          </h1>
          <p className="text-gray-500">Gabung {role === 'vendor' ? 'sebagai Mitra GEMA' : 'di GEMA'} dan nikmati kemudahan layanan.</p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{error}</p>
              {errorDetail && (
                <p className="text-xs mt-0.5 opacity-70 font-mono">{errorDetail}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setError(null); setErrorDetail(null); }}
              className="shrink-0 p-0.5 rounded hover:bg-red-100 transition-colors"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isLoading}
          className="space-y-5 flex-1"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-5 shadow-sm">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className={iconClass('fullName')} />
                </div>
                <Input
                  id="fullName"
                  required
                  disabled={isLoading}
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  onFocus={() => handleFocus('fullName')}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Masukkan nama lengkap"
                  className="pl-10 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                  aria-invalid={!!fieldErrors.fullName || undefined}
                />
              </div>
              {fieldErrors.fullName && (
                <p id="fullName-error" className="flex items-center gap-1 text-xs text-red-500 mt-1" role="alert">
                  <AlertCircle size={12} /> {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={18} className={iconClass('email')} />
                </div>
                <Input
                  id="email"
                  required
                  disabled={isLoading}
                  type="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="pl-10 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={!!fieldErrors.email || undefined}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="flex items-center gap-1 text-xs text-red-500 mt-1" role="alert">
                  <AlertCircle size={12} /> {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={18} className={iconClass('password')} />
                </div>
                <Input
                  id="password"
                  required
                  disabled={isLoading}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  className="pl-10 pr-12 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={!!fieldErrors.password || undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === 'Lemah' ? 'text-red-500'
                    : strength.label === 'Cukup' ? 'text-orange-500'
                    : 'text-emerald-600'
                  }`}>
                    Kekuatan: {strength.label}
                  </p>
                </div>
              )}
              {fieldErrors.password && (
                <p id="password-error" className="flex items-center gap-1 text-xs text-red-500 mt-1" role="alert">
                  <AlertCircle size={12} /> {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={18} className={iconClass('confirmPassword')} />
                </div>
                <Input
                  id="confirmPassword"
                  required
                  disabled={isLoading}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Ulangi kata sandi"
                  autoComplete="new-password"
                  className="pl-10 pr-12 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                  aria-invalid={!!fieldErrors.confirmPassword || undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p id="confirmPassword-error" className="flex items-center gap-1 text-xs text-red-500 mt-1" role="alert">
                  <AlertCircle size={12} /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="relative flex items-center h-6">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
                className="peer sr-only"
              />
              <label
                htmlFor="agreeTerms"
                className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white cursor-pointer peer-checked:border-emerald-600 peer-checked:bg-emerald-600 flex items-center justify-center transition-all hover:border-emerald-400"
              >
                {agreeTerms && <Check size={14} className="text-white" strokeWidth={3} />}
              </label>
            </div>
            <label htmlFor="agreeTerms" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
              Dengan mendaftar, Anda menyetujui{' '}
              <Link href="/terms" className="font-semibold text-emerald-600 hover:underline">Syarat &amp; Ketentuan</Link>
              {' '}dan{' '}
              <Link href="/privacy" className="font-semibold text-emerald-600 hover:underline">Kebijakan Privasi</Link>
              {' '}kami.
            </label>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              variant="pill"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20 hover:brightness-105 active:brightness-95 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Mendaftarkan...
                </span>
              ) : (
                `Buat Akun ${role === 'vendor' ? 'Mitra' : 'Pelanggan'}`
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center pb-6">
          <span className="text-sm text-gray-500">Sudah memiliki akun? </span>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:underline">
            Masuk <LogIn size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
