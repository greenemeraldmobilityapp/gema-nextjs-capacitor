'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, TrendingUp, CheckCircle, Clock, Loader2, AlertCircle, Activity, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { useVendorOrders } from '@/lib/services/useOrders';
import { useWallet } from '@/lib/services/useWallet';
import { toast } from 'sonner';

export default function VendorDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { data: orders, isLoading, error } = useVendorOrders(profile?.id);
  const { data: wallet } = useWallet(profile?.id);
  const { data: vendor } = useVendor(profile?.id);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => { setAvatarError(false); }, [vendor?.avatar_url]);

  const completedOrders = (orders || []).filter(o => o.order_status === 'completed');
  const pendingOrders = (orders || []).filter(o => o.order_status === 'pending');
  const inProgressOrders = (orders || []).filter(o => o.order_status === 'in_progress');
  const completedJobs = completedOrders.length;

  const now = new Date();
  const thisMonthOrders = completedOrders.filter(o => {
    const d = o.completed_at ? new Date(o.completed_at) : new Date(o.scheduled_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyEarnings = thisMonthOrders.reduce((sum, o) => sum + o.vendor_payout, 0);

  useEffect(() => {
    if (error) toast.error('Gagal memuat data dashboard');
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-stone-100 via-stone-50/60 to-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-stone-100 via-stone-50/60 to-stone-50 pb-8">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 pt-10 pb-14 rounded-b-[24px] shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link href="/vendor/profile" className="shrink-0 group/avatar">
              {vendor?.avatar_url && !avatarError ? (
                <img
                  src={vendor.avatar_url}
                  alt="Avatar"
                  onError={() => setAvatarError(true)}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white/40 shadow-lg transition-all duration-300 group-hover/avatar:ring-4 group-hover/avatar:ring-white/60"
                />
              ) : (
                <div className="w-11 h-11 rounded-full ring-2 ring-white/40 shadow-lg flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 transition-all duration-300 group-hover/avatar:ring-4 group-hover/avatar:ring-white/60">
                  <User size={18} className="text-white" />
                </div>
              )}
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white drop-shadow-sm">Hello, {profile?.full_name?.split(' ')[0] || 'Vendor'}!</h1>
              <p className="text-emerald-100/80 text-sm">{vendor?.specialization || 'Ringkasan hari ini'}</p>
            </div>
          </div>
          <Link href="/vendor/orders" className="relative group/bell">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 group-hover/bell:bg-white/30 group-hover/bell:scale-110">
              <Bell size={20} className="text-white" />
            </div>
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                {pendingOrders.length > 9 ? '9+' : pendingOrders.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data dashboard</span>
          </div>
        )}

        <div className="rounded-3xl shadow-elegant overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 75% 30%, white 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-white/80 text-sm font-semibold">Pendapatan Bulan Ini</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold font-heading text-white drop-shadow-sm">Rp {monthlyEarnings.toLocaleString()}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <p className="text-emerald-200/80 text-xs">Saldo GemaPay: Rp {(wallet?.balance || 0).toLocaleString()}</p>
                </div>
              </div>
              <Link
                href="/wallet/withdraw"
                className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-lg shadow-emerald-900/20 backdrop-blur-sm"
              >
                Tarik Saldo
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 sm:row-span-2 rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-200/10 to-transparent pointer-events-none" />
            <div className="relative p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-200/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock size={22} className="text-white" />
                </div>
                {pendingOrders.length > 0 && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-200/60 rounded-full px-3 py-1 backdrop-blur-sm">
                    {pendingOrders.length > 1 ? `${pendingOrders.length} pesanan` : '1 pesanan'}
                  </span>
                )}
              </div>
              <div className="mt-auto">
                <div className="text-4xl font-bold font-heading text-amber-900 drop-shadow-sm">{pendingOrders.length}</div>
                <p className="text-amber-700 text-sm font-bold mt-1">Pesanan Baru</p>
                <p className="text-amber-500 text-xs mt-0.5">Menunggu konfirmasi Anda</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200/40 relative overflow-hidden group">
            <div className="relative p-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-200/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div className="text-2xl font-bold font-heading text-emerald-900">{completedJobs}</div>
              <p className="text-emerald-700 text-xs font-bold mt-0.5">Pesanan Selesai</p>
            </div>
          </div>

          <div className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-gradient-to-br from-stone-50 to-stone-100/60 border border-stone-200/50 relative overflow-hidden group">
            <div className="relative p-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 to-stone-500 shadow-lg shadow-stone-200/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Activity size={20} className="text-white" />
              </div>
              <div className="text-2xl font-bold font-heading text-stone-800">{inProgressOrders.length}</div>
              <p className="text-stone-500 text-xs font-bold mt-0.5">Sedang Berjalan</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

        {pendingOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-stone-800">Permintaan Baru</h2>
              <Link href="/vendor/orders" className="text-sm font-semibold text-emerald-600 bg-emerald-50/80 backdrop-blur-sm rounded-full px-4 py-1.5 hover:bg-emerald-100 transition-colors">
                Lihat semua
              </Link>
            </div>
            {pendingOrders.slice(0, 5).map(order => (
              <Link key={order.id} href={`/vendor/orders/detail?id=${order.id}`}>
                <div className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer mb-3 bg-gradient-to-r from-amber-50/60 via-white to-white border border-amber-100/40 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-xl" />
                  <div className="p-4 pl-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors duration-200">{order.service_name}</h3>
                        <p className="text-xs text-stone-400 mt-0.5">{order.service_address}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-bold text-emerald-600">Rp {order.vendor_payout.toLocaleString()}</span>
                        <p className="text-[10px] text-stone-400">Pendapatan Anda</p>
                      </div>
                    </div>
                    <Button variant="premium" size="lg" className="w-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow duration-200">
                      Terima Pesanan
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pendingOrders.length === 0 && inProgressOrders.length === 0 && completedJobs === 0 && (
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-gradient-to-br from-stone-50 to-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center mx-auto mb-4">
                <Activity size={28} className="text-stone-400" />
              </div>
              <h3 className="font-bold text-stone-700">Selamat datang di GEMA!</h3>
              <p className="text-sm text-stone-400 mt-1">Pesanan pertama Anda akan muncul di sini</p>
              <Link
                href="/vendor/profile/edit"
                className="mt-4 inline-flex items-center justify-center h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                Lengkapi Profil
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
