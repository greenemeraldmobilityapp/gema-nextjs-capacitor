'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export default function CertificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', publisher: '', year: '' });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (file) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const filePath = `${userId}/cert/${Date.now()}_${file.name}`;
          await supabase.storage.from('verification').upload(filePath, file);
        }
      }
      toast.success('Sertifikat berhasil disimpan');
      router.push('/vendor/verification/review');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan sertifikat';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <div className="bg-white/90 backdrop-blur-lg px-4 pt-6 pb-4 border-b border-stone-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/vendor/verification/ktp" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-lg font-bold text-stone-800">Sertifikat Profesi</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Upload Sertifikat (Opsional)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-400 transition-colors bg-stone-50">
              <div className="flex flex-col items-center text-stone-400">
                <Upload size={28} className="mb-2" />
                <p className="text-sm font-medium">{file ? file.name : 'Tap untuk upload sertifikat'}</p>
                <p className="text-xs mt-1">Format PDF/JPG/PNG, maks 5MB</p>
              </div>
              <input type="file" accept=".pdf,image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Sertifikat</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="cth: Sertifikat Teknisi AC"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Penerbit</label>
            <Input
              value={formData.publisher}
              onChange={(e) => setFormData(p => ({ ...p, publisher: e.target.value }))}
              placeholder="Lembaga/instansi penerbit"
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tahun</label>
            <Input
              value={formData.year}
              onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
              placeholder="2024"
              maxLength={4}
              className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/vendor/verification/review" className="flex-1">
            <Button type="button" variant="outline" size="lg" className="w-full h-12 rounded-xl border-2 border-stone-200">
              Lewati
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            variant="premium"
            size="lg"
            className="flex-1 disabled:opacity-50"
          >
            {saving ? <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Menyimpan...</span> : 'Simpan & Lanjutkan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
