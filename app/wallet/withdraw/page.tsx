'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWallet, useRequestWithdraw } from '@/lib/services/useWallet';

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

  const handleSubmit = () => {
    if (!wallet?.id) {
      toast.error('Dompet tidak ditemukan');
      return;
    }
    if (numericAmount > balance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }
    withdraw.mutate(
      {
        walletId: wallet.id,
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
      <div className="bg-white px-4 pt-6 pb-4 border-b flex items-center gap-3">
        <Link href="/wallet" className="p-1 -ml-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Tarik Saldo</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white rounded-xl p-4 border space-y-1">
          <p className="text-sm text-gray-500">Saldo Tersedia</p>
          <p className="text-2xl font-bold text-gray-900">Rp {balance.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border space-y-3">
          <p className="text-sm font-medium text-gray-700">Jumlah Penarikan</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-400">Rp</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="text-2xl font-bold h-12 border-0 focus-visible:ring-0 px-0"
            />
          </div>
          {numericAmount > balance && (
            <p className="text-xs text-red-500">Melebihi saldo tersedia</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border space-y-3">
          <p className="text-sm font-medium text-gray-700">Rekening Tujuan</p>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bank</label>
            <Select value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Pilih Bank</option>
              {banks.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nomor Rekening</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Masukkan nomor rekening"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nama Pemilik Rekening</label>
            <Input
              type="text"
              placeholder="Sesuai dengan nama di rekening"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || withdraw.isPending}
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold"
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
