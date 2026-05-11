'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa email dan kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/login' : undefined,
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Login Google gagal. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="p-4 pt-8 sticky top-0 z-10 bg-gray-50">
        <Link href="/onboarding" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="flex-1 p-6 flex flex-col pt-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Selamat Datang!</h1>
          <p className="text-gray-500">Masuk ke akun GEMA Anda untuk melanjutkan.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
              <Link href="#" className="text-xs font-semibold text-emerald-600 hover:underline">
                Lupa Sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan kata sandi"
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
              {isLoading ? 'Memproses...' : 'Masuk'}
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
