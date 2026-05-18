'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Camera, Loader2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetSelect, { type BottomSheetOption } from '@/components/shared/BottomSheetSelect';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';
import { compressImage, deleteExistingAvatar } from '@/lib/image-utils';
import { toast } from 'sonner';

const supabase = createClient();

const SPECIALIZATION_OPTIONS: BottomSheetOption[] = [
  { value: 'Tukang Bangunan', label: 'Tukang Bangunan' },
  { value: 'Teknisi Listrik', label: 'Teknisi Listrik' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Cat & Interior', label: 'Cat & Interior' },
  { value: 'AC & Kulkas', label: 'AC & Kulkas' },
  { value: 'Elektronik', label: 'Elektronik' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Pest Control', label: 'Pest Control' },
];

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

export default function VendorEditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: vendor, isLoading } = useVendor(profile?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (vendor && profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: vendor.users?.phone || '',
        specialization: vendor.specialization || '',
        bio: vendor.bio || '',
      });
      if (vendor.avatar_url) {
        setAvatarPreview(vendor.avatar_url);
        setImgError(false);
      }
    }
  }, [vendor, profile]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > AVATAR_MAX_SIZE) {
      setUploadError(`Ukuran file maksimal ${AVATAR_MAX_SIZE / 1024 / 1024}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar yang diizinkan');
      return;
    }

    setUploadError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return avatarPreview?.startsWith('http') ? avatarPreview : null;

    setUploading(true);
    const compressedBlob = await compressImage(avatarFile);
    const filePath = `vendor_${userId}.jpg`;

    await deleteExistingAvatar(supabase, userId);

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedBlob, {
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (uploadErr) {
      setUploading(false);
      throw new Error('Gagal upload foto: ' + uploadErr.message);
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setUploading(false);
    return urlData?.publicUrl || null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setErrorMsg('');

    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(profile.id);
      } else if (avatarPreview?.startsWith('http')) {
        avatarUrl = avatarPreview;
      }

      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
        })
        .eq('id', profile.id);

      if (userError) throw userError;

      if (avatarUrl !== null) {
        const { error: avatarUserError } = await supabase
          .from('users')
          .update({ avatar_url: avatarUrl })
          .eq('id', profile.id);

        if (avatarUserError) throw avatarUserError;
      }

      const updateData: Record<string, unknown> = {
        user_id: profile.id,
        specialization: formData.specialization || null,
        bio: formData.bio || null,
      };
      if (avatarUrl !== null) {
        updateData.avatar_url = avatarUrl;
      }

      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .upsert(updateData, { onConflict: 'user_id' });

      if (vendorError) throw vendorError;

      if (avatarUrl && profile) {
        setProfile({ ...profile, avatar_url: avatarUrl });
      }

      setSaved(true);
      toast.success('Profil berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['vendor', profile.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setTimeout(() => {
        setSaved(false);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Edit Profil</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant text-center">
          <div className="relative w-24 h-24 mx-auto">
            {avatarPreview && !imgError ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                onError={() => setImgError(true)}
                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md flex items-center justify-center">
                <User size={40} className="text-emerald-600" />
              </div>
            )}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md border-2 border-white hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-2">Tap untuk mengganti foto</p>
          {uploadError && (
            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          onChange={handleAvatarSelect}
          className="hidden"
        />

        {saved && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/50 text-emerald-700 rounded-xl text-sm text-center font-medium backdrop-blur-sm">
            Profil berhasil disimpan!
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50/80 border border-red-200/50 text-red-600 rounded-xl text-sm text-center font-medium backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Lengkap</label>
            <Input
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Email</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nomor HP</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Spesialisasi</label>
            <BottomSheetSelect
              value={formData.specialization}
              onChange={(v) => setFormData(prev => ({ ...prev, specialization: v }))}
              options={SPECIALIZATION_OPTIONS}
              placeholder="Pilih spesialisasi"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full h-24 bg-stone-50 border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || uploading}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {uploading ? 'Mengupload foto...' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </div>
  );
}
