'use client';

import { useEffect, useRef } from 'react';
import type { VendorProfile } from '@/lib/services/useVendors';

import 'leaflet/dist/leaflet.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.fullscreen/dist/Control.FullScreen.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

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
      const leaflet = await import('leaflet');
      const L = (leaflet as any).default || leaflet;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current || !mounted) return;

      (window as any).L = L;

      await import('leaflet-gesture-handling');

      const defaultCenter = { lat: -6.2088, lng: 106.8456 };
      const center = centerOn || defaultCenter;

      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 12,
        gestureHandling: true,
        gestureHandlingOptions: { duration: 500 },
      } as L.MapOptions & { gestureHandling?: boolean; gestureHandlingOptions?: { duration?: number } });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const { LocateControl } = await import('leaflet.locatecontrol');
      new LocateControl({
        setView: 'untilPanOrZoom',
        drawCircle: true,
        drawMarker: true,
        flyTo: true,
        showCompass: true,
        locateOptions: { enableHighAccuracy: true, timeout: 10000 },
      }).addTo(map);

      await import('leaflet.markercluster');
      const mcg = (L as any).markerClusterGroup({ maxClusterRadius: 60 });

      const { default: FullScreen } = await import('leaflet.fullscreen');
      new FullScreen({ position: 'topright' }).addTo(map);

      vendors.forEach((v) => {
        if (v.users?.lat && v.users?.lng) {
          const marker = L.marker([v.users.lat, v.users.lng]);
          marker.bindPopup(v.users.full_name || 'Vendor');
          marker.on('click', () => {
            if (onVendorClick) onVendorClick(v.user_id);
          });
          mcg.addLayer(marker);
        }
      });

      map.addLayer(mcg);

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

  return <div ref={mapRef} className="w-full h-80 rounded-2xl overflow-hidden shadow-sm" />;
}
