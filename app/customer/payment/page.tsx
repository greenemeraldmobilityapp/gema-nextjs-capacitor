'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '155000';
  const formatRupiah = (angka: string) => {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  };

  const [selectedMethod, setSelectedMethod] = useState<string>('qris');

  const methods = [
    { id: 'qris', title: 'QRIS', icon: CreditCard, subtitle: 'Bayar dengan aplikasi apa saja' },
    { id: 'wallet', title: 'GemaPay Wallet', icon: Wallet, subtitle: 'Saldo: Rp 200.000' },
    { id: 'va_bca', title: 'BCA Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
    { id: 'va_mandiri', title: 'Mandiri Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/booking" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Pilih Pembayaran</span>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-emerald-100">
          <p className="text-sm text-gray-500 mb-1">Total yang harus dibayar</p>
          <h2 className="text-3xl font-bold text-emerald-600">{formatRupiah(amount)}</h2>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 px-1">Metode Pembayaran</h3>
          
          <div className="space-y-3">
            {methods.map((method) => (
              <div 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === method.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  selectedMethod === method.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <method.icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 leading-tight mb-1">{method.title}</h4>
                  <p className="text-xs text-gray-500">{method.subtitle}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  selectedMethod === method.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && <CheckCircle2 size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Link href="/customer/payment/success" className="block w-full">
          <Button className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm">
            Bayar Sekarang
          </Button>
        </Link>
      </div>
    </div>
  );
}
