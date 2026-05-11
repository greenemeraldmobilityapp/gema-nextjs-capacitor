'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Camera, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: '',
      });
    }
  }, [profile]);

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

      setProfile({ ...profile, full_name: formData.fullName });
      toast.success('Profil berhasil diperbarui');
      router.push('/customer/profile');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Edit Profil</span>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="relative mt-4 mb-8">
          <div className="w-24 h-24 bg-emerald-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
            <User size={48} className="text-emerald-700" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-emerald-700 transition-colors">
            <Camera size={14} />
          </button>
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
