'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ArrowLeft, User, Camera, Loader2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetSelect, { type BottomSheetOption } from '@/components/shared/BottomSheetSelect';
import CameraCapture from '@/components/shared/CameraCapture';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { useCategories } from '@/lib/services/useCategories';
import { createClient } from '@/lib/supabase/client';
import { compressImage, deleteFolderContents } from '@/lib/image-utils';
import { toast } from 'sonner';

const supabase = createClient();

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export default function VendorEditProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone-50"><Loader2 size={24} className="animate-spin text-stone-400" /></div>}>
      <EditProfileForm />
    </Suspense>
  );
}

function EditProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data: vendor, isLoading } = useVendor(profile?.id);
  const { data: categories = [] } = useCategories();
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    categoryId: '',
    bio: '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!profile?.id) return;
      const supabase = createClient();
      const { data } = await supabase.from('users').select('is_online').eq('id', profile.id).single();
      if (data) setIsOnline(data.is_online ?? false);
    };
    fetchStatus();
  }, [profile?.id]);
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (vendor && profile && !initialized.current) {
      initialized.current = true;
      setFormData({
        fullName: profile.full_name || '',
        phone: vendor.users?.phone || '',
        specialization: vendor.specialization || '',
        categoryId: vendor.category_id || '',
        bio: vendor.bio || '',
      });
      if (vendor.avatar_url) {
        setAvatarPreview(vendor.avatar_url);
        setImgError(false);
      }
    }
  }, [vendor, profile]);

  const handleAvatarCapture = (file: File) => {
    if (file.size > AVATAR_MAX_SIZE) {
      setUploadError(`Ukuran file maksimal ${AVATAR_MAX_SIZE / 1024 / 1024}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar yang diizinkan');
      return;
    }

    setUploadError(null);
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    const compressedBlob = await compressImage(file);
    const timestamp = Date.now();
    const filePath = `vendor/${userId}/avatar_${timestamp}.jpg`;

    await deleteFolderContents(supabase, 'avatars', `vendor/${userId}`);

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedBlob, {
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

    const savePromise = (async () => {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, profile.id);
        if (avatarUrl) {
          setAvatarPreview(`${avatarUrl}?t=${Date.now()}`);
        }
        if (avatarPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
      } else if (avatarPreview?.startsWith('http')) {
        avatarUrl = avatarPreview;
      }

      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
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
        category_id: formData.categoryId || null,
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
    })();

    toast.promise(savePromise, {
      loading: 'Menyimpan profil...',
      success: () => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: ['vendor', profile.id] });
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
        if (searchParams.get('from') === 'register') {
          router.push('/vendor/verification');
        } else {
          setTimeout(() => { setSaved(false); }, 1500);
        }
        return 'Profil berhasil disimpan';
      },
      error: (err) => {
        const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
        setErrorMsg(msg);
        return msg;
      },
    });

    try {
      await savePromise;
    } catch {
      // error handled by toast.promise
    } finally {
      setSaving(false);
    }
  };

  const openCamera = () => {
    setUploadError(null);
    setShowCamera(true);
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
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={96}
                height={96}
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
              onClick={openCamera}
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

        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Power className="w-5 h-5 text-emerald-500" />
            ) : (
              <PowerOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-gray-900">Status Online</p>
              <p className="text-sm text-gray-500">{isOnline ? 'Menerima pesanan baru' : 'Tidak menerima pesanan'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!profile?.id) return;
              const newStatus = !isOnline;
              setIsOnline(newStatus);
              try {
                const supabase = createClient();
                const { error } = await supabase.from('users').update({ is_online: newStatus }).eq('id', profile.id);
                if (error) throw error;
                toast.success(newStatus ? 'Online' : 'Offline');
              } catch (err) {
                setIsOnline(!newStatus);
                toast.error('Gagal mengubah status');
              }
            }}
            className={`relative h-8 w-16 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${isOnline ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
        </div>

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
              type="email"
              value={profile?.email || ''}
              disabled
              className="h-12 bg-stone-100 border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
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
              onChange={(v) => {
                const cat = categories.find((c) => c.name === v);
                setFormData(prev => ({ ...prev, specialization: v, categoryId: cat?.id || '' }));
              }}
              options={categories.map((cat) => ({ value: cat.name, label: cat.name }))}
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
      {showCamera && (
        <CameraCapture
          facingMode="user"
          onCapture={handleAvatarCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
