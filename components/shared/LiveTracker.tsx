'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth';

type Location = { lat: number; lng: number };

export function VendorLocationSharer({ orderId }: { orderId: string }) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung');
      return;
    }
    setError(null);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        localStorage.setItem(`location_${orderId}`, JSON.stringify({ lat: latitude, lng: longitude }));
      },
      (err) => {
        setError('Gagal mendapat lokasi: ' + err.message);
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button
        onClick={sharing ? stopSharing : startSharing}
        variant={sharing ? "destructive" : "default"}
        className={`w-full h-12 rounded-xl gap-2 ${sharing ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        <Navigation size={18} className={sharing ? 'animate-pulse' : ''} />
        {sharing ? 'Berhenti Bagikan Lokasi' : 'Bagikan Lokasi Saya'}
      </Button>
    </div>
  );
}

export function CustomerLocationViewer({ orderId }: { orderId: string }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = () => {
      const stored = localStorage.getItem(`location_${orderId}`);
      if (stored) {
        try { setLocation(JSON.parse(stored)); } catch {}
      }
      setLoading(false);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <Skeleton className="h-24 w-full rounded-xl" />;
  if (!location) return null;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MapPin size={16} className="text-emerald-600" />
        Lokasi Vendor
      </div>
      <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
        <Navigation size={20} className="text-emerald-600 shrink-0" />
        <div>
          <p className="text-xs text-gray-500">Terakhir diperbarui</p>
          <p className="text-sm font-medium">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}
