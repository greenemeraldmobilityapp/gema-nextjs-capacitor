import { Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type PremiumDealBannerProps = {
  title: string;
  description: string;
  discount: number;
  href?: string;
};

export default function PremiumDealBanner({ title, description, discount, href = '/customer/search' }: PremiumDealBannerProps) {
  return (
    <Link href={href}>
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10" />
        <div className="flex items-center justify-between p-5">
          <div className="text-white flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2">
              <Gift size={10} />
              Premium
            </span>
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
            <p className="text-sm text-emerald-100 mt-1">{description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-200 mt-2">
              Lihat Detail <ArrowRight size={14} />
            </span>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0 ml-4">
            {discount}%
          </div>
        </div>
      </div>
    </Link>
  );
}
