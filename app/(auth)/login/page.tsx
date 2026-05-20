'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'success';
  const [showSuccess, setShowSuccess] = useState(registered);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    if (!email) return 'Email wajib diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid';
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Kata sandi wajib diisi';
    return undefined;
  };

  const handleBlurEmail = () => {
    setFieldErrors(prev => ({ ...prev, email: validateEmail(formData.email) }));
  };

  const handleBlurPassword = () => {
    setFieldErrors(prev => ({ ...prev, password: validatePassword(formData.password) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);
    setFieldErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setEmailError(formData.email);
        setError('Email belum dikonfirmasi. Silakan cek email Anda.');
      } else {
        setError(msg || 'Login gagal. Periksa email dan kata sandi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const isNative = typeof window !== 'undefined' &&
        !!(window as any).Capacitor?.isNativePlatform();

      if (isNative) {
        const { Browser } = await import('@capacitor/browser');
        const originalUrl = window.location.href;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'com.greenemerald.gema://callback',
          },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('Tidak ada URL OAuth');

        // Navigate WebView back to app and open CCT simultaneously
        const cctPromise = Browser.open({ url: data.url });
        window.location.href = originalUrl;
        await cctPromise;
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Login Google gagal. Coba lagi.');
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!emailError || resending) return;
    setResending(true);
    try {
      const isNative = typeof window !== 'undefined' &&
        !!(window as any).Capacitor?.isNativePlatform();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailError,
        options: {
          emailRedirectTo: isNative
            ? 'com.greenemerald.gema://callback'
            : window.location.origin,
        },
      });
      if (error) throw error;
      toast.success('Email konfirmasi telah dikirim ulang');
      setEmailError(null);
      setError(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim ulang email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-4 relative flex items-center justify-center shadow-lg shadow-emerald-900/20">
        <Link
          href="/onboarding"
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-xl font-bold text-white tracking-[0.15em]">GEMA</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-8 text-center">
          <Image
            src="/images/gema-logo.png"
            alt="GEMA Logo"
            width={56}
            height={56}
            className="w-14 h-14 mx-auto mb-4"
          />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Selamat Datang!</h1>
          <p className="text-gray-500">Masuk ke akun GEMA Anda untuk melanjutkan.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm space-y-2">
            <p>{error}</p>
            {emailError && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-800 hover:text-red-900 transition-colors cursor-pointer"
              >
                {resending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {resending ? 'Mengirim...' : 'Kirim Ulang Email Konfirmasi'}
              </button>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Akun berhasil dibuat! Silakan cek email untuk konfirmasi, lalu masuk.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="login-email">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <Input
                id="login-email"
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onBlur={handleBlurEmail}
                placeholder="nama@email.com"
                autoComplete="email"
                className={`pl-10 h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
                  fieldErrors.email ? 'border-red-400 focus:border-red-500' : ''
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700" htmlFor="login-password">Kata Sandi</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:underline">
                Lupa Sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <Input
                id="login-password"
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                onBlur={handleBlurPassword}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className={`pl-10 pr-12 h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/30 ${
                  fieldErrors.password ? 'border-red-400 focus:border-red-500' : ''
                }`}
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
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="pt-4">
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
                  Masuk
                </span>
              ) : (
                'Masuk'
              )}
            </Button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Atau masuk dengan</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-medium border-gray-200 shadow-sm flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
            Masuk dengan Google
          </Button>
        </form>

        <div className="mt-8 text-center pb-6">
          <span className="text-sm text-gray-500">Belum punya akun? </span>
          <Link href="/register/role" className="text-sm font-bold text-emerald-600 hover:underline">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
