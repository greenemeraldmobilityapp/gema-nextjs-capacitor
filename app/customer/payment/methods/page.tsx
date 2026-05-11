'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Landmark, CreditCard, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/lib/services/useOrders';
import { useWallet } from '@/lib/services/useWallet';
import { useAuthStore } from '@/store/auth';

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <PaymentMethodsContent />
    </Suspense>
  );
}

function PaymentMethodsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore(s => s.profile);
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: wallet } = useWallet(profile?.id);
  const [selectedMethod, setSelectedMethod] = useState<string>('gemapay');

  const methods = [
    {
      id: 'gemapay',
      title: 'GEMA Pay',
      icon: Wallet,
      subtitle: `Saldo: Rp ${(wallet?.balance || 0).toLocaleString('id-ID')}`,
      description: 'Bayar menggunakan saldo GemaPay',
    },
    {
      id: 'transfer',
      title: 'Transfer Bank',
      icon: Landmark,
      subtitle: 'BCA / Mandiri / BRI',
      description: 'Konfirmasi 1-2 hari kerja',
    },
    {
      id: 'credit_card',
      title: 'Kartu Kredit',
      icon: CreditCard,
      subtitle: 'Visa / Mastercard',
      description: 'Pembayaran instan',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-400">
        <AlertCircle size={48} className="mb-3 opacity-50" />
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/customer/orders" className="mt-2 text-sm text-emerald-600 font-medium">Kembali ke pesanan</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/booking?vendorId=${order.vendor_id}&serviceId=${order.service_id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Pilih Metode Pembayaran</span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white rounded-3xl p-5 shadow-sm border text-center">
          <p className="text-sm text-gray-500 mb-1">{order.service_name}</p>
          <p className="text-3xl font-heading font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</p>
          {order.platform_fee > 0 && (
            <p className="text-xs text-gray-400 mt-1">Termasuk biaya platform Rp {order.platform_fee.toLocaleString('id-ID')}</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 px-1">Metode Pembayaran</h3>
          {methods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border-2 ${
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
                <h4 className="font-bold text-gray-900">{method.title}</h4>
                <p className="text-xs text-gray-500">{method.subtitle}</p>
                <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
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

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          variant="pill"
          size="lg"
          className="w-full shadow-sm"
          onClick={() => {
            if (selectedMethod === 'gemapay') {
              router.push(`/customer/payment?order_id=${orderId}&method=gemapay`);
            } else {
              router.push(`/customer/payment?order_id=${orderId}&method=${selectedMethod}`);
            }
          }}
        >
          Konfirmasi Pembayaran
        </Button>
      </div>
    </div>
  );
}
