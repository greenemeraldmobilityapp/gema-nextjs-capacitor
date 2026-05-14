'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut, Wallet, ChevronRight, Camera, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { useWallet } from '@/lib/services/useWallet';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const primaryMenu = [
  { icon: User, label: 'Informasi Akun', subtitle: 'Nama, email, nomor HP', href: '/customer/profile/edit' },
  { icon: Wallet, label: 'Dompet Saya', subtitle: 'Saldo & riwayat transaksi', href: '/wallet' },
  { icon: MapPin, label: 'Alamat', subtitle: 'Atur alamat pengerjaan', href: '/customer/profile/address' },
  { icon: ShieldCheck, label: 'Keamanan', subtitle: 'Kata sandi & autentikasi', href: '/customer/settings/security' },
];

const secondaryMenu = [
  { icon: HelpCircle, label: 'Pusat Bantuan', subtitle: 'FAQ & customer service', href: '/customer/help' },
  { icon: Settings, label: 'Pengaturan', subtitle: 'Notifikasi & preferensi', href: '/customer/settings/notifications' },
];

export default function ProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: wallet, isLoading: walletLoading } = useWallet(profile?.id);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    if (!window.confirm('Yakin ingin keluar dari akun ini?')) return;
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      setProfile(null);
      router.push('/login');
    });
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${ext}`;
      await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData?.publicUrl || null;
      if (avatarUrl) {
        await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', profile.id);
        setProfile({ ...profile, avatar_url: avatarUrl });
      }

      toast.success('Foto profil berhasil diperbarui');
    } catch {
      toast.success('Foto tampil sementara');
    } finally {
      setUploading(false);
    }
  };

  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || 'P';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-b from-emerald-700 to-emerald-600 pt-10 text-white rounded-b-[24px] shadow-lg shadow-emerald-900/20 overflow-hidden">
        <div className="px-6 pb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full ring-4 ring-white/30 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">{initial}</span>
                )}
              </div>
              <button
                onClick={handleCameraClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 border-2 border-emerald-600 shadow-sm hover:bg-emerald-50 active:scale-90 transition-all duration-200"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <h1 className="text-xl font-heading font-bold">{profile?.full_name || 'Pengguna'}</h1>
            <p className="text-emerald-100 text-sm">{profile?.email || ''}</p>
            {profile?.phone && (
              <p className="text-emerald-200 text-xs mt-1">{profile.phone}</p>
            )}
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-6" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 48C240 48 480 0 720 0C960 0 1200 48 1440 48V48H0V48Z" fill="#F9FAFB" />
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
                  {walletLoading ? (
                    <div className="h-7 w-24 bg-white/20 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="font-heading text-xl font-bold">
                      Rp {(wallet?.balance || 0).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/wallet/topup" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                  Top Up
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
            {primaryMenu.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm group-hover:text-emerald-600 transition-colors duration-200">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            ))}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {secondaryMenu.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm group-hover:text-gray-700 transition-colors duration-200">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border-none shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:shadow-red-500/10 transition-all duration-200"
          onClick={handleLogout}
        >
          <CardContent className="p-4 flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200">
              <LogOut size={20} className="text-white" />
            </div>
            <span className="font-medium text-red-600 group-hover:text-red-700 transition-colors duration-200">Keluar</span>
            <ChevronRight size={18} className="text-red-300 shrink-0 ml-auto group-hover:translate-x-0.5 transition-transform duration-200" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
