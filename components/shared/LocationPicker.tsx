'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const JAKARTA = { lat: -6.2088, lng: 106.8456 };

export default function LocationPicker({
  lat,
  lng,
  onChange,
  label = 'Lokasi Usaha',
  coverageRadius,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  coverageRadius?: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const center = lat && lng ? { lat, lng } : JAKARTA;
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      const L = await import('leaflet');

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current || !mounted) return;

      const map = L.map(mapRef.current).setView([center.lat, center.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || lat === null || lng === null) return;
    if (!coverageRadius || coverageRadius <= 0) {
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
      return;
    }
    const L = (window as any).L;
    if (!L) return;
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(coverageRadius * 1000);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: coverageRadius * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(mapInstanceRef.current);
    }
  }, [mapReady, lat, lng, coverageRadius]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        setLoadingGeo(false);
      },
      () => {
        setLoadingGeo(false);
        toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  const moveToCoords = (newLat: number, newLng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-emerald-600" />
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
      )}

      <div ref={mapRef} className="w-full h-56 rounded-xl overflow-hidden shadow-sm border" />

      {mapReady && (
        <>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeolocate}
              disabled={loadingGeo}
              className="flex-1 rounded-xl h-10 gap-2 text-xs"
            >
              {loadingGeo ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Crosshair size={14} />
              )}
              Gunakan Lokasi Saya
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Latitude:</span>{' '}
              {lat?.toFixed(6) || '-'}
            </p>
            <p>
              <span className="font-medium text-gray-700">Longitude:</span>{' '}
              {lng?.toFixed(6) || '-'}
            </p>
            <p className="text-gray-400 mt-1">
              Seret pin atau tap peta untuk memilih lokasi
            </p>
          </div>
        </>
      )}
    </div>
  );
}
