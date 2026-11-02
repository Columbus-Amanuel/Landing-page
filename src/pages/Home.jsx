import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Heart,
  MapPin,
  Phone,
  PlayCircle,
  PhoneCall,
  Mail,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Container from '@/components/common/Container';
import SermonCard from '@/components/common/SermonCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ValueIcon from '@/components/common/ValueIcon';
import PhotoSlot from '@/components/common/PhotoSlot';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { getUpcomingEvents } from '@/services/eventsService';
import { getSermons } from '@/services/sermonsService';
import { submitContactForm } from '@/services/contactService';
import { ROUTES, buildPath } from '@/constants/routes';
import {
  HERO_SECONDARY_PHOTO,
  SERVICE_TIMES_PHOTOS,
  GALLERY_PHOTOS,
  MISSION_PHOTO,
  PASTOR_PHOTO,
} from '@/constants/homePhotos';
import {
  toMapsHref,
  toTelHref,
  toMailtoHref,
  formatPhoneDisplay,
  toDate,
  formatDate,
  formatTime,
} from '@/lib/format';
import { isValidPhone } from '@/lib/validators';
import { getYoutubeEmbedUrl } from '@/lib/youtube';
import { cn } from '@/lib/utils';

const DEFAULT_HERO_YOUTUBE_VIDEO_ID = '9tFh_EwJWdc';
const HERO_CALLBACK_PLACEHOLDER_EMAIL = 'not-provided@example.com';

/** Motto printed on the church seal; used as a decorative scrolling band. */
const SEAL_MOTTO = { am: 'ኢየሱስ ጌታ ነው', en: 'Jesus is Lord' };

/** Section numbers shift by one when the optional photo wall is hidden. */
const HAS_GALLERY = GALLERY_PHOTOS.some((p) => p?.src);
const n = (base) => (HAS_GALLERY ? base : base - 1);

/* ------------------------------------------------------------------ */
/* Shared poster primitives                                            */
/* ------------------------------------------------------------------ */

/** Mono "[ 01 ]" index label used to number poster sections. */
function SectionIndex({ n, className }) {
  return (
    <span className={cn('font-mono-label text-accent', className)} aria-hidden="true">
      [ {String(n).padStart(2, '0')} ]
    </span>
  );
}

/** Square, heavy poster button (link). */
function PosterLink({ to, href, children, tone = 'outline', className, ...props }) {
  const classes = cn(
    'inline-flex w-full items-center justify-between gap-4 border-2 px-5 py-4 font-hero text-base font-black uppercase tracking-tight transition-colors sm:w-auto sm:min-w-[19rem]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    tone === 'accent' && 'border-accent bg-accent text-accent-foreground hover:bg-accent/90',
    tone === 'primary' && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
    tone === 'outline' && 'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background',
    tone === 'light' && 'border-current bg-transparent hover:bg-background hover:text-foreground',
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
}

/** Poster section heading: index + eyebrow, giant condensed title, lead. */
function PosterHeading({ index, eyebrow, title, description, actions, tone = 'light', className }) {
  return (
    <header className={cn('mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-4xl">
        <p className="flex flex-wrap items-center gap-3">
          {index != null && <SectionIndex n={index} />}
          {eyebrow && (
            <span className={cn('font-mono-label', tone === 'dark' ? 'text-background/70' : 'text-muted-foreground')}>
              {eyebrow}
            </span>
          )}
        </p>
        {title && (
          <h2 className="font-poster mt-4 text-balance text-6xl md:text-8xl lg:text-9xl">{title}</h2>
        )}
        {description && (
          <p
            className={cn(
              'mt-6 max-w-2xl text-lg font-medium leading-relaxed',
              tone === 'dark' ? 'text-background/80' : 'text-muted-foreground',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Splits a start time like "2:00 PM – 4:00 PM" into { clock: "2:00", meridiem: "PM" }. */
function splitStartTime(time) {
  const match = String(time || '').match(/(\d{1,2}(?::\d{2})?)\s*(AM|PM)?/i);
  if (!match) return null;
  return { clock: match[1], meridiem: (match[2] || '').toUpperCase() };
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroCallbackDialog() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', phone: '' } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await submitContactForm({
        firstName: values.name,
        lastName: '',
        email: HERO_CALLBACK_PLACEHOLDER_EMAIL,
        phone: values.phone,
        subject: t('home.heroCallbackSubject'),
        message: t('home.heroCallbackMessageBody'),
      });
      toast.success(t('home.heroCallbackThanksTitle'), {
        description: t('home.heroCallbackThanksBody'),
      });
      reset();
      setOpen(false);
    } catch {
      toast.error(language === 'am' ? 'ስህተት ተከስቷል።' : 'Could not send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-full items-center justify-between gap-4 border-2 border-foreground bg-background px-5 py-4 font-hero text-base font-black uppercase tracking-tight text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:min-w-[19rem]"
        >
          {t('home.heroLetUsCallYou')} <PhoneCall className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('home.heroCallbackDialogTitle')}</DialogTitle>
          <DialogDescription>{t('home.heroCallbackDialogLead')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cb-name">{t('home.heroCallbackNameLabel')}</Label>
            <Input
              id="cb-name"
              aria-invalid={Boolean(errors.name)}
              {...register('name', { required: t('common.required') })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cb-phone">{t('home.heroCallbackPhoneLabel')}</Label>
            <Input
              id="cb-phone"
              type="tel"
              aria-invalid={Boolean(errors.phone)}
              {...register('phone', {
                required: t('common.required'),
                validate: (value) => isValidPhone(value) || t('home.heroCallbackPhoneInvalid'),
              })}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('home.heroCallbackCancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              <PhoneCall /> {submitting ? t('common.loading') : t('home.heroCallbackSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Church name set as a stacked poster: alternating solid / outlined words, last word in red. */
function PosterTitle({ text }) {
  const { isAmharic } = useLanguage();
  const words = String(text || '').split(/\s+/).filter(Boolean);
  return (
    <h1
      className={cn(
        'font-poster break-words text-foreground',
        // Ethiopic glyphs are taller and wider than condensed Latin caps.
        isAmharic
          ? 'text-[clamp(3rem,10vw,7rem)] leading-[1.02]'
          : 'text-[clamp(3.6rem,13vw,9.5rem)]',
      )}
    >
      {words.map((word, idx) => {
        const isLast = idx === words.length - 1 && words.length > 1;
        const outlined = !isLast && idx % 2 === 1;
        return (
          <Fragment key={`${word}-${idx}`}>
            <span
              className={cn(
                'inline-block',
                outlined && 'text-outline-primary',
                isLast && 'text-accent',
              )}
            >
              {word}
            </span>{' '}
          </Fragment>
        );
      })}
    </h1>
  );
}

function Hero() {
  const { t } = useLanguage();
  const { churchInfo } = useSiteSettings();
  const [videoOpen, setVideoOpen] = useState(false);

  const heroVideoId =
    import.meta.env.VITE_HERO_YOUTUBE_VIDEO_ID || DEFAULT_HERO_YOUTUBE_VIDEO_ID;
  const heroVideoUrl = getYoutubeEmbedUrl(heroVideoId, {
    autoplay: true,
    mute: true,
    loop: true,
    controls: false,
  });

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="bg-poster-grid relative isolate overflow-hidden border-b-2 border-foreground bg-background">
      {/* Giant fidel glyph — the first letter of the Amharic alphabet, in seal blue. */}
      <span
        aria-hidden="true"
        className="font-ethiopic pointer-events-none absolute -right-[18vw] -top-[8vw] -z-10 select-none text-[95vw] font-black leading-none text-primary/15 lg:-right-[9vw] lg:-top-[14vw] lg:text-[64vw] lg:text-primary"
      >
        አ
      </span>

      <Container className="relative grid grid-cols-1 gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-center gap-3">
            <SectionIndex n={1} />
            <span className="font-mono-label text-muted-foreground">{t('home.prewelcome')}</span>
          </p>

          <div className="mt-6">
            <PosterTitle text={t('home.title')} />
          </div>

          <p className="mt-8 max-w-xl text-lg font-semibold leading-snug md:text-xl">
            {t('home.subtitle')}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:items-start">
            <PosterLink to={ROUTES.about} tone="accent">
              {t('home.aboutBtn')} <ArrowRight className="h-5 w-5" />
            </PosterLink>
            <PosterLink to={ROUTES.sermons}>
              {t('home.sermonsBtn')} <PlayCircle className="h-5 w-5" />
            </PosterLink>
            <HeroCallbackDialog />
          </div>

          {/* Address + phone */}
          <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
            {fullAddress && (
              <a
                href={toMapsHref(fullAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-label inline-flex items-center gap-2 text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                <MapPin className="h-4 w-4 text-accent" />
                {fullAddress}
              </a>
            )}
            {churchInfo.phone && (
              <a
                href={toTelHref(churchInfo.phone)}
                className="font-mono-label inline-flex items-center gap-2 text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                <Phone className="h-4 w-4 text-accent" />
                {formatPhoneDisplay(churchInfo.phone)}
              </a>
            )}
          </div>
        </div>

        {/* Video frame — muted loop with a blue duotone; toggle reveals full color. */}
        <div className="relative lg:col-span-5 lg:pt-40">
          <div
            className={cn(
              'duotone relative aspect-[4/3] w-full sm:aspect-[4/5] overflow-hidden border-[6px] border-background bg-primary shadow-[12px_12px_0_0_hsl(var(--foreground))]',
              videoOpen && 'duotone-off',
            )}
          >
            <iframe
              title={t('home.heroVideoTitle')}
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-video h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
              src={heroVideoUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          </div>

          <button
            type="button"
            onClick={() => setVideoOpen((v) => !v)}
            aria-pressed={videoOpen}
            className="font-mono-label absolute right-3 top-3 z-10 inline-flex items-center gap-2 bg-foreground px-3 py-2 text-background transition-colors hover:bg-accent lg:top-[10.75rem]"
          >
            {videoOpen ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {videoOpen ? t('home.hideVideoBtn') : t('home.showVideoBtn')}
          </button>

          <PhotoSlot
            photo={HERO_SECONDARY_PHOTO}
            className="absolute -bottom-8 -left-6 z-10 hidden aspect-[4/5] w-40 border-[6px] border-background sm:block lg:-left-24 lg:w-48"
          />
        </div>
      </Container>
    </section>
  );
}

/** Decorative scrolling band with the seal motto (Amharic + English). */
function MottoBand() {
  const items = Array.from({ length: 6 });
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-b-2 border-foreground bg-primary py-4 text-primary-foreground"
    >
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10">
            {items.map((_, i) => (
              <Fragment key={i}>
                <span className="font-ethiopic text-3xl font-black md:text-4xl">{SEAL_MOTTO.am}</span>
                <span className="text-2xl text-accent">✚</span>
                <span className="font-poster text-4xl md:text-5xl">{SEAL_MOTTO.en}</span>
                <span className="text-2xl text-accent">✚</span>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service times                                                       */
/* ------------------------------------------------------------------ */

function ServiceTimes() {
  const { t, pickLocalized } = useLanguage();
  const { churchInfo } = useSiteSettings();
  const entries = churchInfo.serviceTimes || [];
  const start = splitStartTime(entries[0]?.time);
  const photos = SERVICE_TIMES_PHOTOS.filter((p) => p?.src).slice(0, 2);

  return (
    <section className="relative isolate overflow-hidden border-b-2 border-foreground bg-navy text-navy-foreground">
      <Container className="grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {start && (
            <p
              aria-hidden="true"
              className="font-poster flex items-start text-[clamp(7rem,30vw,12rem)] leading-[0.8] text-accent md:text-[clamp(12rem,22vw,19rem)]"
            >
              {start.clock}
              {start.meridiem && (
                <span className="ml-2 text-[0.32em] leading-none text-navy-foreground">
                  {start.meridiem}
                </span>
              )}
            </p>
          )}
          {photos.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-[3fr_2fr]">
              {photos.map((photo, idx) => (
                <PhotoSlot key={photo.src} photo={photo} className={cn('aspect-[2/1]', idx === 1 && 'sm:aspect-auto')} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="border-t-2 border-navy-foreground pt-5">
            <p className="flex flex-wrap items-center gap-3">
              <SectionIndex n={2} />
              <span className="font-mono-label text-navy-foreground/70">{t('home.joinTitle')}</span>
            </p>
            <h2 className="font-poster mt-4 text-6xl md:text-7xl">{t('about.serviceTimes')}</h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-navy-foreground/80">
              {t('home.subtitle')}
            </p>
          </div>

          <ul className="mt-8">
            {entries.map((entry, idx) => (
              <li
                key={idx}
                className="flex flex-col gap-1 border-t border-navy-foreground/25 py-4 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div>
                  <p className="font-hero text-xl font-black uppercase">{pickLocalized(entry, 'day')}</p>
                  {entry.note && (
                    <p className="text-sm text-navy-foreground/70">{pickLocalized(entry, 'note')}</p>
                  )}
                </div>
                <p className="font-hero text-2xl font-black text-accent sm:text-right">{entry.time}</p>
              </li>
            ))}
          </ul>

          <PosterLink to={ROUTES.about} tone="accent" className="mt-6 sm:w-full">
            {t('home.planVisit')} <ArrowRight className="h-5 w-5" />
          </PosterLink>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Photo wall (only renders when photos are configured)                */
/* ------------------------------------------------------------------ */

const GALLERY_LAYOUT = [
  'md:col-span-4 md:row-span-2',
  'md:col-span-2 md:row-span-3',
  'md:col-span-2 md:row-span-3',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2 md:row-span-3',
];

function PhotoWall() {
  const { t } = useLanguage();
  const photos = GALLERY_PHOTOS.filter((p) => p?.src);
  if (photos.length === 0) return null;
  return (
    <section className="bg-poster-grid border-b-2 border-foreground bg-background py-16 md:py-24">
      <Container>
        <PosterHeading index={3} title={t('home.galleryTitle')} />
        <div className="grid auto-rows-[9rem] grid-cols-2 gap-4 md:grid-cols-8">
          {photos.map((photo, idx) => (
            <PhotoSlot
              key={photo.src}
              photo={photo}
              className={cn('h-full', idx === 0 && 'col-span-2', GALLERY_LAYOUT[idx % GALLERY_LAYOUT.length])}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mission                                                             */
/* ------------------------------------------------------------------ */

const VALUE_OFFSETS = ['md:mt-0', 'md:mt-16', 'md:mt-4', 'md:mt-24'];

function Mission() {
  const { t, pickLocalized, language } = useLanguage();
  const { churchInfo } = useSiteSettings();
  const values = churchInfo.values || [];
  const hasPhoto = Boolean(MISSION_PHOTO?.src);

  return (
    <section className="bg-poster-grid border-b-2 border-foreground bg-background py-16 md:py-24">
      <Container>
        <p className="flex flex-wrap items-center gap-3">
          <SectionIndex n={n(4)} />
          <span className="font-mono-label text-muted-foreground">
            {language === 'am' ? 'ተልዕኮ' : 'Our mission'}
          </span>
        </p>
        <h2 className="font-poster mt-4 text-6xl text-primary md:text-8xl lg:text-9xl">
          {t('home.missionTitle')}
        </h2>
        <p className="mt-8 max-w-5xl font-hero text-3xl font-semibold leading-[1.08] tracking-tight text-balance md:text-5xl">
          {pickLocalized(churchInfo, 'missionStatement') || t('home.missionBody')}
        </p>
        <Link
          to={ROUTES.about}
          className="font-mono-label mt-8 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 hover:border-accent hover:text-accent"
        >
          {t('home.readStory')} <ChevronRight className="h-4 w-4" />
        </Link>

        <div className={cn('mt-16 grid gap-10', hasPhoto && 'lg:grid-cols-[1fr_22rem]')}>
          <ul className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {values.map((value, idx) => (
              <li
                key={`${value.title}-${idx}`}
                className={cn('border-t-2 border-foreground pt-4', VALUE_OFFSETS[idx % VALUE_OFFSETS.length])}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'font-poster text-8xl',
                      idx % 2 === 1 ? 'text-accent' : 'text-primary',
                    )}
                    aria-hidden="true"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <ValueIcon icon={value.icon} className={cn('mt-1 h-7 w-7', idx % 2 === 1 && 'text-accent')} />
                </div>
                <h3 className="mt-4 font-hero text-xl font-black uppercase leading-tight">
                  {pickLocalized(value, 'title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pickLocalized(value, 'desc')}
                </p>
              </li>
            ))}
          </ul>
          <PhotoSlot photo={MISSION_PHOTO} className="aspect-[4/5] lg:aspect-auto" />
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Events + sermons                                                    */
/* ------------------------------------------------------------------ */

function EventRow({ event }) {
  const { t, pickLocalized } = useLanguage();
  const date = toDate(event.date);
  const title = pickLocalized(event, 'title');
  const description = pickLocalized(event, 'description');
  const location = pickLocalized(event, 'location');

  return (
    <li className="border-t-2 border-foreground">
      <Link
        to={buildPath(ROUTES.eventDetail, { id: event.id })}
        className="group grid grid-cols-[5.5rem_1fr] items-start gap-x-5 gap-y-3 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[8rem_1fr_auto_8rem] md:items-center"
      >
        <div className="font-poster text-5xl text-primary md:text-6xl">
          {date ? formatDate(date, 'dd.MM') : '—'}
        </div>
        <div className="min-w-0">
          <h3 className="font-hero text-2xl font-black uppercase leading-tight transition-colors group-hover:text-accent">
            {title}
          </h3>
          {date && (
            <p className="font-mono-label mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(date)} · {formatTime(date)}
              </span>
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
            </p>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        <span className="font-mono-label col-start-2 inline-flex items-center gap-1.5 text-primary md:col-start-auto">
          {t('events.learnMore')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
        {event.imageUrl ? (
          <div className="duotone hidden aspect-[4/3] overflow-hidden bg-primary md:block">
            <img src={event.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ) : (
          <span className="hidden md:block" />
        )}
      </Link>
    </li>
  );
}

function Highlights() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getUpcomingEvents(3), getSermons(3)])
      .then(([evts, srms]) => {
        if (!active) return;
        setEvents(evts);
        setSermons(srms);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const viewAll = (to, label) => (
    <Link
      to={to}
      className="font-mono-label inline-flex items-center gap-2 border-b-2 border-foreground pb-1 hover:border-accent hover:text-accent"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </Link>
  );

  return (
    <>
      <section className="bg-poster-grid border-b-2 border-foreground bg-background py-16 md:py-24">
        <Container>
          <PosterHeading
            index={n(5)}
            eyebrow={t('home.upcomingEvents')}
            title={t('home.upcomingEvents')}
            actions={viewAll(ROUTES.events, t('home.viewAllEvents'))}
          />
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : events.length === 0 ? (
            <EmptyState icon={Calendar} title={t('home.noEvents')} />
          ) : (
            <ul className="border-b-2 border-foreground">
              {events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="border-b-2 border-foreground bg-secondary py-16 md:py-24">
        <Container>
          <PosterHeading
            index={n(6)}
            eyebrow={t('home.recentSermons')}
            title={t('home.recentSermons')}
            actions={viewAll(ROUTES.sermons, t('home.viewAllSermons'))}
          />
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : sermons.length === 0 ? (
            <EmptyState icon={PlayCircle} title={t('home.noSermons')} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

function ContactLab() {
  const { t, pickLocalized } = useLanguage();
  const { churchInfo } = useSiteSettings();

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');
  const cityLine = [churchInfo.city, churchInfo.state, churchInfo.zip].filter(Boolean).join(', ');

  const rowClass =
    'flex items-center justify-between gap-4 border-t-2 border-primary-foreground py-4 text-base font-semibold transition-colors hover:text-primary-foreground/80';

  return (
    <section className="bg-poster-grid border-b-2 border-foreground bg-background py-16 md:py-24">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="flex flex-wrap items-center gap-3">
            <SectionIndex n={n(7)} />
            <span className="font-mono-label text-muted-foreground">{t('home.contactLabEyebrow')}</span>
          </p>
          <h2 className="font-poster mt-4 text-6xl text-balance md:text-8xl">{t('home.contactLabTitle')}</h2>
          <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-muted-foreground">
            {t('home.contactLabLead')}
          </p>
        </div>

        <div className="flex flex-col bg-primary p-6 text-primary-foreground md:p-8 lg:col-span-7">
          <p className="font-mono-label text-primary-foreground/80">{t('home.contactLabAddressLabel')}</p>
          {churchInfo.address && (
            <p className="font-poster mt-4 text-6xl md:text-8xl">{churchInfo.address}</p>
          )}
          {cityLine && <p className="mt-3 text-lg font-semibold">{cityLine}</p>}

          {fullAddress && (
            <a
              href={toMapsHref(fullAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mt-6 block h-40 overflow-hidden border-2 border-primary-foreground/40 bg-[repeating-linear-gradient(0deg,transparent_0_46px,hsl(0_0%_100%/0.16)_46px_48px),repeating-linear-gradient(90deg,transparent_0_66px,hsl(0_0%_100%/0.16)_66px_68px)] md:h-48"
            >
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_8px_hsl(var(--accent)/0.35),0_0_0_20px_hsl(var(--accent)/0.15)]"
              />
              <span className="font-mono-label absolute bottom-3 left-3 inline-flex items-center gap-2 bg-foreground/60 px-2 py-1 group-hover:bg-foreground">
                <MapPin className="h-3.5 w-3.5" /> {t('home.contactLabDirections')} <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
          )}

          <div className="mt-8 flex items-center gap-4 border-t-2 border-primary-foreground pt-5">
            <PhotoSlot photo={PASTOR_PHOTO} duotone={false} className="h-16 w-16 shrink-0 rounded-full" />
            <div>
              <p className="font-mono-label text-primary-foreground/80">{t('home.contactLabPastorLabel')}</p>
              <p className="mt-1 font-hero text-2xl font-black uppercase">
                {pickLocalized(churchInfo, 'pastorName') || t('home.contactLabPastorFallback')}
              </p>
              {churchInfo.pastorRole && (
                <p className="text-sm text-primary-foreground/80">{pickLocalized(churchInfo, 'pastorRole')}</p>
              )}
            </div>
          </div>

          <div className="mt-5">
            {churchInfo.phone && (
              <a href={toTelHref(churchInfo.phone)} className={rowClass}>
                <Phone className="h-5 w-5 shrink-0" />
                <span className="text-right">{formatPhoneDisplay(churchInfo.phone)}</span>
              </a>
            )}
            {churchInfo.email && (
              <a href={toMailtoHref(churchInfo.email)} className={cn(rowClass, 'border-b-2')}>
                <Mail className="h-5 w-5 shrink-0" />
                <span className="break-all text-right">{churchInfo.email}</span>
              </a>
            )}
          </div>

          <PosterLink to={ROUTES.contact} tone="accent" className="mt-6 sm:w-full">
            {t('home.contactLabMessage')} <ArrowRight className="h-5 w-5" />
          </PosterLink>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

function CTA() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate overflow-hidden bg-accent py-16 text-accent-foreground md:py-24">
      <span
        aria-hidden="true"
        className="font-ethiopic pointer-events-none absolute -bottom-[0.3em] -right-[0.1em] -z-10 select-none text-[22rem] font-black leading-none text-accent-foreground/10 md:text-[34rem]"
      >
        ኢ
      </span>
      <Container className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <Heart className="mb-6 h-10 w-10" />
          <h2 className="font-poster text-balance text-6xl md:text-8xl lg:text-9xl">{t('home.ctaTitle')}</h2>
          <p className="mt-6 max-w-xl text-lg font-medium text-accent-foreground/90">{t('home.ctaText')}</p>
        </div>
        <PosterLink to={ROUTES.contact} tone="light">
          {t('home.ctaButton')} <ArrowRight className="h-5 w-5" />
        </PosterLink>
      </Container>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <MottoBand />
      <ServiceTimes />
      <PhotoWall />
      <Mission />
      <Highlights />
      <ContactLab />
      <CTA />
    </>
  );
}
