'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';

const statusViews: Record<string, { icon: typeof Clock; bg: string; border: string; iconColor: string; title: string; desc: string[]; cta: { label: string; href: string } }> = {
  pending: {
    icon: Clock, bg: 'bg-amber-50/80', border: 'border border-amber-200/50', iconColor: 'text-amber-600',
    title: 'Dokumen Sedang Direview',
    desc: ['Tim GEMA akan memeriksa dokumen Anda dalam 1-3 hari kerja.', 'Kami akan memberi tahu Anda melalui notifikasi setelah verifikasi selesai.'],
    cta: { label: 'Kembali ke Dashboard', href: '/vendor/dashboard' },
  },
  success: {
    icon: ShieldCheck, bg: 'bg-emerald-50/80', border: 'border border-emerald-200/50', iconColor: 'text-emerald-600',
    title: 'Verifikasi Berhasil!',
    desc: ['Akun Anda telah terverifikasi. Sekarang Anda bisa menerima pesanan dengan lebih banyak kepercayaan.'],
    cta: { label: 'Mulai Terima Pesanan', href: '/vendor/dashboard' },
  },
  rejected: {
    icon: XCircle, bg: 'bg-red-50/80', border: 'border border-red-200/50', iconColor: 'text-red-600',
    title: 'Verifikasi Ditolak',
    desc: ['Dokumen Anda tidak memenuhi persyaratan. Silakan upload ulang dokumen yang valid.'],
    cta: { label: 'Upload Ulang', href: '/vendor/verification/ktp' },
  },
};

export default function VerificationReviewPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: vendor, isLoading } = useVendor(profile?.id);
  const [loadState, setLoadState] = useState(true);

  const actualStatus = vendor?.is_verified === true ? 'success' : 'pending';
  const [status, setStatus] = useState<'pending' | 'success' | 'rejected'>(actualStatus);

  useEffect(() => {
    if (!isLoading) {
      setStatus(actualStatus);
      setLoadState(false);
    }
  }, [isLoading, actualStatus]);

  const view = statusViews[status];
  const Icon = view.icon;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100">
        <h1 className="font-heading text-xl font-bold text-stone-800">Review Verifikasi</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className={`w-28 h-28 ${view.bg} ${view.border} rounded-full shadow-lg flex items-center justify-center mb-6`}>
          <Icon size={56} className={view.iconColor} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-stone-800 mb-2">{view.title}</h2>
        {view.desc.map((d, i) => (
          <p key={i} className={`text-sm text-stone-500 max-w-xs ${i > 0 ? 'mt-1' : 'mb-2'}`}>{d}</p>
        ))}

        <div className="mt-8 w-full max-w-xs">
          <Link href={view.cta.href}>
            <Button variant="premium" size="lg" className="w-full">
              {view.cta.label}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
