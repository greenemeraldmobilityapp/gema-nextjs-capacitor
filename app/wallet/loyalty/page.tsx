'use client';

import { ArrowLeft, Award, Gift, Loader2, AlertCircle, CheckCircle, Star, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useLoyalty, useLoyaltyRewards, useRedeemReward, getTier } from '@/lib/services/useLoyalty';
import { toast } from 'sonner';

export default function LoyaltyPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: loyalty, isLoading } = useLoyalty(profile?.id);
  const { data: rewards } = useLoyaltyRewards();
  const redeem = useRedeemReward();

  const tier = loyalty ? getTier(loyalty.totalSpent) : getTier(0);
  const nextTier = (() => {
    if (loyalty && loyalty.totalSpent < 500_000) return { name: 'Silver', target: 500_000 };
    if (loyalty && loyalty.totalSpent < 2_000_000) return { name: 'Gold', target: 2_000_000 };
    if (loyalty && loyalty.totalSpent < 5_000_000) return { name: 'Platinum', target: 5_000_000 };
    return null;
  })();
  const progressPercent = nextTier && loyalty
    ? Math.min(100, (loyalty.totalSpent / nextTier.target) * 100)
    : 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 pt-8 pb-8 rounded-b-[24px] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/wallet" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-800 hover:bg-purple-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading font-bold text-lg">Loyalty GEMA</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-white/70" /></div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-purple-200 text-sm">Total Poin</p>
                <p className="text-3xl font-bold">{loyalty?.points || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                {tier.name === 'Platinum' ? <Crown size={28} /> : tier.name === 'Gold' ? <Star size={28} /> : tier.name === 'Silver' ? <Zap size={28} /> : <Award size={28} />}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-purple-200">Tier {tier.name}</span>
              <span className="text-xs text-purple-300">• {(loyalty?.totalSpent || 0).toLocaleString('id-ID')} total belanja</span>
            </div>
            {nextTier && (
              <div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-purple-200 mt-1">{progressPercent.toFixed(0)}% menuju {nextTier.name} (Rp {(nextTier.target - (loyalty?.totalSpent || 0)).toLocaleString('id-ID')} lagi)</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 -mt-4">
        <h2 className="text-sm font-bold text-gray-900 px-1 pt-2">Tukarkan Poin</h2>
        {!rewards || rewards.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Gift size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada reward tersedia</p>
          </div>
        ) : (
          rewards.map((reward) => {
            const canRedeem = (loyalty?.points || 0) >= reward.pointsRequired;
            return (
              <div key={reward.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${canRedeem ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{reward.name}</h3>
                    {reward.description && <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-bold text-purple-600">{reward.pointsRequired} poin</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Nilai: Rp {reward.rewardValue.toLocaleString('id-ID')}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!profile?.id) return;
                      redeem.mutate({ userId: profile.id, rewardId: reward.id, points: reward.pointsRequired });
                    }}
                    disabled={!canRedeem || redeem.isPending}
                    className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs disabled:opacity-50"
                  >
                    {redeem.isPending ? 'Memproses...' : 'Tukar'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
