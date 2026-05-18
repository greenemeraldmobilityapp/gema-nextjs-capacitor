'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Loader2, Wallet, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWallet, useRequestWithdraw } from '@/lib/services/useWallet';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

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
  const withdraw = useRequestWithdraw();
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const balance = wallet?.balance || 0;
  const isValid = numericAmount >= 10000 && numericAmount <= balance && bank && accountNumber.length >= 8 && accountHolder;
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (numericAmount > balance) {
      toast.error('Saldo tidak mencukupi');
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
        toast.error('Dompet tidak ditemukan');
        return;
      }
      walletId = newWallet.id;
      queryClient.invalidateQueries({ queryKey: ['wallet', profile?.id] });
    }

    withdraw.mutate(
      {
        walletId: walletId!,
        amount: numericAmount,
        bankName: banks.find((b) => b.value === bank)?.label || bank,
        accountNumber,
        accountHolder,
      },
      {
        onSuccess: () => {
          toast.success('Permintaan penarikan berhasil dikirim');
          router.push('/wallet');
        },
        onError: (err) => toast.error(err.message || 'Gagal mengirim permintaan'),
      }
    );
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

        {/* Bank Account */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-emerald-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rekening Tujuan</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Bank</label>
            <div className="relative">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 font-medium appearance-none focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 cursor-pointer"
              >
                <option value="">Pilih Bank</option>
                {banks.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
              <span className="text-gray-500">Biaya</span>
              <span className="font-bold text-emerald-600">Gratis</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-semibold text-sm text-gray-600">Sisa Saldo</span>
              <span className="font-bold text-gray-800">Rp {(balance - numericAmount).toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || withdraw.isPending}
          variant="premium"
          size="lg"
          className="w-full disabled:opacity-50"
        >
          {withdraw.isPending ? (
            <><Loader2 size={20} className="animate-spin mr-2" /> Memproses...</>
          ) : (
            <><ArrowUpRight size={20} /> Tarik Rp {numericAmount.toLocaleString()}</>
          )}
        </Button>
      </div>
    </div>
  );
}
