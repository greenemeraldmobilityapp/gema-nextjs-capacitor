'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const isNative = typeof window !== 'undefined' &&
        !!(window as any).Capacitor?.isNativePlatform();

      const redirectTo = isNative
        ? 'com.greenemerald.gema://callback'
        : `${window.location.origin}/update-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );
      if (resetError) throw new Error(resetError.message);
      setSent(true);
      toast.success('Tautan reset sandi telah dikirim');
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengirim email reset. Coba lagi.';
      if (msg.toLowerCase().includes('email not found')) {
        setError('Email tidak terdaftar');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50/20 to-emerald-100/20 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center mb-8">
          <Link href="/login" className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading text-xl font-bold text-emerald-600 ml-4">Atur Ulang Sandi</h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <Mail size={32} className="text-emerald-500" />
            </div>
            <p className="text-gray-700">Tautan reset sandi telah dikirim ke <strong>{email}</strong></p>
            <p className="text-sm text-gray-500">Cek kotak masuk email Anda. Jika tidak ada, periksa folder spam.</p>
            <Link href="/login" className="block text-sm font-semibold text-emerald-600 hover:underline mt-4">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-500">Masukkan email Anda. Kami akan mengirim tautan untuk mengatur ulang sandi.</p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="fp-email">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <Input
                  id="fp-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="pill"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20 hover:brightness-105 active:brightness-95 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Tautan Reset'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
