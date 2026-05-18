'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Building, Navigation, Loader2, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetSelect, { type BottomSheetOption } from '@/components/shared/BottomSheetSelect';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), { ssr: false });

const supabase = createClient();

const CDN = 'https://cdn.jsdelivr.net/gh/ibnushahraa/nusantara-api@cdn/data';
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface Wilayah {
  kode: string;
  nama: string;
}

interface AddressForm {
  lat: number | null;
  lng: number | null;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  villageCode: string;
  villageName: string;
  street: string;
  rt: string;
  rw: string;
  postalCode: string;
}

export default function VendorAddressPage() {
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [districts, setDistricts] = useState<Wilayah[]>([]);
  const [villages, setVillages] = useState<Wilayah[]>([]);
  const [form, setForm] = useState<AddressForm>({
    lat: null, lng: null,
    provinceCode: '', provinceName: '',
    cityCode: '', cityName: '',
    districtCode: '', districtName: '',
    villageCode: '', villageName: '',
    street: '', rt: '', rw: '', postalCode: '',
  });
  const [fetchingCities, setFetchingCities] = useState(false);
  const [fetchingDistricts, setFetchingDistricts] = useState(false);
  const [fetchingVillages, setFetchingVillages] = useState(false);
  const [coverageRadius, setCoverageRadius] = useState(5);
  const [operatingHours, setOperatingHours] = useState<Record<string, { open: string; close: string; active: boolean }>>({});

  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch(`${CDN}/provinces/index.json`);
        const data: [string, string][] = await res.json();
        setProvinces(data.map(([k, n]) => ({ kode: k, nama: n })));
      } catch {
        toast.error('Gagal memuat data wilayah');
      }
    }
    loadProvinces();
  }, []);

  useEffect(() => {
    async function loadExisting() {
      if (!profile?.id) return;
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('lat, lng, address_street, address_rt, address_rw, address_village, address_district, address_city, address_province, address_postal_code')
          .eq('id', profile.id)
          .single();

        if (userData) {
          setForm((prev) => ({
            ...prev,
            lat: userData.lat,
            lng: userData.lng,
            street: userData.address_street || '',
            rt: userData.address_rt || '',
            rw: userData.address_rw || '',
            villageName: userData.address_village || '',
            districtName: userData.address_district || '',
            cityName: userData.address_city || '',
            provinceName: userData.address_province || '',
            postalCode: userData.address_postal_code || '',
          }));
        }

        const { data: vendorData } = await supabase
          .from('vendor_profiles')
          .select('coverage_radius, operating_hours')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (vendorData) {
          if (vendorData.coverage_radius !== null && vendorData.coverage_radius !== undefined) {
            setCoverageRadius(vendorData.coverage_radius);
          }
          if (vendorData.operating_hours) {
            setOperatingHours(vendorData.operating_hours as Record<string, { open: string; close: string; active: boolean }>);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadExisting();
  }, [profile?.id]);

  useEffect(() => {
    const initial: Record<string, { open: string; close: string; active: boolean }> = {};
    DAYS.forEach(d => {
      initial[d] = { open: '08:00', close: '17:00', active: d !== 'Minggu' };
    });
    setOperatingHours(prev => Object.keys(prev).length ? prev : initial);
  }, []);

  const handleProvinceChange = useCallback(async (kode: string, nama: string) => {
    setForm((prev) => ({
      ...prev, provinceCode: kode, provinceName: nama,
      cityCode: '', cityName: '', districtCode: '', districtName: '',
      villageCode: '', villageName: '',
    }));
    setCities([]);
    setDistricts([]);
    setVillages([]);
    if (!kode) return;
    setFetchingCities(true);
    try {
      const res = await fetch(`${CDN}/cities/${kode}.json`);
      const data: [string, string][] = await res.json();
      setCities(data.map(([k, n]) => ({ kode: k, nama: n })));
    } catch {
      toast.error('Gagal memuat daftar kota');
    } finally {
      setFetchingCities(false);
    }
  }, []);

  const handleCityChange = useCallback(async (kode: string, nama: string) => {
    setForm((prev) => ({
      ...prev, cityCode: kode, cityName: nama,
      districtCode: '', districtName: '', villageCode: '', villageName: '',
    }));
    setDistricts([]);
    setVillages([]);
    if (!kode) return;
    setFetchingDistricts(true);
    try {
      const res = await fetch(`${CDN}/districts/${kode}.json`);
      const data: [string, string][] = await res.json();
      setDistricts(data.map(([k, n]) => ({ kode: k, nama: n })));
    } catch {
      toast.error('Gagal memuat daftar kecamatan');
    } finally {
      setFetchingDistricts(false);
    }
  }, []);

  const handleDistrictChange = useCallback(async (kode: string, nama: string) => {
    setForm((prev) => ({
      ...prev, districtCode: kode, districtName: nama,
      villageCode: '', villageName: '',
    }));
    setVillages([]);
    if (!kode) return;
    setFetchingVillages(true);
    try {
      const res = await fetch(`${CDN}/villages/${kode}.json`);
      const data: [string, string][] = await res.json();
      setVillages(data.map(([k, n]) => ({ kode: k, nama: n })));
    } catch {
      toast.error('Gagal memuat daftar desa');
    } finally {
      setFetchingVillages(false);
    }
  }, []);

  const generateFullAddress = useCallback(() => {
    const parts: string[] = [];
    if (form.street) parts.push(form.street);
    if (form.rt || form.rw) {
      const rtrw = [form.rt && `RT ${form.rt}`, form.rw && `RW ${form.rw}`].filter(Boolean).join(', ');
      if (rtrw) parts.push(rtrw);
    }
    if (form.villageName) parts.push(`Kel. ${form.villageName}`);
    if (form.districtName) parts.push(`Kec. ${form.districtName}`);
    if (form.cityName) parts.push(form.cityName);
    if (form.provinceName) parts.push(form.provinceName);
    if (form.postalCode) parts.push(form.postalCode);
    return parts.join('\n');
  }, [form]);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const addressFull = generateFullAddress();
      const userUpdates: Record<string, unknown> = {
        address_street: form.street || null,
        address_rt: form.rt || null,
        address_rw: form.rw || null,
        address_village: form.villageName || null,
        address_district: form.districtName || null,
        address_city: form.cityName || null,
        address_province: form.provinceName || null,
        address_postal_code: form.postalCode || null,
        address_full: addressFull || null,
      };
      if (form.lat !== null) userUpdates.lat = form.lat;
      if (form.lng !== null) userUpdates.lng = form.lng;

      const { error: userError } = await supabase.from('users').update(userUpdates).eq('id', profile.id);
      if (userError) throw userError;

      const { error: vendorError } = await supabase.from('vendor_profiles').upsert({
        user_id: profile.id,
        coverage_radius: coverageRadius,
        operating_hours: operatingHours as Record<string, unknown>,
      }, { onConflict: 'user_id' });
      if (vendorError) throw vendorError;

      toast.success('Alamat berhasil disimpan');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan alamat';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fullAddress = generateFullAddress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Alamat & Area Layanan</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Map */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-stone-800">Lokasi Usaha</h2>
          </div>
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            onChange={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
            label=""
            coverageRadius={coverageRadius}
          />
        </div>

        {/* Cascading dropdowns */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Building size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-stone-700">Wilayah Administratif</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-500 ml-1">Provinsi</label>
            <BottomSheetSelect
              value={form.provinceCode}
              onChange={(v, label) => handleProvinceChange(v, label)}
              options={provinces.map((p) => ({ value: p.kode, label: p.nama }))}
              placeholder="Pilih Provinsi"
              searchable
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-500 ml-1">Kota / Kabupaten</label>
            <BottomSheetSelect
              value={form.cityCode}
              onChange={(v, label) => handleCityChange(v, label)}
              options={cities.map((c) => ({ value: c.kode, label: c.nama }))}
              placeholder="Pilih Kota / Kabupaten"
              disabled={!form.provinceCode}
              loading={fetchingCities}
              searchable
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-500 ml-1">Kecamatan</label>
            <BottomSheetSelect
              value={form.districtCode}
              onChange={(v, label) => handleDistrictChange(v, label)}
              options={districts.map((d) => ({ value: d.kode, label: d.nama }))}
              placeholder="Pilih Kecamatan"
              disabled={!form.cityCode}
              loading={fetchingDistricts}
              searchable
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-500 ml-1">Desa / Kelurahan</label>
            <BottomSheetSelect
              value={form.villageCode}
              onChange={(v, label) => setForm((prev) => ({ ...prev, villageCode: v, villageName: label }))}
              options={villages.map((v) => ({ value: v.kode, label: v.nama }))}
              placeholder="Pilih Desa / Kelurahan"
              disabled={!form.districtCode}
              loading={fetchingVillages}
              searchable
            />
          </div>
        </div>

        {/* Detail alamat */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-stone-800">Detail Alamat</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Jalan & No. Rumah</label>
            <Input
              value={form.street}
              onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
              placeholder="Jl. Merdeka No. 10"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">RT</label>
              <Input
                value={form.rt}
                onChange={(e) => setForm((prev) => ({ ...prev, rt: e.target.value }))}
                placeholder="003"
                className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">RW</label>
              <Input
                value={form.rw}
                onChange={(e) => setForm((prev) => ({ ...prev, rw: e.target.value }))}
                placeholder="005"
                className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Kode Pos</label>
            <Input
              value={form.postalCode}
              onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
              placeholder="40114"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Pratinjau Alamat */}
        {fullAddress && (
          <div className="bg-emerald-50/80 backdrop-blur-sm rounded-3xl p-5 shadow-elegant border border-emerald-100/50">
            <div className="flex items-start gap-3">
              <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 mb-1">Pratinjau Alamat</p>
                <pre className="text-xs text-emerald-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {fullAddress}
                </pre>
                {form.lat !== null && form.lng !== null && (
                  <p className="text-xs text-emerald-400 mt-2">
                    {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jam Operasional */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-stone-800">Jam Operasional</h2>
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
                      className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-stone-700">{day}</span>
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
                      className="h-9 rounded-lg border border-stone-200 px-2 text-sm bg-stone-50 shadow-sm disabled:opacity-30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                    <span className="text-xs text-stone-400">s/d</span>
                    <input
                      type="time"
                      value={oh.close}
                      disabled={!oh.active}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        [day]: { ...prev[day], close: e.target.value },
                      }))}
                      className="h-9 rounded-lg border border-stone-200 px-2 text-sm bg-stone-50 shadow-sm disabled:opacity-30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Area Layanan */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm flex items-center justify-center">
              <Navigation size={18} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-stone-800">Area Layanan</h2>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Radius (km)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={coverageRadius}
                onChange={(e) => setCoverageRadius(Number(e.target.value))}
                className="flex-1 accent-emerald-600"
              />
              <span className="text-sm font-bold text-emerald-600 w-12 text-right">{coverageRadius} km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/90 backdrop-blur-lg border-t border-stone-100 shrink-0">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Alamat'}
        </Button>
      </div>
    </div>
  );
}
