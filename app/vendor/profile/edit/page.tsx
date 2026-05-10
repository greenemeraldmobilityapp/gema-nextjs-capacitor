'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Camera, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function VendorEditProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: vendor, isLoading } = useVendor(profile?.id);
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

  useEffect(() => {
    if (vendor && profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: vendor.users?.phone || '',
        specialization: vendor.specialization || '',
        bio: vendor.bio || '',
      });
    }
  }, [vendor, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
        })
        .eq('id', profile.id);

      if (userError) throw userError;

      const { error: vendorError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: profile.id,
          specialization: formData.specialization || null,
          bio: formData.bio || null,
        }, { onConflict: 'user_id' });

      if (vendorError) throw vendorError;

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/vendor/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Edit Profil</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <User size={36} className="text-emerald-600" />
            </div>
            <button type="button" className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tap untuk mengganti foto</p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm text-center font-medium">
            Profil berhasil disimpan!
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-xl p-5 shadow-sm border space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
            <Input
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nomor HP</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Spesialisasi</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full h-24 bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </div>
  );
}
