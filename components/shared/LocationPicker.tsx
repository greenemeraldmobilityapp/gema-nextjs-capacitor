'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JAKARTA = { lat: -6.2088, lng: 106.8456 };

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const center = lat && lng ? { lat, lng } : JAKARTA;

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
        onChange(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
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
  }, []);

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
      () => setLoadingGeo(false),
      { timeout: 10000, enableHighAccuracy: true }
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
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-emerald-600" />
        <span className="text-sm font-semibold text-gray-700">Lokasi Usaha</span>
      </div>

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
