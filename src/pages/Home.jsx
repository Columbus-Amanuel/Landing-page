import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Heart,
  MapPin,
  Phone,
  PlayCircle,
  Sparkles,
  UserCircle2,
  PhoneCall,
  Mail,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import Section from '@/components/common/Section';
import EventCard from '@/components/common/EventCard';
import SermonCard from '@/components/common/SermonCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ValueIcon from '@/components/common/ValueIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { getUpcomingEvents } from '@/services/eventsService';
import { getSermons } from '@/services/sermonsService';
import { submitContactForm } from '@/services/contactService';
import { ROUTES } from '@/constants/routes';
import {
  toMapsHref,
  toTelHref,
  toMailtoHref,
  formatPhoneDisplay,
} from '@/lib/format';
import { isValidPhone } from '@/lib/validators';
import { getYoutubeEmbedUrl } from '@/lib/youtube';
import { cn } from '@/lib/utils';

const DEFAULT_HERO_YOUTUBE_VIDEO_ID = '9tFh_EwJWdc';
const HERO_CALLBACK_PLACEHOLDER_EMAIL = 'not-provided@example.com';

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
        <Button variant="outline" size="lg" className="bg-white/90 text-foreground backdrop-blur hover:bg-white">
          <PhoneCall /> {t('home.heroLetUsCallYou')}
        </Button>
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
    <section className="relative isolate overflow-hidden bg-foreground text-background">
      {/* Background video layer (always rendered; opacity flips when toggled) */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          title={t('home.heroVideoTitle')}
          className={cn(
            // 16:9 embed scaled to cover the hero (crops on narrow / portrait viewports)
            'absolute left-1/2 top-1/2 aspect-video h-full min-h-full w-auto min-w-full max-w-none -translate-x-1/2 -translate-y-1/2',
            'transition-opacity duration-700',
            videoOpen ? 'opacity-90' : 'opacity-30',
          )}
          src={heroVideoUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            videoOpen
              ? 'bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/40'
              : 'bg-gradient-to-br from-foreground/85 via-primary/40 to-foreground/85',
          )}
          aria-hidden="true"
        />
      </div>

      <Container className="relative grid min-h-[78svh] grid-cols-1 items-center gap-12 py-24 md:min-h-[88svh]">
        <div
          className={cn(
            'max-w-3xl transition-all duration-500',
            videoOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          <Badge variant="accent" className="mb-5 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em]">
            <Sparkles className="h-3 w-3" />
            {t('home.prewelcome')}
          </Badge>
          <h1 className="font-hero text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-white md:text-6xl lg:text-7xl">
            {t('home.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/85 md:text-xl">
            {t('home.subtitle')}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link to={ROUTES.about}>
                {t('home.aboutBtn')} <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-foreground">
              <Link to={ROUTES.sermons}>
                <PlayCircle /> {t('home.sermonsBtn')}
              </Link>
            </Button>
            <HeroCallbackDialog />
          </div>

          {/* Meta chips: address + service time */}
          <div className="mt-10 flex flex-wrap gap-2">
            {fullAddress && (
              <a
                href={toMapsHref(fullAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur hover:border-white/40 hover:bg-white/20"
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {fullAddress}
              </a>
            )}
            {churchInfo.phone && (
              <a
                href={toTelHref(churchInfo.phone)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur hover:border-white/40 hover:bg-white/20"
              >
                <Phone className="h-3.5 w-3.5 text-accent" />
                {formatPhoneDisplay(churchInfo.phone)}
              </a>
            )}
          </div>
        </div>
      </Container>

      {/* Video toggle, top right */}
      <div className="absolute right-4 top-24 z-10 md:right-8 md:top-28">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setVideoOpen((v) => !v)}
          aria-pressed={videoOpen}
          className="rounded-full border border-white/30 bg-foreground/40 text-white backdrop-blur hover:bg-foreground/60 hover:text-white"
        >
          {videoOpen ? <Pause /> : <PlayCircle />}
          <span className="hidden md:inline">
            {videoOpen ? t('home.hideVideoBtn') : t('home.showVideoBtn')}
          </span>
        </Button>
      </div>

      {/* Subtle bottom curve */}
      <svg
        className="pointer-events-none absolute -bottom-px left-0 right-0 h-12 w-full text-background"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function ServiceTimes() {
  const { t, pickLocalized } = useLanguage();
  const { churchInfo } = useSiteSettings();
  return (
    <Section
      eyebrow={t('home.joinTitle')}
      title={t('about.serviceTimes')}
      description={t('home.subtitle')}
    >
      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        {(churchInfo.serviceTimes || []).map((entry, idx) => (
          <Card key={idx} className="border-t-4 border-t-accent text-center">
            <CardContent className="space-y-2 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {pickLocalized(entry, 'day')}
              </p>
              <p className="font-hero text-3xl font-semibold text-primary">{entry.time}</p>
              {entry.note && (
                <p className="text-sm text-muted-foreground">{pickLocalized(entry, 'note')}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Button asChild size="lg">
          <Link to={ROUTES.about}>
            {t('home.planVisit')} <ArrowRight />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function Mission() {
  const { t, pickLocalized, language } = useLanguage();
  const { churchInfo } = useSiteSettings();
  return (
    <Section tone="muted">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {language === 'am' ? 'ተልዕኮ' : 'Our mission'}
          </p>
          <h2 className="font-hero text-3xl font-semibold tracking-tight text-balance text-primary md:text-4xl lg:text-5xl">
            {t('home.missionTitle')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {pickLocalized(churchInfo, 'missionStatement') || t('home.missionBody')}
          </p>
          <Button asChild variant="link" className="mt-4 px-0 text-base">
            <Link to={ROUTES.about}>
              {t('home.readStory')} <ChevronRight />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {(churchInfo.values || []).map((value, idx) => (
            <li key={`${value.title}-${idx}`}>
              <Card className="h-full transition-all hover:border-primary/40 hover:shadow-soft">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ValueIcon icon={value.icon} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-primary">
                      {pickLocalized(value, 'title')}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {pickLocalized(value, 'desc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function ContactLab() {
  const { t, pickLocalized } = useLanguage();
  const { churchInfo } = useSiteSettings();

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="relative isolate overflow-hidden bg-foreground py-20 text-background md:py-24">
      <div className="absolute inset-0 bg-grid opacity-[0.12]" aria-hidden="true" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" aria-hidden="true" />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {t('home.contactLabEyebrow')}
          </p>
          <h2 className="font-hero text-3xl font-semibold text-balance md:text-4xl lg:text-5xl">
            {t('home.contactLabTitle')}
          </h2>
          <p className="mt-4 text-base text-background/75 md:text-lg">
            {t('home.contactLabLead')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Address card */}
          <Card className="border-white/10 bg-white/5 text-background backdrop-blur-md">
            <CardContent className="space-y-6 p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t('home.contactLabAddressLabel')}
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug">
                    {fullAddress}
                  </p>
                </div>
              </div>
              {fullAddress && (
                <Button asChild variant="outline" className="border-white/30 bg-white/5 text-background hover:bg-white hover:text-foreground">
                  <a href={toMapsHref(fullAddress)} target="_blank" rel="noopener noreferrer">
                    <MapPin /> {t('home.contactLabDirections')}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pastor card */}
          <Card className="border-white/10 bg-white/5 text-background backdrop-blur-md">
            <CardContent className="space-y-6 p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/30 text-primary-foreground">
                  <UserCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t('home.contactLabPastorLabel')}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    {pickLocalized(churchInfo, 'pastorName') || t('home.contactLabPastorFallback')}
                  </p>
                  {churchInfo.pastorRole && (
                    <p className="text-sm text-background/70">
                      {pickLocalized(churchInfo, 'pastorRole')}
                    </p>
                  )}
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                {churchInfo.phone && (
                  <li>
                    <a
                      href={toTelHref(churchInfo.phone)}
                      className="flex items-center gap-3 rounded-md border border-white/10 bg-foreground/40 px-4 py-3 text-sm font-medium transition-colors hover:border-accent/60 hover:bg-foreground/60"
                    >
                      <Phone className="h-4 w-4 text-accent" />
                      {formatPhoneDisplay(churchInfo.phone)}
                    </a>
                  </li>
                )}
                {churchInfo.email && (
                  <li>
                    <a
                      href={toMailtoHref(churchInfo.email)}
                      className="flex items-center gap-3 rounded-md border border-white/10 bg-foreground/40 px-4 py-3 text-sm font-medium transition-colors hover:border-accent/60 hover:bg-foreground/60"
                    >
                      <Mail className="h-4 w-4 text-accent" />
                      {churchInfo.email}
                    </a>
                  </li>
                )}
              </ul>
              <Button asChild variant="accent" className="w-full">
                <Link to={ROUTES.contact}>{t('home.contactLabMessage')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
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

  return (
    <>
      <Section
        eyebrow={t('home.upcomingEvents')}
        title={t('home.upcomingEvents')}
        headerActions={
          <Button asChild variant="link">
            <Link to={ROUTES.events}>
              {t('home.viewAllEvents')} <ArrowRight />
            </Link>
          </Button>
        }
      >
        {loading ? (
          <LoadingSpinner size="lg" center />
        ) : events.length === 0 ? (
          <EmptyState icon={Calendar} title={t('home.noEvents')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </Section>

      <Section
        tone="muted"
        eyebrow={t('home.recentSermons')}
        title={t('home.recentSermons')}
        headerActions={
          <Button asChild variant="link">
            <Link to={ROUTES.sermons}>
              {t('home.viewAllSermons')} <ArrowRight />
            </Link>
          </Button>
        }
      >
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
      </Section>
    </>
  );
}

function CTA() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate overflow-hidden bg-primary py-20 text-center text-primary-foreground md:py-24">
      <div className="absolute inset-0 bg-grid opacity-15" aria-hidden="true" />
      <Container className="relative">
        <Heart className="mx-auto mb-4 h-10 w-10 text-accent" />
        <h2 className="font-hero text-3xl font-semibold text-balance md:text-4xl lg:text-5xl">
          {t('home.ctaTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
          {t('home.ctaText')}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="accent">
            <Link to={ROUTES.contact}>
              {t('home.ctaButton')} <ArrowRight />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceTimes />
      <Mission />
      <Highlights />
      <ContactLab />
      <CTA />
    </>
  );
}
