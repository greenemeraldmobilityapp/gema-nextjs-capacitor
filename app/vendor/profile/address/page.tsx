'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Clock, Navigation, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useVendor } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), { ssr: false });

const supabase = createClient();

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function VendorAddressPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: vendor, isLoading } = useVendor(profile?.id);
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [address, setAddress] = useState('');
  const [coverageRadius, setCoverageRadius] = useState('5');
  const [operatingHours, setOperatingHours] = useState<Record<string, { open: string; close: string; active: boolean }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setLocation({ lat: vendor.users?.lat ?? null, lng: vendor.users?.lng ?? null });
    }
  }, [vendor]);

  useEffect(() => {
    const initial: Record<string, { open: string; close: string; active: boolean }> = {};
    DAYS.forEach(d => {
      initial[d] = { open: '08:00', close: '17:00', active: d !== 'Minggu' };
    });
    setOperatingHours(prev => Object.keys(prev).length ? prev : initial);
  }, []);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      if (location.lat !== null && location.lng !== null) {
        const { error: userError } = await supabase
          .from('users')
          .update({ lat: location.lat, lng: location.lng })
          .eq('id', profile.id);
        if (userError) throw userError;
      }
      toast.success('Alamat berhasil disimpan');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan alamat';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/vendor/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Alamat & Area Layanan</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white rounded-3xl p-5 shadow-sm border space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            <h2 className="font-bold text-gray-900">Alamat Utama</h2>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Alamat</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
            <LocationPicker
              lat={location.lat}
              lng={location.lng}
              onChange={(lat, lng) => setLocation({ lat, lng })}
            />
          </div>
          {location.lat !== null && location.lng !== null && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Navigation size={12} />
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" />
            <h2 className="font-bold text-gray-900">Jam Operasional</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map(day => {
              const oh = operatingHours[day] || { open: '08:00', close: '17:00', active: false };
              return (
                <div key={day} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-20 shrink-0">
                    <input
                      type="checkbox"
                      checked={oh.active}
                      onChange={() => setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], active: !prev[day]?.active },
                      }))}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={oh.open}
                      disabled={!oh.active}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], open: e.target.value },
                      }))}
                      className="h-9 rounded-lg border border-gray-200 px-2 text-sm bg-gray-50 disabled:opacity-30"
                    />
                    <span className="text-xs text-gray-400">s/d</span>
                    <input
                      type="time"
                      value={oh.close}
                      disabled={!oh.active}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], close: e.target.value },
                      }))}
                      className="h-9 rounded-lg border border-gray-200 px-2 text-sm bg-gray-50 disabled:opacity-30"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border space-y-4">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-emerald-600" />
            <h2 className="font-bold text-gray-900">Area Layanan</h2>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Radius (km)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={coverageRadius}
                onChange={(e) => setCoverageRadius(e.target.value)}
                className="flex-1 accent-emerald-600"
              />
              <span className="text-sm font-bold text-emerald-600 w-12 text-right">{coverageRadius} km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="pill"
          size="lg"
          className="w-full shadow-sm disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Alamat'}
        </Button>
      </div>
    </div>
  );
}
