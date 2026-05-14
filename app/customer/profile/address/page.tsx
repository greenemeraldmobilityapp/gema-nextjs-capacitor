'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';

export default function AddressPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAddress() {
      if (!profile?.id) return;
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('lat, lng')
        .eq('id', profile.id)
        .single();
      if (data) {
        if (data.lat) setLat(String(data.lat));
        if (data.lng) setLng(String(data.lng));
      }
      setLoading(false);
    }
    fetchAddress();
  }, [profile?.id]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolokasi tidak didukung perangkat');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        toast.success('Lokasi terdeteksi');
      },
      () => toast.error('Gagal mendapatkan lokasi'),
    );
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const updates: Record<string, any> = {};
      if (lat) updates.lat = parseFloat(lat);
      if (lng) updates.lng = parseFloat(lng);

      const { error } = await supabase.from('users').update(updates).eq('id', profile.id);
      if (error) throw error;
      toast.success('Alamat berhasil disimpan');
      router.push('/customer/profile');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan alamat');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm flex items-center gap-3 shrink-0">
        <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-90 transition-all duration-200">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-heading font-bold text-lg">Atur Alamat</span>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="space-y-4 pt-4">
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Lengkap</label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap..."
                className="h-24 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm resize-none"
              />
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <Navigation size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Koordinat Lokasi</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 ml-1">Latitude</label>
                  <Input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="-6.2088"
                    className="h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 ml-1">Longitude</label>
                  <Input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="106.8456"
                    className="h-12 bg-white border-transparent focus:border-emerald-500 rounded-xl shadow-sm text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleUseCurrentLocation}
                className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <Navigation size={14} />
                Gunakan lokasi saat ini
              </button>
            </div>

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Informasi</p>
                <p className="text-xs text-gray-400 mt-1">Koordinat lokasi digunakan untuk memudahkan vendor menemukan alamat kamu. Kamu bisa mengisi manual atau menggunakan deteksi lokasi otomatis.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t shrink-0">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-sm"
        >
          {saving ? <><Loader2 size={20} className="animate-spin mr-2" /> Menyimpan...</> : 'Simpan Alamat'}
        </Button>
      </div>
    </div>
  );
}
