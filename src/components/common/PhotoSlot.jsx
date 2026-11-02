import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Poster-style photo frame with the brand blue duotone wash.
 * Renders nothing when the photo has no `src`, so empty slots never show.
 *
 * @param {{ photo?: { src?: string, alt?: string, altAm?: string }, className?: string, duotone?: boolean }} props
 */
export default function PhotoSlot({ photo, className, duotone = true }) {
  const { pickLocalized } = useLanguage();
  if (!photo?.src) return null;
  return (
    <figure className={cn('relative overflow-hidden bg-primary', duotone && 'duotone', className)}>
      <img
        src={photo.src}
        alt={pickLocalized(photo, 'alt') || ''}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </figure>
  );
}
