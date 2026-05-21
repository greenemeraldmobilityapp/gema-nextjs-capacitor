'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useOrder } from '@/lib/services/useOrders'
import { useVendor } from '@/lib/services/useVendors'
import { formatInvoiceData } from '@/lib/utils/invoice'
import { Printer, Loader2, ArrowLeft } from 'lucide-react'

function InvoiceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const { data: order } = useOrder(orderId || undefined)
  const { data: vendor } = useVendor(order?.vendor_id)

  if (!order || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const invoice = formatInvoiceData(
    order,
    { full_name: vendor.users?.full_name || '', address_full: vendor.users?.address_full || '' },
    { full_name: order.customer?.full_name || '', address_full: order.customer?.address_full || '' }
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Simpan PDF
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-4 min-h-[297mm] shadow-sm print:shadow-none">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-600">GEMA</h2>
            <p className="text-sm text-gray-500">Invoice / Faktur</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono text-gray-600">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{invoice.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Dari (Vendor)</p>
            <p className="font-medium">{invoice.vendorName}</p>
            <p className="text-sm text-gray-600">{invoice.vendorAddress}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Kepada (Customer)</p>
            <p className="font-medium">{invoice.customerName}</p>
            <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm text-gray-500">Jasa</th>
              <th className="text-right py-2 text-sm text-gray-500">Kategori</th>
              <th className="text-right py-2 text-sm text-gray-500">Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3">{invoice.serviceName}</td>
              <td className="py-3 text-right text-sm text-gray-600">{invoice.serviceCategory}</td>
              <td className="py-3 text-right font-mono">
                Rp {invoice.baseAmount.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="py-2 text-sm text-gray-500">Biaya Platform (5%)</td>
              <td className="py-2 text-right font-mono">
                Rp {invoice.platformFee.toLocaleString('id-ID')}
              </td>
            </tr>
            <tr className="font-bold">
              <td colSpan={2} className="py-2">Total Pembayaran</td>
              <td className="py-2 text-right font-mono text-emerald-600">
                Rp {invoice.totalAmount.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
          invoice.paymentStatus === 'released'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {invoice.paymentStatus === 'released' ? 'Lunas' : 'Dalam Escrow'}
        </div>

        <div className="mt-16 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          <p>Invoice ini sah dan diproses oleh GEMA.</p>
          <p>Terima kasih telah menggunakan GEMA.</p>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  )
}
