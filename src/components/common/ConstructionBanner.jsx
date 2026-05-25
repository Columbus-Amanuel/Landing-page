import { Construction } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Site-wide notice that the public experience is still being completed.
 */
export default function ConstructionBanner() {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-900/15 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950 sm:px-6"
    >
      <p className="mx-auto flex max-w-4xl items-center justify-center gap-2 font-medium">
        <Construction className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span>{t('site.underConstruction')}</span>
      </p>
    </div>
  );
}
