'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Building2, Star, Pencil, Trash2, Loader2, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useSavedBankAccounts, useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount, useSetPrimaryAccount, banks } from '@/lib/services/useSavedBankAccounts';
import BottomSheetSelect from '@/components/shared/BottomSheetSelect';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function WalletAccounts() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: accounts, isLoading } = useSavedBankAccounts(profile?.id);
  const createAccount = useCreateBankAccount();
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();
  const setPrimary = useSetPrimaryAccount();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBank, setFormBank] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formHolder, setFormHolder] = useState('');
  const [formPrimary, setFormPrimary] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormBank('');
    setFormNumber('');
    setFormHolder('');
    setFormPrimary(false);
  };

  const handleSave = () => {
    if (!profile?.id) return;
    if (!formBank || !formNumber || !formHolder) {
      toast.warning('Lengkapi semua data rekening', { duration: 4000 });
      return;
    }
    if (formNumber.length < 8) {
      toast.warning('Nomor rekening minimal 8 digit', { duration: 4000 });
      return;
    }

    const savePromise = editingId
      ? updateAccount.mutateAsync(
          { id: editingId, userId: profile.id, bankCode: formBank, accountNumber: formNumber, accountHolder: formHolder, isPrimary: formPrimary },
        )
      : createAccount.mutateAsync(
          { userId: profile.id, bankCode: formBank, accountNumber: formNumber, accountHolder: formHolder, isPrimary: formPrimary },
        );

    toast.promise(savePromise, {
      loading: 'Menyimpan rekening...',
      success: () => { resetForm(); return editingId ? 'Rekening berhasil diperbarui' : 'Rekening berhasil ditambahkan'; },
      error: (err) => err?.message || 'Gagal menyimpan rekening',
    });
  };

  const startEdit = (acc: { id: string; bank_code: string; account_number: string; account_holder: string; is_primary: boolean }) => {
    setEditingId(acc.id);
    setFormBank(acc.bank_code);
    setFormNumber(acc.account_number);
    setFormHolder(acc.account_holder);
    setFormPrimary(acc.is_primary);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!profile?.id) return;
    setDeleteId(id);
  };

  const executeDelete = () => {
    if (!profile?.id || !deleteId) return;
    const deletePromise = deleteAccount.mutateAsync({ id: deleteId, userId: profile.id });
    toast.promise(deletePromise, {
      loading: 'Menghapus rekening...',
      success: () => { setDeleteId(null); return 'Rekening berhasil dihapus'; },
      error: (err) => err?.message || 'Gagal menghapus rekening',
    });
  };

  const handleSetPrimary = (id: string) => {
    if (!profile?.id) return;
    const primaryPromise = setPrimary.mutateAsync({ id, userId: profile.id });
    toast.promise(primaryPromise, {
      loading: 'Mengubah rekening utama...',
      success: 'Rekening utama berhasil diubah',
      error: (err) => err?.message || 'Gagal mengubah rekening utama',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-800">Rekening Saya</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 pb-8">
        {showForm && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-emerald-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {editingId ? 'Edit Rekening' : 'Tambah Rekening Baru'}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Bank</label>
              <BottomSheetSelect
                value={formBank}
                onChange={(v) => setFormBank(v)}
                options={banks.map((b) => ({ value: b.value, label: b.label }))}
                placeholder="Pilih Bank"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nomor Rekening</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Masukkan nomor rekening"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value.replace(/\D/g, ''))}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Pemilik Rekening</label>
              <Input
                type="text"
                placeholder="Sesuai dengan nama di rekening"
                value={formHolder}
                onChange={(e) => setFormHolder(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setFormPrimary(!formPrimary)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${formPrimary ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}
              >
                {formPrimary && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm text-gray-700">Jadikan rekening utama</span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1 h-11 rounded-xl border-gray-200" disabled={createAccount.isPending || updateAccount.isPending}>
                Batal
              </Button>
              <Button onClick={handleSave} className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={createAccount.isPending || updateAccount.isPending}>
                {createAccount.isPending || updateAccount.isPending ? (
                  <><Loader2 size={16} className="animate-spin mr-1" /> Menyimpan...</>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Plus size={20} className="text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-800">Tambah Rekening Baru</p>
              <p className="text-[11px] text-gray-400">Simpan rekening untuk penarikan cepat</p>
            </div>
          </button>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-800 text-sm">{acc.bank_name}</p>
                        {acc.is_primary && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{acc.account_number}</p>
                      <p className="text-[11px] text-gray-400">{acc.account_holder}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!acc.is_primary && (
                      <button onClick={() => handleSetPrimary(acc.id)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-amber-100 flex items-center justify-center transition-colors cursor-pointer" title="Jadikan utama">
                        <Star size={13} className="text-gray-400 hover:text-amber-500" />
                      </button>
                    )}
                    <button onClick={() => startEdit(acc)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer" title="Edit">
                      <Pencil size={13} className="text-gray-400 hover:text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(acc.id)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer" title="Hapus">
                      <Trash2 size={13} className="text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Building2 size={48} strokeWidth={1} />
              <p className="mt-3 text-sm font-medium">Belum ada rekening tersimpan</p>
              <p className="text-xs mt-1">Simpan rekening bank untuk penarikan cepat</p>
            </div>
          )
        )}
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Hapus Rekening"
        message="Apakah Anda yakin ingin menghapus rekening ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
