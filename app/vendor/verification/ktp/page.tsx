'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function KtpVerificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nik: '', name: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Upload to Supabase Storage + insert verification record
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    router.push('/vendor/verification/certification');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-6 pb-4 border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/vendor/verification" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Verifikasi KTP</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Foto KTP</label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors bg-gray-50">
              {preview ? (
                <img src={preview} alt="KTP preview" className="h-full object-contain rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm font-medium">Tap untuk upload foto KTP</p>
                  <p className="text-xs mt-1">Format JPG/PNG, maks 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">NIK</label>
            <Input
              required
              value={formData.nik}
              onChange={(e) => setFormData(p => ({ ...p, nik: e.target.value }))}
              placeholder="16 digit NIK"
              maxLength={16}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Nama Sesuai KTP</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Nama lengkap"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving || !file || !formData.nik || !formData.name}
          variant="pill"
          size="lg"
          className="w-full shadow-sm disabled:opacity-50"
        >
          {saving ? <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span> : 'Simpan & Lanjutkan'}
        </Button>
      </form>
    </div>
  );
}
