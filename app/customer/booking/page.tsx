'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateOrder } from '@/lib/services/useOrders';
import { useAuthStore } from '@/store/auth';

const supabase = createClient();

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00',
];

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorId = searchParams.get('vendorId') || '';
  const serviceId = searchParams.get('serviceId') || '';
  const profile = useAuthStore((s) => s.profile);
  const createOrder = useCreateOrder();
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState('');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, vendor_profiles!inner(*)')
        .eq('id', serviceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  const { data: vendor } = useQuery({
    queryKey: ['vendor-name', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', vendorId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });

  const platformFee = service ? Math.round(service.price * 0.05) : 5000;
  const totalAmount = service ? service.price + platformFee : 155000;

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays < 7) return dayNames[d.getDay()];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href={`/customer/vendor?id=${vendorId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Detail Pesanan</span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
          </div>
        ) : service ? (
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-1">{service.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{vendor?.full_name || 'Vendor'}</p>
              
              <div className="w-full h-px bg-gray-100 mb-4"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Biaya Layanan</span>
                <span className="font-semibold text-gray-900">Rp {service.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Biaya Platform (5%)</span>
                <span className="font-semibold text-gray-900">Rp {platformFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full h-px bg-gray-100 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Pembayaran</span>
                <span className="font-bold text-emerald-600 text-lg">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Layanan tidak ditemukan</p>
          </div>
        )}

        {service && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 px-1">Lokasi Pengerjaan</label>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-3 items-start relative">
                <MapPin size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">Rumah</p>
                  <p className="text-sm text-gray-500 leading-snug mt-1">Jl. Sudirman No 123, Jakarta Selatan (Patokan depan minimarket)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 px-1">Tanggal</label>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm text-gray-900 outline-none bg-transparent"
                />
                <p className="text-xs text-gray-400 mt-2">{formatDateLabel(selectedDate)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 px-1">Waktu</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(selectedTime === slot ? '' : slot)}
                    className={cn(
                      'py-3 rounded-xl text-sm font-medium border-2 transition-all',
                      selectedTime === slot
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {!selectedTime && (
                <p className="text-xs text-gray-400 px-1">Pilih jam kedatangan</p>
              )}
            </div>

            <div className="space-y-2 pb-8">
              <label className="text-sm font-bold text-gray-900 px-1">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none h-24"
                placeholder="Tulis instruksi tambahan untuk vendor..."
              ></textarea>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t space-y-3 shrink-0">
        <Button
          disabled={!selectedTime || createOrder.isPending}
          onClick={async () => {
            if (!service || !profile) return;
            const platformFee = Math.round(service.price * 0.05);
            const totalAmount = service.price + platformFee;
            createOrder.mutate(
              {
                customer_id: profile.id,
                vendor_id: vendorId,
                service_id: service.id,
                service_category: service.category,
                service_name: service.title,
                scheduled_date: selectedDate,
                scheduled_time: selectedTime || null,
                service_address: 'Jl. Sudirman No 123, Jakarta Selatan (Patokan depan minimarket)',
                notes: notes || null,
                base_amount: service.price,
                platform_fee: platformFee,
                vendor_payout: service.price - platformFee,
                total_amount: totalAmount,
              },
              {
                onSuccess: (order) => {
                  toast.success('Pesanan berhasil dibuat');
                  router.push(`/customer/payment?order_id=${order.id}`);
                },
                onError: (err) => {
                  toast.error(err.message || 'Gagal membuat pesanan');
                },
              }
            );
          }}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm disabled:opacity-50"
        >
          {createOrder.isPending ? 'Memproses...' : 'Lanjut ke Pembayaran'}
        </Button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
