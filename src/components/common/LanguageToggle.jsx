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
        'font-mono-label inline-flex items-center border-2 border-foreground p-0.5 font-semibold',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        aria-pressed={language === 'en'}
        className={cn(
          'px-2.5 py-1 transition-colors',
          language === 'en'
            ? 'bg-foreground text-background'
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
          'font-ethiopic px-2.5 py-1 normal-case transition-colors',
          language === 'am'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        አማ
      </button>
    </div>
  );
}
