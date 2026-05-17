'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, CreditCard, Landmark, CheckCircle2, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useOrder } from '@/lib/services/useOrders';
import { useWallet } from '@/lib/services/useWallet';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || '';
  const profile = useAuthStore((s) => s.profile);
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: wallet } = useWallet(profile?.id);

  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const methods = [
    { id: 'qris', title: 'QRIS', icon: CreditCard, subtitle: 'Bayar dengan aplikasi apa saja' },
    { id: 'wallet', title: 'GemaPay', icon: Wallet, subtitle: `Saldo: Rp ${(wallet?.balance || 0).toLocaleString('id-ID')}` },
    { id: 'va_bca', title: 'BCA Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
    { id: 'va_mandiri', title: 'Mandiri Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
    { id: 'transfer', title: 'Transfer Bank', icon: Building2, subtitle: 'Manual 1-2 hari kerja' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/booking?serviceId=${order.service_id}&vendorId=${order.vendor_id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Pilih Pembayaran</span>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-emerald-100">
          <p className="text-sm text-gray-500 mb-1">{order.service_name}</p>
          <p className="text-xs text-gray-400 mb-3">{order.service_address}</p>
          <h2 className="text-4xl font-heading font-bold text-emerald-600">Rp {order.total_amount.toLocaleString('id-ID')}</h2>
          {order.platform_fee > 0 && (
            <p className="text-xs text-gray-400 mt-2">Termasuk biaya platform Rp {order.platform_fee.toLocaleString('id-ID')}</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 px-1">Metode Pembayaran</h3>
          
          <div className="space-y-3">
            {methods.map((method) => (
              <div 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === method.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
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
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  selectedMethod === method.id ? 'border-emerald-500' : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 scale-in-100" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          disabled={isCreatingInvoice}
          onClick={async () => {
            setIsCreatingInvoice(true);
            try {
              if (selectedMethod === 'wallet') {
                const supabase = createClient();
                const { error: payError } = await supabase
                  .from('orders')
                  .update({ payment_status: 'escrow' })
                  .eq('id', order.id);
                if (payError) throw payError;
                toast.success('Pembayaran berhasil!');
                router.push(`/customer/payment/success?order_id=${order.id}`);
                return;
              }
              const supabase = createClient();
              const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-invoice`;
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              if (!token) throw new Error('Sesi tidak ditemukan. Silakan login ulang.');
              const res = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ order_id: order.id }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Gagal membuat invoice');
              window.location.href = data.invoice_url;
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Gagal menghubungi payment gateway';
              toast.error(msg);
            } finally {
              setIsCreatingInvoice(false);
            }
          }}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-heading font-bold shadow-sm"
        >
          {isCreatingInvoice ? 'Memproses pembayaran...' : 'Konfirmasi Pembayaran'}
        </Button>
      </div>
    </div>
  );
}
