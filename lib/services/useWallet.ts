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

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single();

      if (error) throw error;
      return data as Wallet;
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tx: {
      wallet_id: string;
      type: string;
      amount: number;
      status: string;
    }) => {
      const { error } = await supabase
        .from('wallet_transactions')
        .insert(tx);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', variables.wallet_id] });
    },
  });
}

export function useRequestTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      amount,
    }: {
      walletId: string;
      amount: number;
    }) => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletId,
          type: 'topup',
          amount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as WalletTransaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', data.wallet_id] });
    },
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
    }: {
      walletId: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }) => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: walletId,
          type: 'withdrawal',
          amount: -amount,
          status: 'pending',
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WalletTransaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', data.wallet_id] });
    },
  });
}
