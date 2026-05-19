'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, XCircle, Clock, ShieldCheck, IdCard, ScrollText, User, Mail, Phone, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton, SkeletonDetail } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth';
import { useVendorDetail, useApproveVerification, useRejectVerification, useRevokeVerification } from '@/lib/services/useAdmin';
import { toast } from 'sonner';

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const admin = useAuthStore((s) => s.profile);
  const { data: vendor, isLoading, error } = useVendorDetail(userId || undefined);
  const approveVerification = useApproveVerification();
  const rejectVerification = useRejectVerification();
  const revokeVerification = useRevokeVerification();
  const [actionModal, setActionModal] = useState<'reject' | 'revoke' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const submission = vendor?.verification_submissions?.[0] || null;

  const handleApprove = async () => {
    if (!submission || !admin?.id) return;
    const promise = approveVerification.mutateAsync({
      submissionId: submission.id,
      userId: submission.user_id,
      adminId: admin.id,
    });

    toast.promise(promise, {
      loading: 'Menyetujui verifikasi...',
      success: 'Vendor berhasil diverifikasi',
      error: (err) => err instanceof Error ? err.message : 'Gagal menyetujui verifikasi',
      duration: 5000,
    });

    try { await promise; } catch {}
  };

  const handleReject = async () => {
    if (!submission || !admin?.id || !actionReason.trim()) return;
    const promise = rejectVerification.mutateAsync({
      submissionId: submission.id,
      userId: submission.user_id,
      adminId: admin.id,
      reason: actionReason.trim(),
    });

    toast.promise(promise, {
      loading: 'Menolak verifikasi...',
      success: () => {
        setActionModal(null);
        setActionReason('');
        return 'Verifikasi ditolak';
      },
      error: (err) => err instanceof Error ? err.message : 'Gagal menolak verifikasi',
      duration: 5000,
    });

    try { await promise; } catch {}
  };

  const handleRevoke = async () => {
    if (!submission || !admin?.id || !actionReason.trim()) return;
    const promise = revokeVerification.mutateAsync({
      submissionId: submission.id,
      userId: submission.user_id,
      adminId: admin.id,
      reason: actionReason.trim(),
    });

    toast.promise(promise, {
      loading: 'Mencabut verifikasi...',
      success: () => {
        setActionModal(null);
        setActionReason('');
        return 'Verifikasi dicabut';
      },
      error: (err) => err instanceof Error ? err.message : 'Gagal mencabut verifikasi',
      duration: 5000,
    });

    try { await promise; } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48 bg-white/20" />
              <Skeleton className="h-3 w-32 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="px-4 -mt-4">
          <SkeletonDetail />
          <SkeletonDetail />
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-500">Vendor tidak ditemukan</p>
          <Link href="/admin/vendors">
            <Button variant="outline" className="mt-4">Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = () => {
    if (vendor.verification_status === 'revoked') {
      return { label: 'Dicabut', color: 'text-gray-600 bg-gray-100' };
    }
    if (vendor.is_verified) {
      return { label: 'Terverifikasi', color: 'text-emerald-600 bg-emerald-50' };
    }
    if (vendor.verification_status === 'rejected') {
      return { label: 'Ditolak', color: 'text-red-600 bg-red-50' };
    }
    if (submission?.status === 'pending' || vendor.verification_status === 'pending') {
      return { label: 'Menunggu Review', color: 'text-orange-600 bg-orange-50' };
    }
    return { label: 'Belum Verifikasi', color: 'text-gray-500 bg-gray-100' };
  };

  const badge = statusBadge();

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{vendor.users?.full_name || 'Detail Vendor'}</h1>
            <p className="text-emerald-100/80 text-sm">Review verifikasi vendor</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-emerald-600" />
            Informasi Vendor
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <span className="text-gray-600">{vendor.users?.email || '-'}</span>
            </div>
            {vendor.users?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span className="text-gray-600">{vendor.users.phone}</span>
              </div>
            )}
            {vendor.specialization && (
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <span className="text-gray-600">{vendor.specialization}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {submission && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <IdCard size={18} className="text-emerald-600" />
                Dokumen KTP
              </h2>
              <div className="space-y-3 text-sm">
                {submission.ktp_url && (
                  <div className="rounded-xl overflow-hidden bg-gray-100">
                    {!imgError['ktp'] ? (
                      <img
                        src={submission.ktp_url}
                        alt="Foto KTP"
                        onError={() => setImgError(p => ({ ...p, ktp: true }))}
                        className="w-full object-contain max-h-60"
                      />
                    ) : (
                      <div className="flex flex-col items-center py-6 text-gray-400">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="text-sm">Gagal memuat gambar</p>
                        <a
                          href={submission.ktp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline text-xs mt-2 flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Buka di tab baru
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">NIK</p>
                    <p className="text-gray-800 font-medium">{submission.nik}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Nama</p>
                    <p className="text-gray-800 font-medium">{submission.ktp_name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Diupload: {new Date(submission.submitted_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            {(submission.certificate_url || submission.certificate_name) && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ScrollText size={18} className="text-emerald-600" />
                  Sertifikat Profesi
                </h2>
                <div className="space-y-3 text-sm">
                  {submission.certificate_url && (
                    <div className="rounded-xl overflow-hidden bg-gray-100">
                      {submission.certificate_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                        !imgError['cert'] ? (
                          <img
                            src={submission.certificate_url}
                            alt="Sertifikat"
                            onError={() => setImgError(p => ({ ...p, cert: true }))}
                            className="w-full object-contain max-h-40"
                          />
                        ) : (
                          <div className="flex flex-col items-center py-4 text-gray-400">
                            <AlertCircle size={24} className="mb-1" />
                            <p className="text-xs mb-1">Gagal memuat gambar</p>
                            <a
                              href={submission.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              Buka file
                            </a>
                          </div>
                        )
                      ) : (
                        <a
                          href={submission.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 text-emerald-600 hover:bg-emerald-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors truncate">
                              {submission.certificate_name || 'Dokumen Sertifikat'}
                            </p>
                            <p className="text-xs text-gray-400">PDF — Tap untuk membuka</p>
                          </div>
                          <ExternalLink size={16} className="text-gray-300 group-hover:text-emerald-500 shrink-0" />
                        </a>
                      )}
                    </div>
                  )}
                  {submission.certificate_name && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Nama Sertifikat</p>
                      <p className="text-gray-800 font-medium">{submission.certificate_name}</p>
                    </div>
                  )}
                  {submission.certificate_issuer && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Penerbit</p>
                      <p className="text-gray-800 font-medium">{submission.certificate_issuer}</p>
                    </div>
                  )}
                  {submission.certificate_year && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Tahun</p>
                      <p className="text-gray-800 font-medium">{submission.certificate_year}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(vendor.verification_status === 'rejected' || vendor.verification_status === 'revoked') && vendor.rejection_reason && (
              <div className={vendor.verification_status === 'rejected' ? 'bg-red-50 border border-red-200 rounded-2xl p-5 space-y-2' : 'bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2'}>
                <h3 className={`font-bold flex items-center gap-2 text-sm ${vendor.verification_status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                  <XCircle size={16} />
                  {vendor.verification_status === 'rejected' ? 'Alasan Penolakan' : 'Alasan Pencabutan'}
                </h3>
                <p className={`text-sm ${vendor.verification_status === 'rejected' ? 'text-red-600' : 'text-gray-600'}`}>{vendor.rejection_reason}</p>
              </div>
            )}

            {submission.status === 'pending' && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Aksi Verifikasi
                </h2>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                    disabled={approveVerification.isPending}
                  >
                    {approveVerification.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Setujui
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setActionModal('reject')}
                    disabled={rejectVerification.isPending}
                  >
                    <XCircle size={18} />
                    Tolak
                  </Button>
                </div>
              </div>
            )}

            {submission.status === 'approved' && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Aksi Verifikasi
                </h2>
                <Button
                  variant="outline"
                  className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setActionModal('revoke')}
                  disabled={revokeVerification.isPending}
                >
                  {revokeVerification.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Cabut Verifikasi
                </Button>
              </div>
            )}

            {(submission.status === 'rejected' || submission.status === 'revoked') && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Aksi Verifikasi
                </h2>
                <Button
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApprove}
                  disabled={approveVerification.isPending}
                >
                  {approveVerification.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Setujui Verifikasi
                </Button>
              </div>
            )}
          </>
        )}

        {!submission && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Belum ada pengajuan verifikasi</p>
            <p className="text-xs text-gray-400 mt-1">Vendor ini belum mengupload dokumen KYC</p>
          </div>
        )}
      </div>

      {actionModal === 'reject' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Tolak Verifikasi</h3>
            <p className="text-sm text-gray-500">Berikan alasan penolakan kepada vendor</p>
            <Textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setActionModal(null); setActionReason(''); }}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={!actionReason.trim() || rejectVerification.isPending}
              >
                {rejectVerification.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Tolak'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {actionModal === 'revoke' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Cabut Verifikasi</h3>
            <p className="text-sm text-gray-500">Vendor ini telah terverifikasi. Berikan alasan pencabutan.</p>
            <Textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Alasan pencabutan..."
              className="min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setActionModal(null); setActionReason(''); }}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleRevoke}
                disabled={!actionReason.trim() || revokeVerification.isPending}
              >
                {revokeVerification.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Cabut'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVendorDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48 bg-white/20" />
              <Skeleton className="h-3 w-32 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="px-4 -mt-4">
          <SkeletonDetail />
          <SkeletonDetail />
        </div>
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}
