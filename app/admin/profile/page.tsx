'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, LogOut, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function AdminProfilePage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold text-lg">Profil Admin</span>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <User size={36} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{profile.full_name || 'Admin'}</h2>
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700 mt-2">
            <Shield size={12} />
            Admin
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border divide-y">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">{profile.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900">Administrator</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 bg-white border shadow-sm"
        >
          <LogOut size={18} />
          Keluar
        </Button>
      </div>
    </div>
  );
}
