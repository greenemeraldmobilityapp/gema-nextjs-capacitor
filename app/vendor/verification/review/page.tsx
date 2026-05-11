'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusViews: Record<string, { icon: typeof Clock; bg: string; iconColor: string; title: string; desc: string[]; cta: { label: string; href: string } }> = {
  pending: {
    icon: Clock, bg: 'bg-amber-100', iconColor: 'text-amber-600',
    title: 'Dokumen Sedang Direview',
    desc: ['Tim GEMA akan memeriksa dokumen Anda dalam 1-3 hari kerja.', 'Kami akan memberi tahu Anda melalui notifikasi setelah verifikasi selesai.'],
    cta: { label: 'Kembali ke Dashboard', href: '/vendor/dashboard' },
  },
  success: {
    icon: ShieldCheck, bg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    title: 'Verifikasi Berhasil!',
    desc: ['Akun Anda telah terverifikasi. Sekarang Anda bisa menerima pesanan dengan lebih banyak kepercayaan.'],
    cta: { label: 'Mulai Terima Pesanan', href: '/vendor/dashboard' },
  },
  rejected: {
    icon: XCircle, bg: 'bg-red-100', iconColor: 'text-red-600',
    title: 'Verifikasi Ditolak',
    desc: ['Dokumen Anda tidak memenuhi persyaratan. Silakan upload ulang dokumen yang valid.'],
    cta: { label: 'Upload Ulang', href: '/vendor/verification/ktp' },
  },
};

export default function VerificationReviewPage() {
  const [status] = useState<'pending' | 'success' | 'rejected'>('pending');
  const view = statusViews[status];
  const Icon = view.icon;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Review Verifikasi</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className={`w-24 h-24 ${view.bg} rounded-full flex items-center justify-center mb-6`}>
          <Icon size={48} className={view.iconColor} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">{view.title}</h2>
        {view.desc.map((d, i) => (
          <p key={i} className={`text-sm text-gray-500 max-w-xs ${i > 0 ? 'mt-1' : 'mb-2'}`}>{d}</p>
        ))}

        <div className="mt-8 w-full max-w-xs">
          <Link href={view.cta.href}>
            <Button variant="pill" size="lg" className="w-full shadow-sm">
              {view.cta.label}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
