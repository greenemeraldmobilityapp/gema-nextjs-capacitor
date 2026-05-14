'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">Memuat...</div>}>
      <FAQContent />
    </Suspense>
  );
}

function FAQContent() {
  const searchParams = useSearchParams();

  const question = "Bagaimana cara membatalkan pesanan?";
  const answer = "Pesanan dapat dibatalkan melalui halaman Detail Pesanan sebelum tukang mulai perjalanan ke lokasi Anda. Jika tukang sudah dalam perjalanan, pembatalan mungkin akan dikenakan biaya kompensasi.";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/help" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg leading-tight">Detail Bantuan</span>
      </div>

      <div className="p-4 space-y-4">
        <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">Pesanan</span>

        <h1 className="text-xl font-heading font-bold text-gray-900">{question}</h1>

        <div className="text-sm text-gray-600 leading-relaxed space-y-4">
          <p>{answer}</p>

          <div className="bg-emerald-50 rounded-xl p-4 flex gap-3">
            <Lightbulb size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Tips</p>
              <p className="text-xs text-emerald-700 mt-1">Pastikan Anda telah membaca syarat & ketentuan pembatalan sebelum melanjutkan.</p>
            </div>
          </div>

          <p className="font-semibold text-gray-900">Langkah-langkah:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Buka menu <strong>Pesanan Saya</strong></li>
            <li>Pilih pesanan yang sedang aktif</li>
            <li>Scroll ke paling bawah dan klik tombol <strong>Batalkan Pesanan</strong></li>
            <li>Pilih alasan pembatalan dan konfirmasi</li>
          </ol>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-6">
          <p className="text-sm text-gray-500 mb-3 text-center">Apakah artikel ini membantu?</p>
          <div className="flex justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              <ThumbsUp size={16} />
              Ya
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
              <ThumbsDown size={16} />
              Tidak
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-white border-t">
        <p className="text-xs text-gray-400 text-center mb-3">Masih butuh bantuan?</p>
        <Button variant="pill" size="lg" className="w-full shadow-sm">
          Hubungi Customer Service
        </Button>
      </div>
    </div>
  );
}
