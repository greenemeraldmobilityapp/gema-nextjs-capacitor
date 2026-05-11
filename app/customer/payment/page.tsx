'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, CreditCard, Landmark, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useOrder, useUpdateOrderStatus } from '@/lib/services/useOrders';
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
  const { data: order, isLoading, error } = useOrder(orderId);
  const updatePayment = useUpdateOrderStatus();

  const [selectedMethod, setSelectedMethod] = useState<string>('qris');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const methods = [
    { id: 'qris', title: 'QRIS', icon: CreditCard, subtitle: 'Bayar dengan aplikasi apa saja' },
    { id: 'wallet', title: 'GemaPay Wallet', icon: Wallet, subtitle: 'Saldo: Rp 200.000' },
    { id: 'va_bca', title: 'BCA Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
    { id: 'va_mandiri', title: 'Mandiri Virtual Account', icon: Landmark, subtitle: 'Otomatis terkonfirmasi' },
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/booking?service_id=${order.service_id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Pilih Pembayaran</span>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-emerald-100">
          <p className="text-sm text-gray-500 mb-1">{order.service_name}</p>
          <p className="text-xs text-gray-400 mb-3">{order.service_address}</p>
          <h2 className="text-3xl font-bold text-emerald-600">Rp {order.total_amount.toLocaleString()}</h2>
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
        <Button
          disabled={updatePayment.isPending || isCreatingInvoice}
          onClick={async () => {
            setIsCreatingInvoice(true);
            try {
              const supabase = createClient();
              const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-invoice`;
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ order_id: order.id }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Gagal membuat invoice');
              window.location.href = data.invoice_url;
            } catch (err: any) {
              toast.error(err.message || 'Gagal menghubungi payment gateway');
              updatePayment.mutate(
                { orderId: order.id, payment_status: 'escrow' },
                {
                  onSuccess: () => {
                    toast.success('Pembayaran berhasil');
                    router.push(`/customer/payment/success?order_id=${order.id}`);
                  },
                  onError: (e: any) => {
                    toast.error(e.message || 'Gagal memproses pembayaran');
                  },
                }
              );
            } finally {
              setIsCreatingInvoice(false);
            }
          }}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm"
        >
          {isCreatingInvoice ? 'Mengarahkan ke pembayaran...' : updatePayment.isPending ? 'Memproses...' : 'Bayar Sekarang'}
        </Button>
      </div>
    </div>
  );
}
