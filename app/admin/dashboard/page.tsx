'use client';

import { Loader2, Users, Store, ShoppingCart, TrendingUp, Scale, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminStats } from '@/lib/services/useAdmin';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total User', value: stats?.totalUsers ?? 0, color: 'bg-blue-100 text-blue-600', href: '/admin/vendors' },
    { icon: Store, label: 'Vendor', value: stats?.totalVendors ?? 0, color: 'bg-emerald-100 text-emerald-600', href: '/admin/vendors' },
    { icon: ShoppingCart, label: 'Pesanan', value: stats?.totalOrders ?? 0, color: 'bg-purple-100 text-purple-600', href: '/admin/orders' },
    { icon: TrendingUp, label: 'Pendapatan', value: `Rp${(stats?.totalRevenue ?? 0).toLocaleString()}`, color: 'bg-amber-100 text-amber-600', href: '/admin/orders' },
    { icon: Clock, label: 'Verifikasi Tertunda', value: stats?.pendingVerifications ?? 0, color: 'bg-orange-100 text-orange-600', href: '/admin/vendors' },
    { icon: Scale, label: 'Sengketa Aktif', value: stats?.openDisputes ?? 0, color: 'bg-red-100 text-red-600', href: '/admin/disputes' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 pb-8">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-12 rounded-b-[32px] shadow-sm">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-emerald-100 text-sm">Ringkasan platform</p>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data dashboard</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>
                      <card.icon size={20} />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{card.value}</div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {stats && stats.pendingTransactions > 0 && (
          <Link href="/admin/transactions">
            <Card className="rounded-2xl border-amber-100 bg-amber-50/50 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{stats.pendingTransactions} Transaksi Tertunda</p>
                    <p className="text-xs text-gray-500">Topup / withdraw menunggu persetujuan</p>
                  </div>
                </div>
                <span className="text-sm text-emerald-600 font-medium">Lihat</span>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
