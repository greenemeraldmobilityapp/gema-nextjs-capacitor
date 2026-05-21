'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePushBroadcast } from '@/lib/services/useAdmin';
import { toast } from 'sonner';

const targets = [
  { value: 'all' as const, label: 'Semua Pengguna', desc: 'Customer + Vendor', icon: Users },
  { value: 'customers' as const, label: 'Customer Saja', desc: 'Hanya pelanggan', icon: Users },
  { value: 'vendors' as const, label: 'Vendor Saja', desc: 'Hanya mitra', icon: Users },
];

export default function BroadcastPage() {
  const router = useRouter();
  const broadcast = usePushBroadcast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'all' | 'customers' | 'vendors'>('all');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.warning('Judul dan isi pesan harus diisi');
      return;
    }

    setResult(null);
    try {
      const res = await broadcast.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
        target,
      });
      setResult(res as Record<string, unknown>);
      toast.success('Broadcast berhasil dikirim!');
      setTitle('');
      setBody('');
      setUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim broadcast');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Broadcast Notifikasi</h1>
            <p className="text-emerald-100 text-sm">Kirim push ke banyak pengguna</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</label>
              <input
                type="text"
                placeholder="Judul notifikasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3 mt-1 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Isi Pesan</label>
              <textarea
                placeholder="Tulis pesan notifikasi..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full p-3 mt-1 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Link (opsional)</label>
              <input
                type="text"
                placeholder="/customer/home"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-11 px-3 mt-1 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Target Pengguna</p>
            {targets.map((t) => {
              const Icon = t.icon;
              const isActive = target === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTarget(t.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <button
          onClick={handleSend}
          disabled={broadcast.isPending}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {broadcast.isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
          ) : (
            <><Send size={18} /> Kirim Broadcast</>
          )}
        </button>

        {result && (
          <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle size={18} />
                <span className="font-semibold text-sm">Broadcast terkirim</span>
              </div>
              <div className="text-xs text-emerald-600 space-y-1">
                <p>Total pengguna: {String(result.total_users)}</p>
                <p>Token ditemukan: {String(result.tokens_found)}</p>
                <p>Berhasil dikirim: {String(result.delivered)}</p>
                <p>Gagal: {String(result.failed)}</p>
                <p>Notifikasi dibuat: {String(result.notifications_created)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
