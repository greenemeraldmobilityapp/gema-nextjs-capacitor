'use client';

import Link from 'next/link';
import { User, Star, Shield, Briefcase, ChevronRight, Settings, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function VendorProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: vendor, isLoading, error } = useVendor(profile?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profil', href: '/vendor/profile/edit' },
    { icon: Briefcase, label: 'Portofolio', href: '/vendor/portfolio' },
    { icon: Settings, label: 'Pengaturan', href: '#' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Gagal memuat profil</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Profil</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <User size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{vendor?.users?.full_name || profile?.full_name || 'Vendor'}</h2>
          <p className="text-sm text-gray-500">{vendor?.specialization || 'Belum diatur'}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="font-medium text-gray-900">{vendor?.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Briefcase size={16} />
              <span className="text-gray-900">{vendor?.total_jobs || 0} Proyek</span>
            </div>
            {vendor?.is_verified && (
              <div className="flex items-center gap-1 text-emerald-600">
                <Shield size={16} />
                <span className="font-medium">Terverifikasi</span>
              </div>
            )}
          </div>
          {vendor?.users?.email && (
            <p className="text-xs text-gray-400 mt-2">{vendor.users.email}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border divide-y">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <item.icon size={18} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Keluar
        </Button>
      </div>
    </div>
  );
}
