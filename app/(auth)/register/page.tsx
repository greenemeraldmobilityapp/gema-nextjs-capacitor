'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'customer';
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
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
        router.push('/login?registered=success');
        return;
      }

      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email,
        role: role as 'customer' | 'vendor',
      });

      if (insertError) {
        if (!insertError.message?.includes('duplicate')) {
          throw new Error(`Gagal menyimpan profil: ${insertError.message}`);
        }
      }

      if (role === 'vendor') {
        router.push('/vendor/dashboard');
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-4 relative flex items-center justify-center shadow-lg shadow-emerald-900/20">
        <Link
          href="/register/role"
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-xl font-bold text-white tracking-[0.15em]">GEMA</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-8 text-center">
          <img
            src="/images/gema-logo.png"
            alt="GEMA Logo"
            className="w-14 h-14 mx-auto mb-4"
          />
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Buat Akun {role === 'vendor' ? 'Mitra' : 'Pelanggan'}</h1>
          <p className="text-gray-500">Lengkapi data Anda untuk mendaftar di GEMA.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            <p>{error}</p>
            {errorDetail && (
              <p className="text-xs mt-1 opacity-70 font-mono">{errorDetail}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className={iconClass('fullName')} />
                </div>
                <Input
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan nama lengkap"
                  className="pl-10 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={18} className={iconClass('email')} />
                </div>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="pl-10 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={18} className={iconClass('password')} />
                </div>
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  className="pl-10 pr-12 h-12 bg-transparent border-transparent focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
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
            </div>
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
                  Mendaftarkan...
                </span>
              ) : (
                'Daftar Sekarang'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center pb-6">
          <span className="text-sm text-gray-500">Sudah punya akun? </span>
          <Link href="/login" className="text-sm font-bold text-emerald-600 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
