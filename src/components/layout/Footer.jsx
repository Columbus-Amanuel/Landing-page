import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ROUTES } from '@/constants/routes';
import { toMapsHref, toTelHref, toMailtoHref, formatPhoneDisplay } from '@/lib/format';
import { Separator } from '@/components/ui/separator';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';
import { FacebookIcon, YoutubeIcon, InstagramIcon } from '@/components/common/SocialIcons';

function FooterSocial({ href, label, icon: IconComponent }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent hover:bg-accent/15 hover:text-accent"
    >
      <IconComponent className="h-4 w-4" />
    </a>
  );
}

export default function Footer() {
  const { t, pickLocalized, language } = useLanguage();
  const { churchInfo, ministriesNav } = useSiteSettings();

  const addressLine = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <footer className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-grid opacity-[0.15]" aria-hidden="true" />
      <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to={ROUTES.home} className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <BrandCrossIcon className="text-accent" size={22} />
              {churchInfo.shortName || 'EEUCC'}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
              {pickLocalized(churchInfo, 'tagline')}
            </p>
            <div className="mt-5 flex gap-2">
              <FooterSocial href={churchInfo.facebookUrl} label="Facebook" icon={FacebookIcon} />
              <FooterSocial href={churchInfo.youtubeUrl} label="YouTube" icon={YoutubeIcon} />
              <FooterSocial href={churchInfo.instagramUrl} label="Instagram" icon={InstagramIcon} />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {language === 'am' ? 'አገናኞች' : 'Explore'}
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-primary-foreground/80">
              <li><Link to={ROUTES.about} className="transition-colors hover:text-accent">{t('nav.about')}</Link></li>
              <li><Link to={ROUTES.sermons} className="transition-colors hover:text-accent">{t('nav.sermons')}</Link></li>
              <li><Link to={ROUTES.events} className="transition-colors hover:text-accent">{t('nav.events')}</Link></li>
              {ministriesNav.map((item) => (
                <li key={item.key}>
                  <Link to={item.to} className="transition-colors hover:text-accent">
                    {language === 'am' && item.labelAm ? item.labelAm : item.labelEn}
                  </Link>
                </li>
              ))}
              <li><Link to={ROUTES.give} className="transition-colors hover:text-accent">{t('nav.give')}</Link></li>
              <li><Link to={ROUTES.contact} className="transition-colors hover:text-accent">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Service times */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t('about.serviceTimes')}
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-primary-foreground/80">
              {(churchInfo.serviceTimes || []).map((entry, idx) => (
                <li key={`${entry.day}-${idx}`} className="flex flex-col gap-0.5">
                  <span className="font-semibold text-primary-foreground">
                    {pickLocalized(entry, 'day')}
                  </span>
                  <span>{entry.time}</span>
                  {entry.note && (
                    <span className="text-xs text-primary-foreground/60">
                      {pickLocalized(entry, 'note')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Visit */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {language === 'am' ? 'ይጎብኙን' : 'Visit'}
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {addressLine && (
                <li className="flex items-start gap-2 text-primary-foreground/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a
                    href={toMapsHref(addressLine)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    {addressLine}
                  </a>
                </li>
              )}
              {churchInfo.phone && (
                <li className="flex items-center gap-2 text-primary-foreground/80">
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  <a href={toTelHref(churchInfo.phone)} className="hover:text-accent">
                    {formatPhoneDisplay(churchInfo.phone)}
                  </a>
                </li>
              )}
              {churchInfo.email && (
                <li className="flex items-center gap-2 text-primary-foreground/80">
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  <a href={toMailtoHref(churchInfo.email)} className="hover:text-accent">
                    {churchInfo.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-primary-foreground/15" />

        <div className="flex flex-col items-start gap-3 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {churchInfo.name}. {language === 'am' ? 'መብቱ የተጠበቀ ነው።' : 'All rights reserved.'}</p>
          <p className="font-display text-sm tracking-wide text-primary-foreground/75">
            {language === 'am' ? 'በፍቅርና በሰላም' : 'In love and peace'}
          </p>
        </div>
      </div>
    </footer>
  );
}
