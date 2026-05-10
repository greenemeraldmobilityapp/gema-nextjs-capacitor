'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="bg-emerald-600 p-4 pt-8 text-white rounded-b-[24px] shadow-sm">
        <h1 className="text-xl font-bold">Pesanan Saya</h1>
      </div>

      <div className="p-4 -mt-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm rounded-xl mb-4 p-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Aktif</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Riwayat</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            
            <Link href="/customer/orders/detail?id=order-123" className="block">
              <Card className="rounded-xl border-emerald-100 shadow-sm hover:border-emerald-500 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">Perbaikan AC Bocor</h3>
                      <p className="text-sm text-gray-500">Budi Teknik</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Menunggu Tukang</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-4 gap-2">
                    <Clock size={14} />
                    <span>Hri ini, 14:00</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            
            <Card className="rounded-xl border-gray-100 shadow-sm opacity-70">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">Pemasangan Lampu LED</h3>
                    <p className="text-sm text-gray-500">Jaya Elektrik</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Selesai
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    <Clock size={14} />
                    <span>2 Hari yang lalu</span>
                  </div>
                  <span className="font-bold text-gray-900">Rp 150.000</span>
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
