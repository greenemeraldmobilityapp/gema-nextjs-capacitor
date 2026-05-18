import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
};

export type WalletTransaction = {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  status: string;
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  created_at: string;
};

export function useWallet(userId: string | undefined) {
  return useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Wallet | null;
    },
    enabled: !!userId,
  });
}

export function useWalletTransactions(walletId: string | undefined) {
  return useQuery({
    queryKey: ['wallet-transactions', walletId],
    queryFn: async () => {
      if (!walletId) return [];
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!walletId,
  });
}

export function useRequestWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      amount,
      bankName,
      accountNumber,
      accountHolder,
      savedAccountId,
    }: {
      walletId: string;
      amount: number;
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      savedAccountId?: string;
    }) => {
      const params: Record<string, unknown> = {
        p_wallet_id: walletId,
        p_amount: amount,
      };

      if (savedAccountId) {
        params.p_saved_account_id = savedAccountId;
      } else {
        params.p_bank_name = bankName;
        params.p_account_number = accountNumber;
        params.p_account_holder = accountHolder;
      }

      const { data, error } = await supabase.rpc('request_withdrawal', params);

      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });
}

export function useApproveWithdrawDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      txId,
    }: {
      txId: string;
    }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Sesi tidak ditemukan');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-disbursement`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_id: txId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses disbursement');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useAutoDisburse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ txId }: { txId: string }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Sesi tidak ditemukan');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-disbursement`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_id: txId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses disbursement');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
  });
}
