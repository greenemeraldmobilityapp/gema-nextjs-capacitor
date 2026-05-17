'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, MapPin, Building, Navigation, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';

const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), { ssr: false });

const CDN = 'https://cdn.jsdelivr.net/gh/ibnushahraa/nusantara-api@cdn/data';

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

export default function AddressPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const supabase = createClient();

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

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${CDN}/provinces/index.json`);
        const data: [string, string][] = await res.json();
        setProvinces(data.map(([k, n]) => ({ kode: k, nama: n })));
      } catch {
        toast.error('Gagal memuat data wilayah');
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadExisting() {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('users')
        .select('lat, lng, address_street, address_rt, address_rw, address_village, address_district, address_city, address_province, address_postal_code')
        .eq('id', profile.id)
        .single();

      if (data) {
        setForm((prev) => ({
          ...prev,
          lat: data.lat,
          lng: data.lng,
          street: data.address_street || '',
          rt: data.address_rt || '',
          rw: data.address_rw || '',
          villageName: data.address_village || '',
          districtName: data.address_district || '',
          cityName: data.address_city || '',
          provinceName: data.address_province || '',
          postalCode: data.address_postal_code || '',
        }));
      }
      setLoading(false);
    }
    loadExisting();
  }, [profile?.id, supabase]);

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
      const updates: Record<string, unknown> = {
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
      if (form.lat !== null) updates.lat = form.lat;
      if (form.lng !== null) updates.lng = form.lng;

      const { error } = await supabase.from('users').update(updates).eq('id', profile.id);
      if (error) throw error;

      setProfile({
        ...profile,
        address_street: form.street,
        address_rt: form.rt,
        address_rw: form.rw,
        address_village: form.villageName,
        address_district: form.districtName,
        address_city: form.cityName,
        address_province: form.provinceName,
        address_postal_code: form.postalCode,
        address_full: addressFull,
      });

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
            <div className="h-56 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
                label=""
              />
            </div>

            {/* Cascading dropdowns */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Building size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">Wilayah Administratif</span>
              </div>

              {/* Provinsi */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Provinsi</label>
                <select
                  value={form.provinceCode}
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    handleProvinceChange(e.target.value, opt?.text || '');
                  }}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((p) => (
                    <option key={p.kode} value={p.kode}>{p.nama}</option>
                  ))}
                </select>
              </div>

              {/* Kota */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Kota / Kabupaten</label>
                <select
                  value={form.cityCode}
                  disabled={!form.provinceCode || fetchingCities}
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    handleCityChange(e.target.value, opt?.text || '');
                  }}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{fetchingCities ? 'Memuat...' : 'Pilih Kota / Kabupaten'}</option>
                  {cities.map((c) => (
                    <option key={c.kode} value={c.kode}>{c.nama}</option>
                  ))}
                </select>
              </div>

              {/* Kecamatan */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Kecamatan</label>
                <select
                  value={form.districtCode}
                  disabled={!form.cityCode || fetchingDistricts}
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    handleDistrictChange(e.target.value, opt?.text || '');
                  }}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{fetchingDistricts ? 'Memuat...' : 'Pilih Kecamatan'}</option>
                  {districts.map((d) => (
                    <option key={d.kode} value={d.kode}>{d.nama}</option>
                  ))}
                </select>
              </div>

              {/* Desa */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Desa / Kelurahan</label>
                <select
                  value={form.villageCode}
                  disabled={!form.districtCode || fetchingVillages}
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    setForm((prev) => ({
                      ...prev, villageCode: e.target.value, villageName: opt?.text || '',
                    }));
                  }}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{fetchingVillages ? 'Memuat...' : 'Pilih Desa / Kelurahan'}</option>
                  {villages.map((v) => (
                    <option key={v.kode} value={v.kode}>{v.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detail alamat */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-gray-700">Detail Alamat</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Jalan & No. Rumah</label>
                <Input
                  value={form.street}
                  onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                  placeholder="Jl. Merdeka No. 10"
                  className="h-12 bg-white border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">RT</label>
                  <Input
                    value={form.rt}
                    onChange={(e) => setForm((prev) => ({ ...prev, rt: e.target.value }))}
                    placeholder="003"
                    className="h-12 bg-white border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 ml-1">RW</label>
                  <Input
                    value={form.rw}
                    onChange={(e) => setForm((prev) => ({ ...prev, rw: e.target.value }))}
                    placeholder="005"
                    className="h-12 bg-white border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 ml-1">Kode Pos</label>
                <Input
                  value={form.postalCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="40114"
                  className="h-12 bg-white border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                />
              </div>
            </div>

            {/* Preview alamat */}
            {generateFullAddress() && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
                <div className="flex items-start gap-3">
                  <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1">Pratinjau Alamat</p>
                    <pre className="text-xs text-emerald-600 leading-relaxed whitespace-pre-wrap font-sans">
                      {generateFullAddress()}
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
