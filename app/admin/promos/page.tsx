'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Gift, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllPromos, useCreatePromo, useUpdatePromo, useDeletePromo } from '@/lib/services/useAdmin';
import { toast } from 'sonner';

export default function AdminPromos() {
  const { data: promos, isLoading, error } = useAllPromos();
  const createPromo = useCreatePromo();
  const updatePromo = useUpdatePromo();
  const deletePromo = useDeletePromo();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount: 0, active: true });

  const handleCreate = async () => {
    if (!form.title || !form.description || form.discount <= 0) {
      toast.error('Harap isi semua field');
      return;
    }
    try {
      await createPromo.mutateAsync({ ...form, discount: Number(form.discount) });
      toast.success('Promo berhasil ditambahkan');
      setForm({ title: '', description: '', discount: 0, active: true });
      setShowForm(false);
    } catch {
      toast.error('Gagal menambah promo');
    }
  };

  const handleToggle = async (promo: { id: string; title: string; description: string; discount: number; image_url: string | null; active: boolean; created_at: string }) => {
    try {
      await updatePromo.mutateAsync({ ...promo, active: !promo.active });
      toast.success(promo.active ? 'Promo dinonaktifkan' : 'Promo diaktifkan');
    } catch {
      toast.error('Gagal mengubah status promo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromo.mutateAsync(id);
      toast.success('Promo berhasil dihapus');
    } catch {
      toast.error('Gagal menghapus promo');
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
    <div className="flex flex-col h-full w-full bg-gray-50 min-h-screen">
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Promo</h1>
            <p className="text-emerald-100 text-sm">Kelola banner promo</p>
          </div>
          <Button
            className="bg-white text-emerald-600 hover:bg-emerald-50 h-9"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} />
            {showForm ? 'Batal' : 'Tambah'}
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <input
              type="text"
              placeholder="Judul promo"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
            <textarea
              placeholder="Deskripsi promo"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full h-20 p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 resize-none"
            />
            <input
              type="number"
              placeholder="Diskon (%)"
              value={form.discount || ''}
              onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
            <Button
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreate}
              disabled={createPromo.isPending}
            >
              {createPromo.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Simpan Promo
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>Gagal memuat data promo</span>
          </div>
        )}

        {(!promos || promos.length === 0) && !showForm && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Gift size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium">Belum ada promo</p>
          </div>
        )}

        {promos?.map((promo) => (
          <div key={promo.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{promo.title}</h3>
                <p className="text-sm text-gray-500">{promo.description}</p>
              </div>
              <span className="shrink-0 text-lg font-bold text-emerald-600">{promo.discount}%</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(promo)}
                className="flex items-center gap-1 text-xs font-medium"
              >
                {promo.active ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ToggleRight size={18} /> Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400">
                    <ToggleLeft size={18} /> Nonaktif
                  </span>
                )}
              </button>
              <button
                onClick={() => handleDelete(promo.id)}
                className="flex items-center gap-1 text-xs font-medium text-red-500 ml-auto"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
