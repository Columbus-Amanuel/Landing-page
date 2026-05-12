import { cn } from '@/lib/utils';
import Container from './Container';

/**
 * Vertically padded page section with an optional alternate (muted) background
 * and an optional centred eyebrow + title + description header.
 *
 * @param {object} props
 * @param {'default'|'muted'|'primary'|'dark'} [props.tone]
 * @param {'md'|'lg'|'xl'} [props.containerSize]
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.headerActions] - shown on the right of the title row
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Section({
  tone = 'default',
  containerSize = 'xl',
  eyebrow,
  title,
  description,
  headerActions,
  className,
  children,
  ...props
}) {
  return (
    <section
      className={cn(
        'py-16 md:py-24',
        tone === 'muted' && 'bg-muted/50',
        tone === 'primary' && 'bg-primary text-primary-foreground',
        tone === 'dark' && 'bg-foreground text-background',
        className,
      )}
      {...props}
    >
      <Container size={containerSize}>
        {(eyebrow || title || description || headerActions) && (
          <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <p
                  className={cn(
                    'mb-3 text-xs font-semibold uppercase tracking-[0.18em]',
                    tone === 'primary' || tone === 'dark' ? 'text-accent' : 'text-accent',
                  )}
                >
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2
                  className={cn(
                    'font-hero text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl',
                    tone === 'primary' || tone === 'dark' ? 'text-current' : 'text-primary',
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  className={cn(
                    'mt-4 text-base leading-relaxed md:text-lg',
                    tone === 'primary' || tone === 'dark'
                      ? 'text-current/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {description}
                </p>
              )}
            </div>
            {headerActions && <div className="flex flex-wrap gap-3">{headerActions}</div>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
