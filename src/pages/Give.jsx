import { useState } from 'react';
import { ExternalLink, Mail, Smartphone, Briefcase, Quote, Heart, ShieldCheck } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { AMOUNT_PRESETS, FREQUENCIES } from '@/constants/giving';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

function AmountChip({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        'rounded-md border border-border bg-card px-4 py-3 text-base font-semibold transition-all',
        'hover:border-primary/60 hover:text-primary',
        selected && 'border-primary bg-primary text-primary-foreground shadow-soft hover:text-primary-foreground',
      )}
    >
      {formatCurrency(value)}
    </button>
  );
}

export default function Give() {
  const { t, pickLocalized, language } = useLanguage();
  const { givingSettings } = useSiteSettings();
  const [fund, setFund] = useState(givingSettings.funds?.[0]?.id ?? 'general');
  const [frequency, setFrequency] = useState('oneTime');
  const [amount, setAmount] = useState(AMOUNT_PRESETS[1]);
  const [customAmount, setCustomAmount] = useState('');

  const selectedFund = givingSettings.funds?.find((f) => f.id === fund);
  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const onlineUrl = givingSettings.onlineGivingUrl;

  const handleGive = () => {
    if (onlineUrl) {
      const params = new URLSearchParams();
      if (effectiveAmount) params.set('amount', effectiveAmount);
      if (fund) params.set('fund', fund);
      if (frequency) params.set('frequency', frequency);
      const url = `${onlineUrl}${onlineUrl.includes('?') ? '&' : '?'}${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <PageHero title={t('give.heroTitle')} subtitle={t('give.heroSubtitle')} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* Online giving panel */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-3 pb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Heart className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    {t('give.giveOnline')}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('give.giveOnlineSubtitle')}
                  </p>
                </div>
              </div>

              {!onlineUrl && (
                <Alert variant="warning" className="mb-6">
                  <AlertDescription>{t('give.comingSoon')}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fund">{t('give.selectFund')}</Label>
                  <Select value={fund} onValueChange={setFund}>
                    <SelectTrigger id="fund">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(givingSettings.funds || []).map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {pickLocalized(f, 'label')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFund && (
                    <p className="text-xs text-muted-foreground">{pickLocalized(selectedFund, 'desc')}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Label>{t('give.frequency')}</Label>
                  <RadioGroup
                    value={frequency}
                    onValueChange={setFrequency}
                    className="grid grid-cols-3 gap-2"
                  >
                    {FREQUENCIES.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`freq-${opt.id}`}
                        className={cn(
                          'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors',
                          frequency === opt.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/60',
                        )}
                      >
                        <RadioGroupItem id={`freq-${opt.id}`} value={opt.id} className="sr-only" />
                        {t(opt.labelKey)}
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex flex-col gap-3">
                  <Label>{t('give.amount')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {AMOUNT_PRESETS.map((value) => (
                      <AmountChip
                        key={value}
                        value={value}
                        selected={!customAmount && amount === value}
                        onClick={(v) => {
                          setAmount(v);
                          setCustomAmount('');
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="customAmount" className="text-xs font-medium text-muted-foreground">
                      {t('give.customAmount')}
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input
                        id="customAmount"
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="1"
                        className="pl-7"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleGive} size="lg" variant="accent" disabled={!onlineUrl || !effectiveAmount}>
                  <Heart /> {t('give.giveNow')}{' '}
                  {effectiveAmount ? `· ${formatCurrency(effectiveAmount)}` : ''}
                </Button>

                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {language === 'am' ? 'ደህንነቱ የተጠበቀ ክፍያ።' : 'Secure, encrypted giving.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar: other ways */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-7">
                <h3 className="font-display text-xl font-semibold text-primary">
                  {t('give.otherWays')}
                </h3>

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{t('give.byMail')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('give.checksPayable')} <span className="font-medium text-foreground">{givingSettings.checksPayableTo}</span> {t('give.mailTo')}
                    </p>
                    <pre className="mt-2 whitespace-pre-line rounded-md bg-muted/40 p-3 text-xs text-foreground/90 font-sans">
                      {givingSettings.mailAddress}
                    </pre>
                  </div>
                </div>

                {givingSettings.textToGiveNumber && (
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Smartphone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{t('give.textToGive')}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Text <span className="font-mono font-semibold text-foreground">{givingSettings.textToGiveKeyword} [amount]</span> to{' '}
                        <span className="font-mono font-semibold text-foreground">{givingSettings.textToGiveNumber}</span>{' '}
                        {t('give.textInstruction')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{t('give.plannedGiving')}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {pickLocalized(givingSettings, 'plannedGivingText')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
