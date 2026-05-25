import {
  BookOpen,
  Heart,
  HandHeart,
  Sparkles,
  Flame,
  Globe,
  Shield,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeValueIconKey } from '@/utils/valueIcons';

const ICONS = {
  book: BookOpen,
  heart: Heart,
  hands: HandHeart,
  sparkles: Sparkles,
  flame: Flame,
  globe: Globe,
  shield: Shield,
  users: Users,
};

/**
 * Render the Lucide icon associated with a mission value entry.
 * Accepts either a canonical key or a legacy emoji.
 *
 * @param {{ icon?: string, className?: string }} props
 */
export default function ValueIcon({ icon, className }) {
  const key = normalizeValueIconKey(icon);
  const Cmp = ICONS[key] ?? Sparkles;
  return <Cmp className={cn('h-7 w-7 text-primary', className)} strokeWidth={1.75} />;
}
