import { cn } from '@/lib/utils';
import Container from './Container';

/**
 * Poster-style hero shown at the top of inner pages (About, Events, etc).
 * Use `<Home />`'s own bespoke hero for the landing page — this is for the
 * standard secondary-page entry.
 *
 * @param {object} props
 * @param {string} [props.eyebrow]
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.children]  - extra content (e.g. CTAs)
 * @param {string} [props.className]
 */
export default function PageHero({ eyebrow, title, subtitle, children, className }) {
  return (
    <section
      className={cn(
        'bg-poster-grid relative isolate overflow-hidden border-b-2 border-foreground bg-background text-foreground',
        className,
      )}
    >
      {/* Giant fidel glyph in seal blue, cropped off the right edge. */}
      <span
        aria-hidden="true"
        className="font-ethiopic pointer-events-none absolute -right-[0.18em] -top-[0.3em] -z-10 select-none text-[22rem] font-black leading-none text-primary/15 md:text-[34rem] md:text-primary/90"
      >
        አ
      </span>

      <Container className="relative py-16 md:py-24">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="font-mono-label mb-5 text-accent">{eyebrow}</p>
          )}
          <h1 className="font-poster text-balance text-6xl md:text-8xl lg:text-9xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-foreground/80 md:text-xl">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
