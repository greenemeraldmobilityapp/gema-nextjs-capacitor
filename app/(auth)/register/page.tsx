'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, User as UserIcon } from 'lucide-react';
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

      // Jika tidak ada session (email confirmation mungkin masih ON), redirect ke login
      if (!authData.session) {
        router.push('/login?registered=success');
        return;
      }

      // Insert langsung ke public.users (RLS policy mengizinkan auth.uid() = id)
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email,
        role: role as 'customer' | 'vendor',
      });

      if (insertError) {
        // Jika error duplicate, berarti trigger sudah berhasil insert — tidak masalah
        if (!insertError.message?.includes('duplicate')) {
          throw new Error(`Gagal menyimpan profil: ${insertError.message}`);
        }
      }

      // Redirect berdasarkan role
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="p-4 pt-8 sticky top-0 z-10 bg-gray-50">
        <Link href="/register/role" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="mb-8">
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
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-gray-400" />
              </div>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                className="pl-10 h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="nama@email.com"
                className="pl-10 h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimal 8 karakter"
                className="pl-10 h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              variant="pill"
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
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