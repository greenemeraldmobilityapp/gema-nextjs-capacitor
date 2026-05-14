'use client';

import Link from 'next/link';
import { Bell, TrendingUp, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendorOrders } from '@/lib/services/useOrders';
import { useWallet } from '@/lib/services/useWallet';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-stone-50 pb-8">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 pt-10 pb-14 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between mb-2">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Hello, {profile?.full_name?.split(' ')[0] || 'Vendor'}!</h1>
            <p className="text-emerald-100 text-sm">Ringkasan hari ini</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                {pendingOrders.length > 9 ? '9+' : pendingOrders.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data dashboard</span>
          </div>
        )}

        <Card className={cn(
          "rounded-3xl shadow-elegant overflow-hidden",
          monthlyEarnings > 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-white/90 backdrop-blur-sm"
        )}>
          <CardHeader className={cn(
            "pb-2",
            monthlyEarnings > 0 ? "bg-gradient-to-r from-white/10 to-transparent" : "bg-gradient-to-br from-stone-50 to-white"
          )}>
            <CardTitle className={cn(
              "text-sm font-semibold flex items-center gap-2",
              monthlyEarnings > 0 ? "text-white/90" : "text-stone-600"
            )}>
              <TrendingUp size={16} />
              Pendapatan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            "pt-4 pb-6",
            monthlyEarnings > 0 ? "bg-gradient-to-r from-white/10 to-transparent text-white" : "bg-gradient-to-br from-stone-50 to-white"
          )}>
            <div className="text-3xl font-bold font-heading">Rp {monthlyEarnings.toLocaleString()}</div>
            <p className={cn(
              "text-xs font-semibold mt-1",
              monthlyEarnings > 0 ? "text-emerald-100" : "text-stone-500"
            )}>
              Saldo: Rp {(wallet?.balance || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm flex items-center justify-center mb-3">
                <Clock size={22} className="text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-stone-800">{pendingOrders.length}</div>
              <p className="text-xs text-stone-500 font-medium">Pesanan Baru</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center mb-3">
                <CheckCircle size={22} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-stone-800">{completedJobs}</div>
              <p className="text-xs text-stone-500 font-medium">Pesanan Selesai</p>
            </CardContent>
          </Card>
        </div>

        {pendingOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-stone-800">Permintaan Baru</h2>
              <Link href="/vendor/orders" className="text-sm font-semibold text-emerald-600 bg-emerald-50/80 backdrop-blur-sm rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
                Lihat semua
              </Link>
            </div>
            {pendingOrders.slice(0, 3).map(order => (
              <Link key={order.id} href={`/vendor/orders/detail?id=${order.id}`}>
                <Card className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer mb-3 bg-amber-50/30 border border-amber-100/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-stone-800">{order.service_name}</h3>
                        <p className="text-xs text-stone-400 mt-0.5">{order.service_address}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600">Rp {order.vendor_payout.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="pill" size="lg" className="w-full shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
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