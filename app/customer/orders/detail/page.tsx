'use client';

import { ArrowLeft, MessageSquare, MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [distance, setDistance] = useState(1.2);
  const [milestones, setMilestones] = useState([
    { label: 'Pesanan Dibuat', time: '13:00', completed: true },
    { label: 'Tukang Ditemukan', time: '13:15', completed: true },
    { label: 'Tukang Menuju Lokasi', time: '13:30', completed: true },
    { label: 'Pekerjaan Dimulai', time: '--:--', completed: false },
    { label: 'Selesai', time: '--:--', completed: false },
  ]);

  useEffect(() => {
    // Simulate real-time tracking update
    const interval = setInterval(() => {
      setDistance((prev) => {
        const newDist = prev - 0.1;
        if (newDist <= 0) {
          clearInterval(interval);
          setMilestones((prevMilestones) => 
            prevMilestones.map((m, i) => 
              i === 3 ? { ...m, completed: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
            )
          );
          return 0;
        }
        return newDist;
      });
    }, 3000); // update every 3 seconds for demo purposes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Link href="/customer/orders">
          <ArrowLeft size={24} className="text-emerald-50" />
        </Link>
        <h1 className="text-lg font-bold">Detail Pesanan</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Map Mockup */}
        <div className="w-full h-48 bg-emerald-100 rounded-2xl border-2 border-white shadow-sm overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 pointer-events-none" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23059669\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} 
          />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-emerald-800 bg-white px-3 py-1 rounded-full shadow-md mb-2 flex items-center gap-1">
              <Navigation size={14} className="text-emerald-600" />
              {distance > 0 ? `Menuju Lokasi (${distance.toFixed(1)} km)` : 'Tukang Sudah Tiba'}
            </span>
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-emerald-200 rounded-full flex items-center justify-center">
                <MapPin size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Profile */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl text-gray-500">
              BT
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">Budi Teknik</h3>
              <p className="text-sm text-gray-500">Teknisi Listrik & AC</p>
            </div>
            <Link href={`/customer/chat?id=${searchParams.get('id') || 'order-123'}`}>
              <Button size="icon" className="rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-600 shadow-none">
                <MessageSquare size={20} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Status Tracking */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-6">Status Pesanan</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white ${milestone.completed ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-300'} z-10 shrink-0`}>
                    {milestone.completed && <CheckCircle2 size={16} />}
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] px-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${milestone.completed ? 'text-gray-900' : 'text-gray-400'}`}>{milestone.label}</span>
                      <span className={`text-xs ${milestone.completed ? 'text-emerald-600' : 'text-gray-400'} flex items-center gap-1 mt-0.5`}>
                        <Clock size={12} /> {milestone.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button className="w-full h-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 shadow-none border border-red-200 font-semibold mt-4">
          Batalkan Pesanan
        </Button>
      </div>
    </div>
  );
}
