import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
};

/**
 * Spinning loader using the Lucide `Loader2` icon. Set `center` to wrap it
 * in a vertically-padded centered div for full-section loading states.
 *
 * @param {{ size?: 'sm'|'md'|'lg', center?: boolean, className?: string }} props
 */
export default function LoadingSpinner({ size = 'md', center = false, className }) {
  const { t } = useLanguage();
  const spinner = (
    <Loader2
      role="status"
      aria-label={t('common.loading')}
      className={cn('animate-spin text-primary', SIZES[size] ?? SIZES.md, className)}
    />
  );

  if (!center) return spinner;
  return <div className="flex w-full items-center justify-center py-16">{spinner}</div>;
}
