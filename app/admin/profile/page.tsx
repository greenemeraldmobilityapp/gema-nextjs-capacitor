'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, User, Settings, HelpCircle, LogOut,
  ChevronRight, Camera, Shield, Loader2, Mail,
  LayoutDashboard, ShoppingCart, Store, Scale,
  Wrench, Tag, ShieldAlert, Receipt, TrendingUp,
  Users, AlertCircle, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { useAdminStats } from '@/lib/services/useAdmin';
import { createClient } from '@/lib/supabase/client';
import { compressImage, deleteFolderContents } from '@/lib/image-utils';
import LogoutModal from '@/components/shared/LogoutModal';
import { toast } from 'sonner';

const primaryMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', subtitle: 'Ringkasan platform', href: '/admin/dashboard' },
  { icon: ShoppingCart, label: 'Pesanan', subtitle: 'Pantau & kelola pesanan', href: '/admin/orders' },
  { icon: Receipt, label: 'Transaksi', subtitle: 'Riwayat pembayaran', href: '/admin/transactions' },
  { icon: Store, label: 'Vendor', subtitle: 'Manajemen vendor', href: '/admin/vendors' },
  { icon: Scale, label: 'Sengketa', subtitle: 'Sengketa & komplain', href: '/admin/disputes' },
];

const secondaryMenu = [
  { icon: Wrench, label: 'Layanan', subtitle: 'Daftar layanan', href: '/admin/services' },
  { icon: Tag, label: 'Promo', subtitle: 'Kode promo & diskon', href: '/admin/promos' },
  { icon: ShieldAlert, label: 'Fraud', subtitle: 'Deteksi kecurangan', href: '/admin/fraud' },
];

export default function AdminProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [showLogout, setShowLogout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    setShowLogout(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogout(false);
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
      const compressedBlob = await compressImage(file);
      const timestamp = Date.now();
      const filePath = `admin/${profile.id}/avatar_${timestamp}.jpg`;

      await deleteFolderContents(supabase, 'avatars', `admin/${profile.id}`);

      await supabase.storage
        .from('avatars')
        .upload(filePath, compressedBlob, { contentType: 'image/jpeg' });

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
      toast.error('Foto gagal diupload, tapi perubahan tersimpan sementara');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || 'A';
  const statsItems = stats
    ? [
        { icon: Users, label: 'Pengguna', value: stats.totalUsers.toLocaleString('id-ID'), color: 'bg-blue-100 text-blue-600' },
        { icon: Store, label: 'Vendor', value: stats.totalVendors.toLocaleString('id-ID'), color: 'bg-emerald-100 text-emerald-600' },
        { icon: ShoppingCart, label: 'Pesanan', value: stats.totalOrders.toLocaleString('id-ID'), color: 'bg-purple-100 text-purple-600' },
        { icon: Scale, label: 'Sengketa', value: stats.openDisputes.toString(), color: 'bg-red-100 text-red-600' },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-b from-emerald-700 to-emerald-600 pt-10 text-white rounded-b-[24px] shadow-lg shadow-emerald-900/20 overflow-hidden">
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10" />
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full ring-4 ring-white/30 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
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
            <h1 className="text-xl font-heading font-bold">{profile.full_name || 'Admin'}</h1>
            <p className="text-emerald-100 text-sm">{profile.email || ''}</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-700/50 px-3 py-0.5 text-xs font-semibold text-emerald-100 mt-2">
              <Shield size={12} />
              Admin
            </div>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-6" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 48C240 48 480 0 720 0C960 0 1200 48 1440 48V48H0V48Z" fill="#F9FAFB" />
        </svg>
      </div>

      <div className="p-4 space-y-4 -mt-2">
        {stats && !statsLoading && (
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-500 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
            <CardContent className="p-4 relative z-10">
              <p className="text-emerald-100 text-xs font-medium mb-3">Ringkasan Platform</p>
              <div className="grid grid-cols-4 gap-2">
                {statsItems.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <item.icon size={16} />
                    </div>
                    <span className="text-lg font-bold leading-tight">{item.value}</span>
                    <span className="text-[10px] text-emerald-200">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {statsLoading && (
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-5 w-10 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

      <LogoutModal open={showLogout} onConfirm={handleLogoutConfirm} onCancel={() => setShowLogout(false)} />
    </div>
  );
}
