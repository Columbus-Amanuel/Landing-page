import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Two-state segmented control switching between English and Amharic.
 * Used by the navbar — small, pill-shaped, brand-aware.
 */
export default function LanguageToggle({ className }) {
  const { language, changeLanguage } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-secondary/60 p-0.5 text-xs font-semibold',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        aria-pressed={language === 'en'}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('am')}
        aria-pressed={language === 'am'}
        className={cn(
          'rounded-full px-3 py-1 transition-colors',
          language === 'am'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        አማ
      </button>
    </div>
  );
}
