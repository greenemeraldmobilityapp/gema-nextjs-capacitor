'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ShieldCheck, XCircle, AlertCircle, Loader2, Ban, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useLatestSubmission } from '@/lib/services/useVerification';
import { toast } from 'sonner';

const statusViews: Record<string, { icon: typeof Clock; bg: string; border: string; iconColor: string; title: string; desc: string[]; cta: { label: string; href: string } }> = {
  pending: {
    icon: Clock, bg: 'bg-amber-50/80', border: 'border border-amber-200/50', iconColor: 'text-amber-600',
    title: 'Dokumen Sedang Ditinjau',
    desc: ['Tim GEMA akan memeriksa dokumen Anda dalam 1-3 hari kerja.', 'Kami akan memberi tahu Anda melalui notifikasi setelah verifikasi selesai.'],
    cta: { label: 'Kembali ke Dashboard', href: '/vendor/dashboard' },
  },
  approved: {
    icon: ShieldCheck, bg: 'bg-emerald-50/80', border: 'border border-emerald-200/50', iconColor: 'text-emerald-600',
    title: 'Verifikasi Berhasil!',
    desc: ['Akun Anda telah terverifikasi. Sekarang Anda bisa menerima pesanan dengan lebih banyak kepercayaan.'],
    cta: { label: 'Mulai Terima Pesanan', href: '/vendor/dashboard' },
  },
  rejected: {
    icon: XCircle, bg: 'bg-red-50/80', border: 'border border-red-200/50', iconColor: 'text-red-600',
    title: 'Verifikasi Ditolak',
    desc: ['Dokumen Anda tidak memenuhi persyaratan. Silakan upload ulang dokumen yang valid.'],
    cta: { label: 'Ajukan Ulang', href: '/vendor/verification/ktp' },
  },
  revoked: {
    icon: Ban, bg: 'bg-gray-50/80', border: 'border border-gray-200/50', iconColor: 'text-gray-600',
    title: 'Verifikasi Dicabut',
    desc: ['Verifikasi Anda telah dicabut oleh admin. Silakan hubungi tim GEMA atau ajukan verifikasi ulang.'],
    cta: { label: 'Ajukan Ulang', href: '/vendor/verification/ktp' },
  },
};

export default function VerificationReviewPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: submission, isLoading, error } = useLatestSubmission(profile?.id);

  useEffect(() => {
    if (error) toast.error(error instanceof Error ? error.message : 'Gagal memuat data verifikasi');
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Gagal memuat data verifikasi</p>
      </div>
    );
  }

  const status = submission?.status === 'approved' ? 'approved'
    : submission?.status === 'rejected' ? 'rejected'
    : submission?.status === 'revoked' ? 'revoked'
    : 'pending';

  const view = statusViews[status];
  const Icon = view.icon;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100">
        <h1 className="font-heading text-xl font-bold text-stone-800">Status Verifikasi</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className={`w-28 h-28 ${view.bg} ${view.border} rounded-full shadow-lg flex items-center justify-center mb-6`}>
          <Icon size={56} className={view.iconColor} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-stone-800 mb-2">{view.title}</h2>
        {view.desc.map((d, i) => (
          <p key={i} className={`text-sm text-stone-500 max-w-xs ${i > 0 ? 'mt-1' : 'mb-2'}`}>{d}</p>
        ))}

        <div className="mt-6 w-full max-w-xs space-y-3">
          {submission?.ktp_url && (
            <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-stone-500" />
                <p className="text-xs font-semibold text-stone-600">Foto KTP</p>
              </div>
              <div className="rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={submission.ktp_url}
                  alt="Foto KTP"
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized
                  className="w-full object-contain max-h-48 h-auto"
                />
              </div>
            </div>
          )}

          {submission?.selfie_face_url && (
            <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-stone-500" />
                <p className="text-xs font-semibold text-stone-600">Selfie Wajah</p>
              </div>
              <div className="rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={submission.selfie_face_url}
                  alt="Selfie wajah"
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized
                  className="w-full object-contain max-h-48 h-auto"
                />
              </div>
            </div>
          )}

          {submission?.selfie_url && (
            <div className="bg-white/80 border border-stone-200 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-stone-500" />
                <p className="text-xs font-semibold text-stone-600">Selfie + Pegang KTP</p>
              </div>
              <div className="rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={submission.selfie_url}
                  alt="Selfie verifikasi"
                  width={0}
                  height={0}
                  sizes="100vw"
                  unoptimized
                  className="w-full object-contain max-h-48 h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {(status === 'rejected' || status === 'revoked') && submission?.rejection_reason && (
          <div className={`mt-4 w-full max-w-xs border rounded-2xl p-4 text-left ${status === 'rejected' ? 'bg-red-50/80 border-red-200/50' : 'bg-gray-50/80 border-gray-200/50'}`}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className={`shrink-0 mt-0.5 ${status === 'rejected' ? 'text-red-500' : 'text-gray-500'}`} />
              <div>
                <p className={`text-xs font-bold mb-1 ${status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                  {status === 'rejected' ? 'Alasan Penolakan:' : 'Alasan Pencabutan:'}
                </p>
                <p className={`text-sm ${status === 'rejected' ? 'text-red-600' : 'text-gray-600'}`}>{submission.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

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
