import {
  Wrench, Zap, Droplets, Paintbrush, Thermometer, Cable, Hammer, Bug,
  Settings, Shield, Truck, Sun, Moon, Wind, Leaf,
  Snowflake, Waves, Laptop, Smartphone, Brush, Scissors,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/lib/services/useCategories';

export const SUPPORTED_ICONS: Record<string, LucideIcon> = {
  Wrench, Zap, Droplets, Paintbrush, Thermometer, Cable, Hammer, Bug,
  Settings, Shield, Truck, Sun, Moon, Wind, Leaf,
  Snowflake, Waves, Laptop, Smartphone, Brush, Scissors,
};

const CATEGORY_COLORS: Record<string, string> = {
  'tukang-bangunan': 'bg-orange-100 text-orange-600',
  'teknisi-listrik': 'bg-yellow-100 text-yellow-600',
  'plumbing': 'bg-blue-100 text-blue-600',
  'cat-interior': 'bg-purple-100 text-purple-600',
  'ac-kulkas': 'bg-cyan-100 text-cyan-600',
  'elektronik': 'bg-pink-100 text-pink-600',
  'furniture': 'bg-amber-100 text-amber-600',
  'pest-control': 'bg-lime-100 text-lime-600',
};

const COLOR_CYCLE = [
  'bg-orange-100 text-orange-600',
  'bg-yellow-100 text-yellow-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-cyan-100 text-cyan-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
  'bg-lime-100 text-lime-600',
  'bg-emerald-100 text-emerald-600',
  'bg-red-100 text-red-600',
  'bg-indigo-100 text-indigo-600',
  'bg-teal-100 text-teal-600',
];

export function getCategoryIcon(categorySlug: string): LucideIcon {
  const CatIcon = SUPPORTED_ICONS[categorySlug];
  return CatIcon || Wrench;
}

export function getCategoryColor(categorySlug: string): string {
  return CATEGORY_COLORS[categorySlug] || COLOR_CYCLE[hashSlug(categorySlug) % COLOR_CYCLE.length];
}

export function getCategoryLabel(categories: Category[], slugOrName: string): string {
  const match = categories.find((c) => c.slug === slugOrName || c.name === slugOrName);
  return match?.name || slugOrName;
}

export function getCategorySlugByName(categories: Category[], name: string): string | undefined {
  return categories.find((c) => c.name === name)?.slug;
}

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
