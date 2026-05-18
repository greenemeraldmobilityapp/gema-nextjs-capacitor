import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type SavedBankAccount = {
  id: string;
  user_id: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

const banks = [
  { value: 'bca', label: 'BCA' },
  { value: 'bni', label: 'BNI' },
  { value: 'bri', label: 'BRI' },
  { value: 'mandiri', label: 'Mandiri' },
  { value: 'permata', label: 'Permata' },
  { value: 'cimb', label: 'CIMB Niaga' },
  { value: 'danamon', label: 'Danamon' },
];

export function useSavedBankAccounts(userId: string | undefined) {
  return useQuery({
    queryKey: ['saved-bank-accounts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('saved_bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedBankAccount[];
    },
    enabled: !!userId,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: {
      userId: string;
      bankCode: string;
      accountNumber: string;
      accountHolder: string;
      isPrimary?: boolean;
    }) => {
      const bankLabel = banks.find((b) => b.value === account.bankCode)?.label || account.bankCode;

      const { error } = await supabase.from('saved_bank_accounts').insert({
        user_id: account.userId,
        bank_code: account.bankCode,
        bank_name: bankLabel,
        account_number: account.accountNumber,
        account_holder: account.accountHolder,
        is_primary: account.isPrimary || false,
      });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-bank-accounts', variables.userId] });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: {
      id: string;
      userId: string;
      bankCode?: string;
      accountNumber?: string;
      accountHolder?: string;
      isPrimary?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (account.bankCode !== undefined) {
        updates.bank_code = account.bankCode;
        updates.bank_name = banks.find((b) => b.value === account.bankCode)?.label || account.bankCode;
      }
      if (account.accountNumber !== undefined) updates.account_number = account.accountNumber;
      if (account.accountHolder !== undefined) updates.account_holder = account.accountHolder;
      if (account.isPrimary !== undefined) updates.is_primary = account.isPrimary;
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('saved_bank_accounts')
        .update(updates)
        .eq('id', account.id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-bank-accounts', variables.userId] });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('saved_bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-bank-accounts', variables.userId] });
    },
  });
}

export function useSetPrimaryAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error: resetError } = await supabase
        .from('saved_bank_accounts')
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (resetError) throw resetError;

      const { error } = await supabase
        .from('saved_bank_accounts')
        .update({ is_primary: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-bank-accounts', variables.userId] });
    },
  });
}

export { banks };
