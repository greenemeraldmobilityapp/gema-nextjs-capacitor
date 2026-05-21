import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export function getTier(totalSpent: number): { name: string; multiplier: number; color: string } {
  if (totalSpent >= 5_000_000) return { name: 'Platinum', multiplier: 500, color: 'text-blue-600' };
  if (totalSpent >= 2_000_000) return { name: 'Gold', multiplier: 600, color: 'text-amber-500' };
  if (totalSpent >= 500_000) return { name: 'Silver', multiplier: 800, color: 'text-gray-500' };
  return { name: 'Bronze', multiplier: 1000, color: 'text-orange-600' };
}

export function useLoyalty(userId: string | undefined) {
  return useQuery({
    queryKey: ['loyalty', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data as { id: string; userId: string; points: number; totalSpent: number; updatedAt: string } | null;
    },
    enabled: !!userId,
  });
}

export function useLoyaltyRewards() {
  return useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: async () => {
      const { data } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('active', true)
        .order('points_required', { ascending: true });
      return data as { id: string; name: string; description: string | null; pointsRequired: number; rewardType: string; rewardValue: number; stock: number | null }[];
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, rewardId, points }: { userId: string; rewardId: string; points: number }) => {
      const { data: reward } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('id', rewardId)
        .single();
      if (!reward) throw new Error('Reward tidak ditemukan');

      const { error: deductError } = await supabase
        .rpc('decrement_loyalty_points', { user_id: userId, points_to_deduct: points });
      if (deductError) {
        const { data: current } = await supabase
          .from('loyalty_tiers')
          .select('points')
          .eq('user_id', userId)
          .maybeSingle();
        const newPoints = Math.max(0, (current?.points ?? 0) - points);
        const { error: directError } = await supabase
          .from('loyalty_tiers')
          .update({ points: newPoints })
          .eq('user_id', userId);
        if (directError) throw directError;
      }

      const { error: redeemError } = await supabase
        .from('loyalty_redemptions')
        .insert({ user_id: userId, reward_id: rewardId, points_spent: points });
      if (redeemError) throw redeemError;

      if (reward.reward_type === 'topup') {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (wallet) {
          await supabase.rpc('credit_wallet', { wallet_id: wallet.id, amount: reward.reward_value });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-rewards'] });
      toast.success('Reward berhasil ditukar!');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Gagal menukar reward');
    },
  });
}
