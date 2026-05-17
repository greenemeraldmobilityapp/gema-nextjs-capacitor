'use client';

import Link from 'next/link';
import { ShieldCheck, IdCard, ScrollText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: IdCard, label: 'Verifikasi KTP', desc: 'Upload foto KTP dan isi data diri' },
  { icon: ScrollText, label: 'Sertifikat Profesi', desc: 'Tambahkan sertifikat keahlian (opsional)' },
  { icon: Clock, label: 'Review', desc: 'Tim GEMA akan mereview dokumen 1-3 hari' },
];

export default function VerificationIntroPage() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100">
        <h1 className="font-heading text-xl font-bold text-stone-800">Verifikasi Akun</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full shadow-lg flex items-center justify-center mb-6">
            <ShieldCheck size={56} className="text-emerald-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-stone-800 mb-2">Verifikasi Profil Anda</h2>
          <p className="text-sm text-stone-500 mb-8 max-w-xs">
            Verifikasi akun Anda untuk meningkatkan kepercayaan pelanggan dan mengakses lebih banyak fitur.
          </p>

          <div className="w-full max-w-sm space-y-4 text-left">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-white shadow-sm flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{step.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 pt-4">
          <Link href="/vendor/verification/ktp" className="block w-full">
            <Button variant="premium" size="lg" className="w-full">
              Mulai Verifikasi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
