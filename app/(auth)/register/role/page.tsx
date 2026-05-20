'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { UserCircle, Wrench, ArrowLeft, Circle, CheckCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Role = 'customer' | 'vendor' | null;

const roles = [
  {
    key: 'customer' as const,
    icon: UserCircle,
    title: 'Pelanggan',
    desc: 'Cari & pesan jasa terbaik',
    benefit: 'Akses ribuan layanan',
  },
  {
    key: 'vendor' as const,
    icon: Wrench,
    title: 'Mitra',
    desc: 'Tawarkan jasa Anda',
    benefit: 'Dapatkan lebih banyak klien',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem('gema_selected_role');
    if (saved === 'customer' || saved === 'vendor') {
      setSelectedRole(saved);
    }
  }, []);

  const handleSelect = (role: Role) => {
    if (isNavigating) return;
    setSelectedRole(role === selectedRole ? null : role);
  };

  const handleKeyDown = (role: Role, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(role);
    }
  };

  const handleLanjut = () => {
    if (selectedRole && !isNavigating) {
      setIsNavigating(true);
      sessionStorage.setItem('gema_selected_role', selectedRole);
      router.push(`/register?role=${selectedRole}`);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5" aria-label="Langkah pendaftaran">
      <span className="text-xs font-medium text-emerald-600">Onboarding</span>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        <div className="w-6 h-px bg-emerald-300" />
        <div className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
        <div className="w-6 h-px bg-gray-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      </div>
      <span className="text-xs font-medium text-gray-400">Daftar</span>
    </div>
  );

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 pb-safe overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-50 rounded-full opacity-60 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex flex-col">
        <div className="flex items-center justify-center">
          <Link
            href="/onboarding"
            className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            aria-label="Kembali ke onboarding"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-emerald-700 tracking-[0.15em]">GEMA</h1>
        </div>
        {stepIndicator}
      </header>

      <div className="relative flex-1 p-6 flex flex-col z-10">
        <div className={`mb-8 text-center transition-all duration-500 delay-75 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Image
            src="/images/gema-logo.png"
            alt="GEMA Logo"
            width={56}
            height={56}
            className="w-14 h-14 mx-auto mb-4"
          />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Bergabung dengan GEMA</h1>
          <p className="text-gray-500">Pilih peran Anda</p>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            return (
              <div
                key={role.key}
                className={`transition-all duration-500 motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: mounted ? `${(index + 1) * 100}ms` : '0ms' }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 border-2 rounded-[24px] active:scale-[0.98] h-full ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-200/60 ring-2 ring-emerald-400/30'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelect(role.key)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Pilih sebagai ${role.title}`}
                  onKeyDown={(e) => handleKeyDown(role.key, e)}
                >
                  <CardHeader className="py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <Icon size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-heading text-lg font-semibold transition-colors duration-200 ${
                          isSelected ? 'text-emerald-900' : 'text-gray-900'
                        }`}>
                          {role.title}
                        </p>
                        <p className={`text-sm transition-colors duration-200 ${
                          isSelected ? 'text-emerald-700' : 'text-gray-500'
                        }`}>
                          {role.desc}
                        </p>
                        <p className={`text-xs mt-0.5 transition-colors duration-200 ${
                          isSelected ? 'text-emerald-500' : 'text-gray-400'
                        }`}>
                          {role.benefit}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckCircle size={24} className="text-emerald-600" />
                        ) : (
                          <Circle size={24} className="text-gray-300" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            );
          })}

          <div
            className={`transition-all duration-500 motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: mounted ? '300ms' : '0ms' }}
          >
            <Button
              variant="pill"
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-900/20 hover:brightness-105 active:brightness-95 transition-all"
              disabled={!selectedRole || isNavigating}
              onClick={handleLanjut}
            >
              {isNavigating ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </span>
              ) : (
                selectedRole
                  ? `Daftar sebagai ${roles.find(r => r.key === selectedRole)?.title}`
                  : 'Pilih peran Anda'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Peran dapat diubah nanti melalui Pengaturan Akun
          </p>

          <div className="text-center text-sm text-gray-500 pt-1">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-500">
              Masuk <LogIn size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
