'use client';

import { useEffect, useRef } from 'react';
import type { VendorProfile } from '@/lib/services/useVendors';

export default function VendorMap({
  vendors,
  centerOn,
  onVendorClick,
}: {
  vendors: VendorProfile[];
  centerOn?: { lat: number; lng: number };
  onVendorClick?: (vendorId: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

      const defaultCenter = { lat: -6.2088, lng: 106.8456 };
      const center = centerOn || defaultCenter;

      const map = L.map(mapRef.current).setView([center.lat, center.lng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      vendors.forEach((v) => {
        if (v.users?.lat && v.users?.lng) {
          const marker = L.marker([v.users.lat, v.users.lng])
            .addTo(map)
            .bindPopup(v.users.full_name || 'Vendor');

          marker.on('click', () => {
            if (onVendorClick) {
              onVendorClick(v.user_id);
            }
          });
        }
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vendors, centerOn, onVendorClick]);

  return <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden shadow-sm" />;
}
