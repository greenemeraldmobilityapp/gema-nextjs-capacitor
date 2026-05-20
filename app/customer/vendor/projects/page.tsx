'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Briefcase, Loader2, AlertCircle, MessageSquare, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendor, useVendorCompletedProjects } from '@/lib/services/useVendors';

function formatPrice(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function VendorCompletedProjectsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <VendorCompletedProjectsContent />
    </Suspense>
  );
}

function VendorCompletedProjectsContent() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendor_id') || '';

  const { data: vendor, isLoading: vendorLoading } = useVendor(vendorId);
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useVendorCompletedProjects(vendorId, 9999);

  const avgRating = useMemo(() => {
    if (!projects || projects.length === 0) return 0;
    const ratings = projects
      .filter((p) => p.reviews && p.reviews.length > 0)
      .map((p) => p.reviews[0].rating);
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }, [projects]);

  const isLoading = vendorLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700" />
            <div className="h-6 w-40 bg-emerald-500 rounded" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-3xl" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[16px]" />
          ))}
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={`/customer/vendor?id=${vendorId}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-heading font-bold text-lg">Proyek Selesai</span>
          </div>
        </div>
        <div className="flex flex-col items-center py-16 text-red-400">
          <AlertCircle size={48} className="mb-3 opacity-50" />
          <p className="font-medium">Gagal memuat proyek</p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={`/customer/vendor?id=${vendorId}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-heading font-bold text-lg">Proyek Selesai</span>
          </div>
        </div>
        <div className="flex flex-col items-center py-16 text-gray-400">
          <Briefcase size={48} className="mb-3 opacity-50" />
          <p className="font-medium">Belum ada proyek selesai</p>
          <p className="text-sm mt-1">Belum ada proyek yang terselesaikan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/customer/vendor?id=${vendorId}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-heading font-bold text-lg">Proyek Selesai</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {vendor && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              {vendor.avatar_url ? (
                <Image src={vendor.avatar_url} alt="" width={56} height={56} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                  {vendor.users?.full_name?.charAt(0) || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-heading font-bold text-gray-900 truncate">{vendor.users?.full_name || 'Mitra'}</p>
                  {vendor.is_verified && <BadgeCheck size={16} className="text-blue-500 shrink-0" />}
                </div>
                {vendor.specialization && (
                  <p className="text-xs text-gray-500 mt-0.5">{vendor.specialization}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-emerald-500" />
                <span className="text-sm font-semibold text-gray-900">{projects.length}</span>
                <span className="text-xs text-gray-500">Proyek</span>
              </div>
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">Rata-rata</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs text-gray-500">{projects.length} proyek telah diselesaikan</p>

          {projects.map((project) => (
            <Card key={project.id} className="rounded-[16px] border border-gray-100 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {project.customer?.avatar_url ? (
                      <Image src={project.customer.avatar_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                        {project.customer?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {project.customer?.full_name || 'Pelanggan'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {project.completed_at
                          ? new Date(project.completed_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  {project.reviews?.[0] && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= project.reviews[0].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Briefcase size={14} className="text-gray-400 shrink-0" />
                  <span>{project.service_name}</span>
                </div>

                {project.reviews?.[0]?.review_text && (
                  <p className="text-xs text-gray-500 italic leading-relaxed border-l-2 border-gray-200 pl-3">
                    &ldquo;{project.reviews[0].review_text}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
