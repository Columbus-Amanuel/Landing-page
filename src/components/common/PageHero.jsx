import { cn } from '@/lib/utils';
import Container from './Container';

/**
 * Brand-blue hero shown at the top of inner pages (About, Events, etc).
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
        'relative isolate overflow-hidden bg-primary text-primary-foreground',
        className,
      )}
    >
      {/* Soft grid texture + radial glows give the band depth without imagery. */}
      <div className="absolute inset-0 bg-grid opacity-[0.25]" aria-hidden="true" />
      <div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative py-20 text-center md:py-28">
        {eyebrow && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-hero text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </Container>
    </section>
  );
}
