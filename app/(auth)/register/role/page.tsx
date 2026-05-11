'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/card';
import { UserCircle, Wrench, ArrowLeft, Circle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Role = 'customer' | 'vendor' | null;

const roles = [
  {
    key: 'customer' as const,
    icon: UserCircle,
    title: 'Pelanggan',
    desc: 'Cari & pesan jasa terbaik',
  },
  {
    key: 'vendor' as const,
    icon: Wrench,
    title: 'Mitra',
    desc: 'Tawarkan jasa Anda',
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 px-4 py-4 relative flex items-center justify-center shadow-lg shadow-emerald-900/20">
        <Link
          href="/onboarding"
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-all"
          aria-label="Kembali ke onboarding"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-xl font-bold text-white tracking-[0.15em]">GEMA</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <div className={`mb-8 text-center transition-all duration-500 delay-75 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <img
            src="/images/gema-logo.png"
            alt="GEMA Logo"
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
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-200/50'
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
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
                'Lanjut'
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-2">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
