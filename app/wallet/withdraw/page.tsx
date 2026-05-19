'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Loader2, Wallet, Sparkles, Building2, Info, Clock, Zap, Star, Pencil, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWallet, useRequestWithdraw, useAutoDisburse } from '@/lib/services/useWallet';
import { useVendor } from '@/lib/services/useVendors';
import { useSavedBankAccounts } from '@/lib/services/useSavedBankAccounts';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import BottomSheetSelect from '@/components/shared/BottomSheetSelect';

const AUTO_DISBURSE_MAX = 5_000_000;

const banks = [
  { value: 'bca', label: 'BCA' },
  { value: 'bni', label: 'BNI' },
  { value: 'bri', label: 'BRI' },
  { value: 'mandiri', label: 'Mandiri' },
  { value: 'permata', label: 'Permata' },
  { value: 'cimb', label: 'CIMB Niaga' },
  { value: 'danamon', label: 'Danamon' },
];

export default function WithdrawPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: wallet } = useWallet(profile?.id);
  const { data: vendor } = useVendor(profile?.id);
  const { data: savedAccounts } = useSavedBankAccounts(profile?.id);
  const withdraw = useRequestWithdraw();
  const autoDisburse = useAutoDisburse();

  const [mode, setMode] = useState<'saved' | 'manual'>('saved');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [amount, setAmount] = useState('');

  // Pre-select primary account on load
  useEffect(() => {
    if (savedAccounts && savedAccounts.length > 0 && !selectedAccountId) {
      const primary = savedAccounts.find((a) => a.is_primary);
      setSelectedAccountId(primary?.id || savedAccounts[0].id);
    }
  }, [savedAccounts, selectedAccountId]);

  const hasSavedAccounts = savedAccounts && savedAccounts.length > 0;
  const selectedAccount = savedAccounts?.find((a) => a.id === selectedAccountId);

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const balance = wallet?.balance || 0;
  const isVerifiedVendor = vendor?.is_verified === true;
  const canAutoDisburse = isVerifiedVendor && numericAmount <= AUTO_DISBURSE_MAX && numericAmount >= 10000;
  const isProcessing = withdraw.isPending || autoDisburse.isPending;

  const isValid = numericAmount >= 10000 && numericAmount <= balance && (
    mode === 'saved' ? !!selectedAccountId : (bank && accountNumber.length >= 8 && accountHolder)
  );

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (numericAmount < 10000) {
      toast.warning('Minimal penarikan Rp 10.000', { duration: 4000 });
      return;
    }
    if (numericAmount > balance) {
      toast.warning('Saldo tidak mencukupi', { duration: 4000 });
      return;
    }

    let walletId = wallet?.id;
    if (!walletId) {
      const supabase = createClient();
      const { data: newWallet, error: createErr } = await supabase
        .from('wallets')
        .insert({ user_id: profile?.id, balance: 0 })
        .select()
        .single();
      if (createErr || !newWallet) {
        toast.error(createErr?.message || 'Dompet tidak ditemukan', { duration: 5000 });
        return;
      }
      walletId = newWallet.id;
      queryClient.invalidateQueries({ queryKey: ['wallet', profile?.id] });
    }

    const submitPromise = (async () => {
      const result = await withdraw.mutateAsync({
        walletId: walletId!,
        amount: numericAmount,
        savedAccountId: mode === 'saved' ? selectedAccountId : undefined,
        bankName: mode === 'manual' ? banks.find((b) => b.value === bank)?.label || bank : undefined,
        accountNumber: mode === 'manual' ? accountNumber : undefined,
        accountHolder: mode === 'manual' ? accountHolder : undefined,
      });

      if (canAutoDisburse) {
        await autoDisburse.mutateAsync({ txId: result.id });
      }

      return result;
    })();

    toast.promise(submitPromise, {
      loading: 'Memproses penarikan...',
      success: () => {
        router.push('/wallet');
        if (canAutoDisburse) {
          return 'Penarikan berhasil! Dana dikirim ke rekening Anda.';
        }
        return 'Permintaan penarikan berhasil dikirim';
      },
      error: (err) => err?.message || 'Gagal memproses penarikan',
    });

    try {
      await submitPromise;
    } catch {
      // handled by toast.promise
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-xl px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-lg font-bold text-gray-800">Tarik Saldo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 pb-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-5 text-white shadow-lg shadow-emerald-900/20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 via-transparent to-emerald-300/5" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:16px_16px]" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Wallet size={20} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-100/70 font-medium tracking-wider uppercase">Saldo Tersedia</p>
                <p className="font-heading text-2xl font-bold">Rp {balance.toLocaleString('id-ID')}</p>
              </div>
            </div>
            {numericAmount > balance && numericAmount > 0 && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Melebihi saldo tersedia
              </p>
            )}
            {canAutoDisburse && hasSavedAccounts ? (
              <p className="text-[10px] text-emerald-100/80 mt-3 flex items-center gap-1.5">
                <Zap size={11} />
                Vendor terverifikasi — dana dikirim otomatis ke rekening Anda
              </p>
            ) : (
              <p className="text-[10px] text-emerald-100/60 mt-3 flex items-center gap-1.5">
                <Clock size={11} />
                Penarikan diproses oleh admin dan akan dikirim ke rekening Anda
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Penarikan</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200">
            <span className="text-xl font-bold text-gray-400">Rp</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="text-2xl font-bold h-auto border-0 focus-visible:ring-0 px-0 bg-transparent"
            />
          </div>
        </div>

        {/* Bank Account - Saved Accounts */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-emerald-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rekening Tujuan</p>
            </div>
            <button
              onClick={() => router.push('/wallet/accounts')}
              className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1 flex items-center gap-0.5 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Pencil size={11} />
              Kelola
            </button>
          </div>

          {hasSavedAccounts ? (
            <>
              <div className="space-y-1.5">
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => { setSelectedAccountId(acc.id); setMode('saved'); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                      selectedAccountId === acc.id && mode === 'saved'
                        ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500/10'
                        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedAccountId === acc.id && mode === 'saved'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-bold truncate ${
                          selectedAccountId === acc.id && mode === 'saved' ? 'text-emerald-800' : 'text-gray-800'
                        }`}>{acc.bank_name}</p>
                        {acc.is_primary && (
                          <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{acc.account_number}</p>
                      <p className="text-[10px] text-gray-400">{acc.account_holder}</p>
                    </div>
                    {selectedAccountId === acc.id && mode === 'saved' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {mode === 'manual' && (
                <div className="pt-2 space-y-3">
                  <div className="h-px bg-gray-100" />
                  <p className="text-[11px] text-gray-400">Atau isi manual:</p>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">Bank</label>
                    <BottomSheetSelect
                      value={bank}
                      onChange={(v) => setBank(v)}
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
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Pemilik Rekening</label>
                    <Input
                      type="text"
                      placeholder="Sesuai dengan nama di rekening"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {mode === 'saved' && (
                <button
                  onClick={() => { setMode('manual'); setBank(''); setAccountNumber(''); setAccountHolder(''); }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-emerald-600 transition-colors py-2 cursor-pointer"
                >
                  + Gunakan rekening lain
                </button>
              )}
            </>
          ) : (
            <>
              {/* No saved accounts — show manual form */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Bank</label>
                <BottomSheetSelect
                  value={bank}
                  onChange={(v) => setBank(v)}
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
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Pemilik Rekening</label>
                <Input
                  type="text"
                  placeholder="Sesuai dengan nama di rekening"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => router.push('/wallet/accounts')}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-1 cursor-pointer"
              >
                <Building2 size={12} />
                Simpan rekening untuk penarikan selanjutnya
              </button>
            </>
          )}
        </div>

        {/* Summary */}
        {numericAmount >= 10000 && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-emerald-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ringkasan</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Penarikan</span>
              <span className="font-bold text-gray-800">Rp {numericAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Biaya Transfer</span>
              <span className="font-bold text-emerald-600">Gratis</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-semibold text-sm text-gray-600">Sisa Saldo</span>
              <span className="font-bold text-gray-800">Rp {(balance - numericAmount).toLocaleString('id-ID')}</span>
            </div>
            <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/50 rounded-2xl flex items-start gap-2.5">
              <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  {canAutoDisburse && hasSavedAccounts ? 'Penarikan Otomatis' : 'Proses Penarikan'}
                </p>
                <p className="text-[10px] text-amber-700/80 mt-0.5 leading-relaxed">
                  {canAutoDisburse && hasSavedAccounts
                    ? 'Sebagai vendor terverifikasi, dana akan langsung dikirim ke rekening tujuan Anda melalui transfer otomatis.'
                    : 'Setelah dikirim, admin akan memproses dan mentransfer dana ke rekening tujuan Anda. Proses biasanya 1-3 hari kerja.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {!isVerifiedVendor && balance === 0 && (
          <div className="p-3 bg-blue-50/80 border border-blue-200/50 rounded-2xl flex items-start gap-2.5">
            <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700/80 leading-relaxed">
              Vendor terverifikasi (KYC + Sertifikat) bisa menikmati penarikan otomatis tanpa review admin. 
              Lengkapi verifikasi di menu Profil.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        {canAutoDisburse && hasSavedAccounts && (
          <p className="text-center text-[10px] text-emerald-600 font-medium mb-2 flex items-center justify-center gap-1">
            <Zap size={12} />
            Vendor terverifikasi — dana dikirim otomatis
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isProcessing}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {withdraw.isPending ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Memproses...</>
          ) : autoDisburse.isPending ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Mengirim dana...</>
          ) : (
            <><ArrowUpRight size={20} /> Tarik Rp {numericAmount.toLocaleString()}</>
          )}
        </Button>
      </div>
    </div>
  );
}
