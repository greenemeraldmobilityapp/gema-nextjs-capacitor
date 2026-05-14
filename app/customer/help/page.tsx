'use client';

import Link from 'next/link';
import { ArrowLeft, MessageCircle, FileText, ChevronRight, HelpCircle, Search, LifeBuoy, ShieldCheck, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  { icon: FileText, label: 'Pesanan', href: '#' },
  { icon: CreditCard, label: 'Pembayaran', href: '#' },
  { icon: ShieldCheck, label: 'Akun', href: '#' },
  { icon: LifeBuoy, label: 'Lainnya', href: '#' },
];

const faqs = [
  { id: 1, question: 'Bagaimana cara membatalkan pesanan?' },
  { id: 2, question: 'Apakah ada garansi layanan?' },
  { id: 3, question: 'Bagaimana cara refund dana GemaPay?' },
  { id: 4, question: 'Tukang belum datang sesuai waktu' },
];

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors mb-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-heading font-bold mb-1">Hai, ada yang bisa kami bantu?</h1>
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari artikel bantuan..."
            className="w-full pl-10 pr-4 h-12 bg-white/20 text-white placeholder:text-white/50 rounded-xl border border-white/20 outline-none focus:bg-white/30 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3 px-1">Pertanyaan Umum</h2>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-100">
              {faqs.map((faq) => (
                <Link key={faq.id} href={`/customer/help/faq?id=${faq.id}`} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{faq.question}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                <MessageCircle size={24} />
              </div>
              <div className="text-white">
                <h3 className="font-bold">Chat dengan CS</h3>
                <p className="text-emerald-100 text-xs">Waktu respons ~ 5 menit</p>
              </div>
            </div>
            <button className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 transition-colors shrink-0">
              Chat
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
