'use client';

import Link from 'next/link';
import { ArrowLeft, MessageCircle, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HelpCenterPage() {
  const faqs = [
    { id: 1, question: 'Bagaimana cara membatalkan pesanan?' },
    { id: 2, question: 'Apakah ada garansi layanan?' },
    { id: 3, question: 'Bagaimana cara refund dana GemaPay?' },
    { id: 4, question: 'Tukang belum datang sesuai waktu' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-bold text-lg">Pusat Bantuan</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Support */}
        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-emerald-50 border border-emerald-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">Chat dengan CS</h3>
                <p className="text-xs text-emerald-700">Waktu respons ~ 5 menit</p>
              </div>
            </div>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
              Chat
            </button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3 px-1">Pertanyaan Umum (FAQ)</h2>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-100">
              {faqs.map((faq) => (
                <Link key={faq.id} href={`/customer/help/faq?id=${faq.id}`} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{faq.question}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
