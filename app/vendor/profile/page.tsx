'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Star, Shield, ShieldCheck, Briefcase, ChevronRight, Settings, LogOut, Loader2, AlertCircle, Clock, Wallet, MapPin, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { useWallet } from '@/lib/services/useWallet';
import { createClient } from '@/lib/supabase/client';
import LogoutModal from '@/components/shared/LogoutModal';

const supabase = createClient();

export default function VendorProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const isVendor = useAuthStore((s) => s.isVendor);
  const mode = useAuthStore((s) => s.mode);
  const setMode = useAuthStore((s) => s.setMode);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: vendor, isLoading, error } = useVendor(profile?.id);
  const { data: wallet } = useWallet(profile?.id);
  const [avatarError, setAvatarError] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => { setAvatarError(false); }, [vendor?.avatar_url]);

  const handleLogout = () => {
    setShowLogout(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogout(false);
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  const menuItems = [
    { icon: ShieldCheck, label: 'Verifikasi KYC & Sertifikat', subtitle: 'Verifikasi akun Anda', href: '/vendor/verification', badge: true },
    { icon: User, label: 'Edit Profil', subtitle: 'Nama, spesialisasi, bio', href: '/vendor/profile/edit' },
    { icon: Briefcase, label: 'Portofolio', subtitle: 'Daftar layanan & karya', href: '/vendor/portfolio' },
    { icon: MapPin, label: 'Alamat & Area Layanan', subtitle: 'Lokasi & koordinat', href: '/vendor/profile/address' },
    { icon: Settings, label: 'Pengaturan', subtitle: 'Preferensi akun', href: '/vendor/settings' },
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
        <p className="text-xs text-stone-400 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-400">
        <User size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Profil belum lengkap</p>
        <p className="text-sm text-stone-400 mt-1">Lengkapi profil Anda terlebih dahulu</p>
        <Link href="/vendor/profile/edit" className="mt-4 inline-flex items-center justify-center h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 transition-colors">
          Lengkapi Profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="relative bg-gradient-to-b from-emerald-700 to-emerald-600 pt-10 pb-6 text-white rounded-b-[24px] shadow-lg shadow-emerald-900/20 overflow-hidden">
        <div className="px-6 pb-4">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              {vendor.avatar_url && !avatarError ? (
                <Image src={vendor.avatar_url} alt="Avatar" onError={() => setAvatarError(true)} fill className="rounded-full object-cover ring-4 ring-white/30 shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full ring-4 ring-white/30 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                  <User size={40} className="text-white" />
                </div>
              )}
            </div>
            <h1 className="text-xl font-heading font-bold">{vendor?.users?.full_name || profile?.full_name || 'Vendor'}</h1>
            <p className="text-emerald-100 text-sm">{vendor?.specialization || 'Belum diatur'}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-yellow-300">
                <Star size={16} fill="currentColor" />
                <span className="font-semibold text-white">{vendor?.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-100">
                <Briefcase size={16} />
                <span className="text-white">{vendor?.total_jobs || 0} Proyek</span>
              </div>
              {vendor?.is_verified && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20">
                  <Shield size={14} />
                  <span className="text-xs font-semibold">Terverifikasi</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-6" viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
          <path d="M0 48C240 48 480 0 720 0C960 0 1200 48 1440 48V48H0V48Z" fill="#FAFAF9" />
        </svg>
      </div>

      <div className="p-4 space-y-4 -mt-2">
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-500 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs">Saldo GemaPay</p>
                  <p className="font-heading text-xl font-bold">Rp {(wallet?.balance || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/wallet/withdraw" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                  Tarik Saldo
                </Link>
                <Link href="/wallet" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                  Riwayat
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const isKyc = item.label === 'Verifikasi KYC & Sertifikat';
              const vs = vendor?.verification_status;

              const kycBadge = (() => {
                if (!isKyc) return null;
                if (vs === 'approved' && vendor?.is_verified) return { text: 'Terverifikasi', cls: 'text-emerald-600 bg-emerald-50' };
                if (vs === 'pending') return { text: 'Diproses', cls: 'text-amber-600 bg-amber-50' };
                if (vs === 'rejected') return { text: 'Ditolak', cls: 'text-red-600 bg-red-50' };
                if (vs === 'revoked') return { text: 'Dicabut', cls: 'text-stone-500 bg-stone-100' };
                return { text: 'Mulai', cls: 'text-emerald-600 bg-emerald-50' };
              })();

              const kycHref = isKyc
                ? !vs || vs === 'none' ? '/vendor/verification' : '/vendor/verification/review'
                : item.href;

              return (
                <Link
                  key={index}
                  href={kycHref}
                  className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                    isKyc
                      ? vs === 'pending' ? 'bg-amber-50 text-amber-600'
                        : vs === 'rejected' ? 'bg-red-50 text-red-500'
                        : vs === 'revoked' ? 'bg-stone-100 text-stone-500'
                        : 'bg-emerald-50 text-emerald-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm group-hover:text-emerald-600 transition-colors duration-200">{item.label}</p>
                    {item.subtitle && (
                      <p className="text-xs text-stone-400 mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  {kycBadge ? (
                    <div className={`${kycBadge.cls} text-[11px] font-bold px-3 py-1 rounded-full shrink-0`}>
                      {kycBadge.text}
                    </div>
                  ) : (
                    <ChevronRight size={18} className="text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
                  )}
                </Link>
              );
            })}
            <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mx-4" />
          </CardContent>
        </Card>

        {isVendor && profile?.role !== 'vendor' && (
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-all duration-200 group"
              onClick={() => {
                setMode('customer');
                localStorage.setItem('gema_mode', 'customer');
                router.push('/customer/home');
              }}
            >
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform duration-200">
                <ArrowLeftRight size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm group-hover:text-amber-600 transition-colors duration-200">
                  Mode Pelanggan
                </p>
                <p className="text-xs text-stone-400 mt-0.5">Beralih ke halaman utama</p>
              </div>
              <ChevronRight size={18} className="text-stone-300 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
            </CardContent>
          </Card>
        )}

        <Card
          className="rounded-2xl border-none shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:shadow-red-500/10 transition-all duration-200"
          onClick={handleLogout}
        >
          <CardContent className="p-4 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200">
              <LogOut size={20} className="text-white" />
            </div>
            <span className="font-medium text-red-600 group-hover:text-red-700 transition-colors duration-200">Keluar</span>
            <ChevronRight size={18} className="text-red-300 shrink-0 ml-auto group-hover:translate-x-0.5 transition-transform duration-200" />
          </CardContent>
        </Card>
      </div>

      <LogoutModal open={showLogout} onConfirm={handleLogoutConfirm} onCancel={() => setShowLogout(false)} />
    </div>
  );
}
