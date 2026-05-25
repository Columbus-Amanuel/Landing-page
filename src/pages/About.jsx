import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { FacebookIcon, YoutubeIcon, InstagramIcon } from '@/components/common/SocialIcons';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import Container from '@/components/common/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ROUTES } from '@/constants/routes';
import { toMapsHref, toTelHref, toMailtoHref, formatPhoneDisplay } from '@/lib/format';

function BeliefCard({ belief }) {
  const { pickLocalized } = useLanguage();
  return (
    <Card className="h-full border-l-4 border-l-accent">
      <CardContent className="p-6">
        <h3 className="font-display text-xl font-semibold text-primary">
          {pickLocalized(belief, 'title')}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pickLocalized(belief, 'desc')}
        </p>
      </CardContent>
    </Card>
  );
}

export default function About() {
  const { t, pickLocalized, language } = useLanguage();
  const { churchInfo } = useSiteSettings();

  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <PageHero title={t('about.heroTitle')} subtitle={t('about.heroSubtitle')} />

      {/* Our Story */}
      <Section
        eyebrow={language === 'am' ? 'ታሪካችን' : 'Our story'}
        title={t('about.ourStory')}
        containerSize="md"
      >
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>{pickLocalized(churchInfo, 'storyPara1')}</p>
          <p>{pickLocalized(churchInfo, 'storyPara2')}</p>
        </div>
      </Section>

      {/* Beliefs */}
      <Section
        tone="muted"
        eyebrow={language === 'am' ? 'እምነቶቻችን' : 'What anchors us'}
        title={t('about.whatWeBelieve')}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(churchInfo.beliefs || []).map((belief, idx) => (
            <BeliefCard key={`${belief.title}-${idx}`} belief={belief} />
          ))}
        </div>
      </Section>

      {/* Worship & Contact */}
      <Section
        eyebrow={language === 'am' ? 'ይጎብኙን' : 'Visit us'}
        title={t('about.worshipContact')}
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t('about.serviceTimes')}
              </h3>
              <ul className="mt-3 space-y-2">
                {(churchInfo.serviceTimes || []).map((s, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {pickLocalized(s, 'day')}
                    </span>
                    <span className="text-muted-foreground">— {s.time}</span>
                    {s.note && (
                      <span className="text-xs text-muted-foreground">
                        ({pickLocalized(s, 'note')})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {fullAddress && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {t('about.address')}
                </h3>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={toMapsHref(fullAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {fullAddress}
                  </a>
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {churchInfo.phone && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t('about.phone')}
                  </h3>
                  <a
                    href={toTelHref(churchInfo.phone)}
                    className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    {formatPhoneDisplay(churchInfo.phone)}
                  </a>
                </div>
              )}
              {churchInfo.email && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t('about.email')}
                  </h3>
                  <a
                    href={toMailtoHref(churchInfo.email)}
                    className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    {churchInfo.email}
                  </a>
                </div>
              )}
            </div>

            {(churchInfo.facebookUrl || churchInfo.youtubeUrl || churchInfo.instagramUrl) && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {t('about.online')}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {churchInfo.facebookUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={churchInfo.facebookUrl} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon className="h-4 w-4" /> {t('about.facebook')}
                      </a>
                    </Button>
                  )}
                  {churchInfo.youtubeUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={churchInfo.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <YoutubeIcon className="h-4 w-4" /> {t('about.youtube')}
                      </a>
                    </Button>
                  )}
                  {churchInfo.instagramUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={churchInfo.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <InstagramIcon className="h-4 w-4" /> Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Card className="overflow-hidden p-0">
            {fullAddress ? (
              <iframe
                title="Map"
                className="h-full min-h-[24rem] w-full"
                src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full min-h-[24rem] items-center justify-center bg-muted/50 text-sm text-muted-foreground">
                {t('about.missingDetails')}
              </div>
            )}
          </Card>
        </div>

        <Container className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">{t('about.missingDetails')}</p>
          <Button asChild variant="link" className="mt-1">
            <Link to={ROUTES.profileUpdate}>{t('about.completeProfile')} →</Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
