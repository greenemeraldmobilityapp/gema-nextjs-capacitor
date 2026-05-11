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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Verifikasi Akun</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={48} className="text-emerald-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Verifikasi Profil Anda</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xs">
            Verifikasi akun Anda untuk meningkatkan kepercayaan pelanggan dan mengakses lebih banyak fitur.
          </p>

          <div className="w-full max-w-sm space-y-4 text-left">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 pt-4">
          <Link href="/vendor/verification/ktp" className="block w-full">
            <Button variant="pill" size="lg" className="w-full shadow-sm">
              Mulai Verifikasi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
