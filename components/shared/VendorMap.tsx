'use client';

import { useEffect, useRef } from 'react';
import type { VendorProfile } from '@/lib/services/useVendors';

import 'leaflet/dist/leaflet.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.fullscreen/dist/Control.FullScreen.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
          const name = v.users?.full_name || 'Vendor';
          const spec = v.specialization || '';

          const icon = L.divIcon({
            className: '',
            html: `
              <div class="vendor-pin">
                <div class="vendor-pin-card">
                  <div class="vendor-pin-name">${escapeHtml(name)}</div>
                  ${spec ? `<div class="vendor-pin-spec">${escapeHtml(spec)}</div>` : ''}
                </div>
                <div class="vendor-pin-tail"></div>
                <div class="vendor-pin-dot"></div>
              </div>
            `,
            iconSize: [160, 62],
            iconAnchor: [80, 62],
          });

          const marker = L.marker([v.users.lat, v.users.lng], { icon });
          marker.bindPopup(`<strong>${escapeHtml(name)}</strong>${spec ? `<br/><span style="color:#6b7280;font-size:12px">${escapeHtml(spec)}</span>` : ''}`);
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

  return (
    <>
      <style>{`
        .vendor-pin {
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18));
          pointer-events: none;
        }
        .vendor-pin-card {
          background: white;
          border-radius: 8px;
          padding: 5px 10px;
          max-width: 150px;
          border: 1px solid #e5e7eb;
          pointer-events: auto;
          cursor: pointer;
        }
        .vendor-pin-card:hover {
          border-color: #10b981;
        }
        .vendor-pin-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
        }
        .vendor-pin-spec {
          font-size: 10px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
          margin-top: 1px;
        }
        .vendor-pin-tail {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
          pointer-events: none;
        }
        .vendor-pin-dot {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #059669, #047857);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          pointer-events: none;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-80 rounded-2xl overflow-hidden shadow-sm" />
    </>
  );
}
