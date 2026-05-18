import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  openDisputes: number;
  pendingTransactions: number;
};

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      const { count: totalVendors } = await supabase
        .from('vendor_profiles')
        .select('*', { count: 'exact', head: true });
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'released');
      const totalRevenue = (revenueData || []).reduce((s, o) => s + o.total_amount, 0);
      const { count: pendingVerifications } = await supabase
        .from('vendor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);
      const { count: openDisputes } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      const { count: pendingTransactions } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalCustomers: totalCustomers || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingVerifications: pendingVerifications || 0,
        openDisputes: openDisputes || 0,
        pendingTransactions: pendingTransactions || 0,
      } as AdminStats;
    },
  });
}

export type AdminVendor = {
  user_id: string;
  specialization: string | null;
  bio: string | null;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
  avatar_url: string | null;
  created_at?: string;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
    created_at: string;
  };
};

export function useAllVendors() {
  return useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, users(full_name, email, phone, created_at)')
        .order('is_verified', { ascending: true });

      if (error) throw error;
      return data as AdminVendor[];
    },
  });
}

export function useVerifyVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ is_verified: verified })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export type AdminDispute = {
  id: string;
  order_id: string;
  opened_by: string;
  status: string;
  resolution: string | null;
  created_at: string;
  orders?: {
    service_name: string;
    total_amount: number;
    order_status: string;
    customer_id: string;
    vendor_id: string;
  } | null;
  users?: { full_name: string } | null;
};

export function useAllDisputes() {
  return useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*, orders(service_name, total_amount, order_status, customer_id, vendor_id), users(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminDispute[];
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disputeId, resolution }: { disputeId: string; resolution: string }) => {
      const { error } = await supabase
        .from('disputes')
        .update({ status: 'resolved', resolution })
        .eq('id', disputeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export type AdminOrder = {
  id: string;
  customer_id: string;
  vendor_id: string;
  service_name: string;
  service_category: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  scheduled_date: string;
  created_at?: string;
  customer?: { full_name: string } | null;
};

export function useAllOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customer_id(full_name)')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as AdminOrder[];
    },
  });
}

export type AdminPromo = {
  id: string;
  title: string;
  description: string;
  discount: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export function useAllPromos() {
  return useQuery({
    queryKey: ['admin-promos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminPromo[];
    },
  });
}

export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promo: {
      title: string;
      description: string;
      discount: number;
      image_url?: string;
      active: boolean;
    }) => {
      const { error } = await supabase
        .from('promos')
        .insert(promo);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...promo }: AdminPromo) => {
      const { error } = await supabase
        .from('promos')
        .update(promo)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
    },
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
    },
  });
}

export type AdminTransaction = {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  status: string;
  bank_name?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
  created_at: string;
  wallets?: { user_id: string } | null;
};

export function useAllTransactions() {
  return useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*, wallets(user_id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminTransaction[];
    },
  });
}

export function useApproveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ txId, walletId, amount }: { txId: string; walletId: string; amount: number }) => {
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({ status: 'success' })
        .eq('id', txId);

      if (txError) throw txError;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, user_id')
        .eq('id', walletId)
        .single();

      const newBalance = (wallet?.balance || 0) + amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId);

      if (walletError) throw walletError;

      return { userId: wallet?.user_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (data?.userId) {
        queryClient.invalidateQueries({ queryKey: ['wallet', data.userId] });
      }
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (txId: string) => {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', txId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export type FraudAlert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  affected_user_id: string | null;
  affected_vendor_id: string | null;
  related_order_id: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  resolved_by: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
};

export function useFraudAlerts() {
  return useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FraudAlert[];
    },
    refetchInterval: 30000,
  });
}

export function useUpdateFraudAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, resolution, resolvedBy }: {
      id: string;
      status: 'investigating' | 'resolved' | 'false_positive';
      resolution?: string;
      resolvedBy?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (resolution) updates.resolution = resolution;
      if (status === 'resolved' || status === 'false_positive') updates.resolved_at = new Date().toISOString();
      if (resolvedBy) updates.resolved_by = resolvedBy;

      const { error } = await supabase
        .from('fraud_alerts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
