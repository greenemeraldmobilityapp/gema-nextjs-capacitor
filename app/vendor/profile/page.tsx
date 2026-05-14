'use client';

import Link from 'next/link';
import { User, Star, Shield, Briefcase, ChevronRight, Settings, LogOut, Loader2, AlertCircle, Wallet, PlusCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { useWallet } from '@/lib/services/useWallet';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const supabase = createClient();

export default function VendorProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: vendor, isLoading, error } = useVendor(profile?.id);
  const { data: wallet } = useWallet(profile?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profil', href: '/vendor/profile/edit' },
    { icon: Briefcase, label: 'Portofolio', href: '/vendor/portfolio' },
    { icon: MapPin, label: 'Alamat & Area Layanan', href: '/vendor/profile/address' },
    { icon: Settings, label: 'Pengaturan', href: '#' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Gagal memuat profil</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <h1 className="font-heading text-xl font-bold text-stone-800">Profil</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md flex items-center justify-center">
              <User size={40} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="font-heading text-xl font-bold text-stone-800">{vendor?.users?.full_name || profile?.full_name || 'Vendor'}</h2>
          <p className="text-sm text-stone-500">{vendor?.specialization || 'Belum diatur'}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold text-stone-800">{vendor?.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <Briefcase size={16} />
              <span className="text-stone-800">{vendor?.total_jobs || 0} Proyek</span>
            </div>
            {vendor?.is_verified && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-700 border border-amber-200/50">
                <Shield size={14} className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Terverifikasi</span>
              </div>
            )}
          </div>
          {vendor?.users?.email && (
            <p className="text-xs text-stone-400 mt-3">{vendor.users.email}</p>
          )}
        </div>

        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 rounded-3xl p-5 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Wallet size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-100">Saldo GemaPay</p>
                <p className="font-heading text-2xl font-bold text-white">Rp {(wallet?.balance || 0).toLocaleString()}</p>
              </div>
            </div>
            <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all shadow-md">
              <PlusCircle size={22} className="text-white" />
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-elegant divide-y divide-stone-100">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-5 py-4.5 hover:bg-stone-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-sm flex items-center justify-center">
                  <item.icon size={18} className="text-stone-600" />
                </div>
                <span className="text-sm font-medium text-stone-800">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-2 border-red-200/50 text-red-600 hover:bg-red-50/50 flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm"
        >
          <LogOut size={18} />
          Keluar
        </Button>
      </div>
    </div>
  );
}