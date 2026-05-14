'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Camera, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

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
      }

      toast.success('Foto profil berhasil diperbarui');
    } catch {
      toast.success('Foto tampil sementara');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ full_name: formData.fullName, phone: formData.phone })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: formData.fullName, phone: formData.phone });
      toast.success('Profil berhasil diperbarui');
      router.push('/customer/profile');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const initial = profile?.full_name?.charAt(0)?.toUpperCase() || 'P';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-90 transition-all duration-200">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Edit Profil</span>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="relative mt-4 mb-8">
          <div className="w-24 h-24 rounded-full ring-4 ring-emerald-200 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{initial}</span>
            )}
          </div>
          <button
            onClick={handleCameraClick}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-emerald-700 active:scale-90 transition-all duration-200"
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

        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="h-14 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="h-14 bg-gray-100 border-transparent rounded-xl shadow-sm text-base cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 ml-1">Email tidak dapat diubah</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nomor HP</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="h-14 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm text-base"
            />
          </div>

          <Link
            href="/customer/profile/address"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-500 transition-colors duration-200 group"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Atur Alamat</p>
              <p className="text-xs text-gray-400">Lokasi pengerjaan & koordinat</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm"
        >
          {saving ? <><Loader2 size={20} className="animate-spin mr-2" /> Menyimpan...</> : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}
