'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Printer, Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useVendorOrders } from '@/lib/services/useOrders'

export default function EarningsReportPage() {
  const router = useRouter()
  const profile = useAuthStore((s) => s.profile)
  const { data: orders, isLoading } = useVendorOrders(profile?.id)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter(o => {
      if (!o.created_at) return false
      const d = new Date(o.created_at)
      return d.getFullYear() === year && (d.getMonth() + 1) === month
    })
  }, [orders, year, month])

  const completedOrders = filteredOrders.filter(o => o.order_status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0)
  const totalFee = completedOrders.reduce((sum, o) => sum + o.platform_fee, 0)
  const totalPayout = completedOrders.reduce((sum, o) => sum + o.vendor_payout, 0)

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const monthLabel = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b p-4 z-10 print:hidden">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={() => window.print()}
            className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto p-6 print:p-4">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={goPrev} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Laporan Bulanan
          </h1>
          <button onClick={goNext} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-gray-500 mb-6 print:mb-4">{monthLabel}</p>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold mb-4">Ringkasan</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Total Revenue</p>
              <p className="text-lg font-bold text-emerald-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Fee</p>
              <p className="text-lg font-bold text-red-500">Rp {totalFee.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Payout</p>
              <p className="text-lg font-bold">Rp {totalPayout.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Jumlah Pesanan Selesai</p>
            <p className="text-lg font-bold">{completedOrders.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Detail Transaksi</h2>
          {completedOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada transaksi selesai pada periode ini</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-400">Tanggal</th>
                    <th className="text-left py-2 text-xs text-gray-400">Jasa</th>
                    <th className="text-left py-2 text-xs text-gray-400">Customer</th>
                    <th className="text-right py-2 text-xs text-gray-400">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map(o => (
                    <tr key={o.id} className="border-b border-gray-50">
                      <td className="py-3 text-xs">
                        {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3">{o.service_name}</td>
                      <td className="py-3 text-xs text-gray-600">{o.customer?.full_name || '-'}</td>
                      <td className="py-3 text-right font-mono text-xs">
                        Rp {o.vendor_payout.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 print:block hidden">
          <p>Laporan pendapatan {monthLabel} — GEMA</p>
          <p>Dihasilkan secara otomatis.</p>
        </div>
      </div>
    </div>
  )
}
