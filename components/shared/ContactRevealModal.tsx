'use client'

import { AlertTriangle, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactRevealModalProps {
  open: boolean
  patterns: { type: string; value: string }[]
  onConfirm: () => void
  onCancel: () => void
}

export function ContactRevealModal({ open, patterns, onConfirm, onCancel }: ContactRevealModalProps) {
  if (!open) return null

  const typeLabels: Record<string, string> = {
    phone: 'nomor telepon',
    email: 'alamat email',
    instagram: 'username Instagram',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-20">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-center mb-2">Perhatian!</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Pesan ini mengandung {patterns.map(p => typeLabels[p.type]).join(', ')}.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Transaksi di luar GEMA <strong>tidak dilindungi escrow</strong>.
              Dana Anda bisa hilang tanpa proteksi.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
            Kembali
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-12 bg-amber-600 hover:bg-amber-700">
            <Eye className="w-4 h-4 mr-2" />
            Tetap Tampilkan
          </Button>
        </div>
      </div>
    </div>
  )
}
