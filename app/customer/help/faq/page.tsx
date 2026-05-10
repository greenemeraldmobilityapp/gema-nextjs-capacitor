'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <FAQContent />
    </Suspense>
  );
}

function FAQContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Dummy logic, typically you would fetch FAQ by id
  const question = "Bagaimana cara membatalkan pesanan?";
  const answer = "Pesanan dapat dibatalkan melalui halaman Detail Pesanan sebelum tukang mulai perjalanan ke lokasi Anda. Jika tukang sudah dalam perjalanan, pembatalan mungkin akan dikenakan biaya kompensasi.";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/help" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg leading-tight">Detail Bantuan</span>
      </div>

      <div className="p-6 bg-white flex-1">
        <h1 className="text-xl font-bold text-gray-900 mb-4">{question}</h1>
        <div className="prose prose-sm text-gray-600">
          <p>{answer}</p>
          <br/>
          <p>Langkah-langkah:</p>
          <ol className="list-decimal pl-4 space-y-2 mt-2">
            <li>Buka menu Pesanan Saya</li>
            <li>Pilih pesanan yang sedang aktif</li>
            <li>Scroll ke paling bawah dan klik tombol Batalkan Pesanan</li>
            <li>Pilih alasan pembatalan dan konfirmasi</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
