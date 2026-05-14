'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Loader2, CalendarDays, Clock, Wallet, Building2 } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'gemapay' | 'transfer'>('gemapay');

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
        <span className="font-heading font-bold text-lg">Detail Pesanan</span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
          </div>
        ) : service ? (
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                  {vendor?.full_name?.charAt(0) || 'V'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{service.title}</h3>
                  <p className="text-sm text-gray-500">{vendor?.full_name || 'Vendor'} • {service.category || 'General'}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 mb-4"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Biaya Layanan</span>
                <span className="font-semibold text-gray-900">Rp {service.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Biaya Platform (5%)</span>
                <span className="font-semibold text-gray-900">Rp {platformFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-2 bg-emerald-50 -mx-4 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-emerald-700">Promo</span>
                <span className="font-semibold text-emerald-600">-Rp 0</span>
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
                  <p className="font-bold text-gray-900 text-sm">Alamat Anda</p>
                  <p className="text-sm text-gray-500 leading-snug mt-1">Atur alamat di halaman profil</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 px-1">Tanggal</label>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                  <CalendarDays size={20} className="text-emerald-500 shrink-0" />
                  <div className="flex-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full text-sm text-gray-900 outline-none bg-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">{formatDateLabel(selectedDate)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 px-1">Waktu</label>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                  <Clock size={20} className="text-emerald-500 shrink-0" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full text-sm text-gray-900 outline-none bg-transparent"
                  >
                    <option value="">Pilih jam</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 px-1">Slot Waktu Tersedia</label>
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 px-1">Metode Pembayaran</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gemapay')}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'gemapay'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Wallet size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">GEMA Pay</p>
                    <p className="text-xs text-gray-500">Saldo: Rp 250.000</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'gemapay' ? 'border-emerald-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'gemapay' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'transfer'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Transfer Bank</p>
                    <p className="text-xs text-gray-500">Manual 1-2 hari kerja</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'transfer' ? 'border-emerald-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pb-8">
              <label className="text-sm font-bold text-gray-900 px-1">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none h-24"
                placeholder="Tulis instruksi tambahan untuk vendor..."
              ></textarea>
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />
        <div className="p-4 bg-white border-t space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Pembayaran</p>
              <p className="font-heading text-lg font-bold text-emerald-600">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
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
                    service_address: 'Alamat Anda (Atur di profil)',
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
              variant="pill"
              size="lg"
              className="shadow-sm disabled:opacity-50"
            >
              {createOrder.isPending ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <BookingContent />
    </Suspense>
  );
}
