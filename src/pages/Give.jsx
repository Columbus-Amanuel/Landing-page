import { Banknote, Smartphone, ArrowLeftRight, Wallet, CreditCard, Heart, Briefcase, Quote, ExternalLink, Phone } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { toTelHref } from '@/lib/format';
import {
  cashAppPayUrl,
  zellePayUrl,
  venmoPayUrl,
  paypalPayUrl,
  onlineGivingPayUrl,
  isGivingMethodVisible,
} from '@/lib/givingLinks';

/**
 * US numbers stored as `614-999-2488` should dial with a country code.
 * @param {string} value
 */
function givingPhoneHref(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `tel:+1${digits}`;
  return toTelHref(value);
}

function MethodIcon({ icon: Icon }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </span>
  );
}

function PhoneLink({ number }) {
  return (
    <Button asChild variant="outline-primary" size="sm" className="mt-2 font-mono">
      <a href={givingPhoneHref(number)}>
        <Phone />
        {number}
      </a>
    </Button>
  );
}

function AppLink({ href, label }) {
  return (
    <Button asChild variant="outline-primary" size="sm" className="mt-2">
      <a href={href}>
        <ExternalLink />
        {label}
      </a>
    </Button>
  );
}

function GivingMethod({ icon, title, lines = [], href, linkLabel, children }) {
  return (
    <div className="flex items-start gap-3">
      <MethodIcon icon={icon} />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {children}
        {lines.filter(Boolean).map((line) => (
          <p key={line} className="mt-1 font-mono text-base font-semibold text-foreground">
            {line}
          </p>
        ))}
        {href && <AppLink href={href} label={linkLabel} />}
      </div>
    </div>
  );
}

export default function Give() {
  const { t, pickLocalized } = useLanguage();
  const { givingSettings } = useSiteSettings();
  const cashRaw = String(givingSettings.cashAppCashtag || '').trim();
  const cashTag = cashRaw.replace(/^\$/, '').split(/[/?#]/)[0];
  const cashHref = cashAppPayUrl(cashRaw);
  const venmoRaw = String(givingSettings.venmoUsername || '').trim();
  const venmoHref = venmoPayUrl(venmoRaw);
  const paypalRaw = String(givingSettings.paypalHandle || '').trim();
  const paypalHref = paypalPayUrl(paypalRaw);
  const onlineHref = onlineGivingPayUrl(givingSettings.onlineGivingUrl);
  const showCheck = isGivingMethodVisible(givingSettings.checkEnabled, givingSettings.checksPayableTo);
  const showCashApp = isGivingMethodVisible(givingSettings.cashAppEnabled, cashHref || givingSettings.cashAppNumber);
  const showZelle = isGivingMethodVisible(givingSettings.zelleEnabled, givingSettings.zelleNumber);
  const showVenmo = isGivingMethodVisible(givingSettings.venmoEnabled, venmoHref);
  const showPaypal = isGivingMethodVisible(givingSettings.paypalEnabled, paypalHref);
  const showOnline = isGivingMethodVisible(givingSettings.onlineGivingEnabled, onlineHref);
  const bare = (value) => !/^https?:\/\//i.test(value);

  return (
    <>
      <PageHero title={t('give.heroTitle')} subtitle={t('give.heroSubtitle')} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-6 p-8">
                <h2 className="font-display text-2xl font-semibold text-primary">
                  {t('give.waysToGive')}
                </h2>

                {showCheck && (
                  <GivingMethod icon={Banknote} title={t('give.check')}>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('give.checksPayable')}{' '}
                      <span className="font-medium text-foreground">{givingSettings.checksPayableTo}</span>
                    </p>
                  </GivingMethod>
                )}

                {showCashApp && (
                  <GivingMethod
                    icon={Smartphone}
                    title={t('give.cashApp')}
                    lines={[givingSettings.cashAppNumber, bare(cashRaw) && cashTag && `$${cashTag}`]}
                    href={cashHref}
                    linkLabel={t('give.openCashApp')}
                  />
                )}

                {showZelle && (
                  <GivingMethod
                    icon={ArrowLeftRight}
                    title={t('give.zelle')}
                    lines={[givingSettings.zelleNumber]}
                    href={zellePayUrl(givingSettings.zelleNumber, givingSettings.zelleName)}
                    linkLabel={t('give.openZelle')}
                  />
                )}

                {showVenmo && (
                  <GivingMethod
                    icon={Wallet}
                    title={t('give.venmo')}
                    lines={[bare(venmoRaw) && venmoHref && `@${venmoRaw.replace(/^@/, '').split(/[/?#]/)[0]}`]}
                    href={venmoHref}
                    linkLabel={t('give.openVenmo')}
                  />
                )}

                {showPaypal && (
                  <GivingMethod
                    icon={CreditCard}
                    title={t('give.paypal')}
                    lines={[bare(paypalRaw) && paypalHref && `paypal.me/${paypalRaw.replace(/^@/, '').replace(/^(www\.)?paypal\.me\//i, '').split(/[/?#]/)[0]}`]}
                    href={paypalHref}
                    linkLabel={t('give.openPaypal')}
                  />
                )}

                {showOnline && (
                  <GivingMethod
                    icon={Heart}
                    title={t('give.giveOnline')}
                    href={onlineHref}
                    linkLabel={t('give.giveOnline')}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-7">
                <div className="flex items-start gap-3">
                  <MethodIcon icon={Briefcase} />
                  <div>
                    <p className="font-semibold text-foreground">{t('give.plannedGiving')}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {pickLocalized(givingSettings, 'plannedGivingText')}
                    </p>
                    <PhoneLink number="614-999-2488" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-7">
                <Quote className="mb-4 h-6 w-6 text-accent" />
                <blockquote className="font-display text-lg italic leading-relaxed">
                  {pickLocalized(givingSettings, 'scriptureText')}
                </blockquote>
                <cite className="mt-4 block text-sm font-semibold not-italic text-accent">
                  — {pickLocalized(givingSettings, 'scriptureCite')}
                </cite>
              </CardContent>
            </Card>

            {givingSettings.funds?.length > 0 && (
              <Card>
                <CardContent className="space-y-3 p-7">
                  <h3 className="font-display text-lg font-semibold text-primary">
                    {t('give.whereGivingGoes')}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {givingSettings.funds.map((f) => (
                      <li key={f.id} className="flex items-start gap-2">
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 text-accent" />
                        <span>
                          <span className="font-semibold text-foreground">
                            {pickLocalized(f, 'label')}
                          </span>{' '}
                          — {pickLocalized(f, 'desc')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
