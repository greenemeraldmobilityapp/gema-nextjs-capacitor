'use client';

import Link from 'next/link';
import { Bell, TrendingUp, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';
import { useWallet } from '@/lib/services/useWallet';

export default function VendorDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading, error } = useVendorOrders(profile?.id);
  const { data: wallet } = useWallet(profile?.id);

  const completedOrders = (orders || []).filter(o => o.order_status === 'completed');
  const pendingOrders = (orders || []).filter(o => o.order_status === 'pending');
  const inProgressOrders = (orders || []).filter(o => o.order_status === 'in_progress');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.vendor_payout, 0);
  const completedJobs = completedOrders.length;

  const now = new Date();
  const thisMonthOrders = completedOrders.filter(o => {
    const d = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyEarnings = thisMonthOrders.reduce((sum, o) => sum + o.vendor_payout, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 pb-8">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-12 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">Hello, {profile?.full_name?.split(' ')[0] || 'Vendor'}!</h1>
            <p className="text-emerald-100 text-sm">Ringkasan hari ini</p>
          </div>
          <div className="relative">
            <Bell size={24} className="text-emerald-50" />
            {pendingOrders.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-600" />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data dashboard</span>
          </div>
        )}

        <Card className="rounded-2xl border-none shadow-md overflow-hidden">
          <CardHeader className="bg-emerald-50 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <TrendingUp size={16} />
              Pendapatan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white pt-4 pb-6">
            <div className="text-3xl font-bold text-gray-900">Rp {monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              Saldo: Rp {(wallet?.balance || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <Clock size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{pendingOrders.length}</div>
              <p className="text-xs text-gray-500 font-medium">Pesanan Baru</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{completedJobs}</div>
              <p className="text-xs text-gray-500 font-medium">Pesanan Selesai</p>
            </CardContent>
          </Card>
        </div>

        {pendingOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Permintaan Baru</h2>
              <Link href="/vendor/orders" className="text-sm text-emerald-600 font-medium">
                Lihat semua
              </Link>
            </div>
            {pendingOrders.slice(0, 3).map(order => (
              <Link key={order.id} href={`/vendor/orders/detail?id=${order.id}`}>
                <Card className="rounded-xl border-orange-100 bg-orange-50/50 shadow-sm mb-3">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{order.service_name}</h3>
                        <p className="text-sm text-gray-600">{order.service_address}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">Rp {order.vendor_payout.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      Terima
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
