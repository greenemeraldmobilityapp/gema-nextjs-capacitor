import type { Order } from '@/lib/services/useOrders';

export interface InvoiceData {
  invoiceNumber: string
  date: string
  vendorName: string
  vendorAddress: string
  customerName: string
  customerAddress: string
  serviceName: string
  serviceCategory: string
  baseAmount: number
  platformFee: number
  totalAmount: number
  vendorPayout: number
  paymentStatus: string
  orderStatus: string
}

interface VendorInfo {
  full_name?: string
  address_full?: string
}

interface CustomerInfo {
  full_name?: string
  address_full?: string
}

export function formatInvoiceData(order: Order, vendor: VendorInfo | null, customer: CustomerInfo | null): InvoiceData {
  return {
    invoiceNumber: order.invoice_number || '',
    date: new Date(order.created_at).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    vendorName: vendor?.full_name || '-',
    vendorAddress: vendor?.address_full || '-',
    customerName: customer?.full_name || '-',
    customerAddress: customer?.address_full || '-',
    serviceName: order.service_name,
    serviceCategory: order.service_category,
    baseAmount: order.base_amount,
    platformFee: order.platform_fee,
    totalAmount: order.total_amount,
    vendorPayout: order.vendor_payout,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
  }
}

export function generateInvoiceNumber(orderId: string, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `INV/${year}/${month}/${shortId}`
}
