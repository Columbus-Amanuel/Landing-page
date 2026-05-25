import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CheckCircle2, Mail, Phone, MapPin, Clock, Send, HeartHandshake } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitContactForm, submitPrayerRequest } from '@/services/contactService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { EMAIL_REGEX } from '@/lib/validators';
import { toMapsHref, toMailtoHref, toTelHref, formatPhoneDisplay } from '@/lib/format';

const SUBJECT_OPTIONS = [
  { value: 'general', labelEn: 'General Inquiry', labelAm: 'አጠቃላይ ጥያቄ' },
  { value: 'visit', labelEn: 'Planning a visit', labelAm: 'ጉብኝት ማቀድ' },
  { value: 'pastoral', labelEn: 'Pastoral care', labelAm: 'የፓስተር አገልግሎት' },
  { value: 'volunteer', labelEn: 'Volunteer', labelAm: 'በበጎ ፈቃደኝነት' },
  { value: 'other', labelEn: 'Other', labelAm: 'ሌላ' },
];

function ContactInfoItem({ icon: IconComponent, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <IconComponent className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function ContactInfo() {
  const { t, pickLocalized, language } = useLanguage();
  const { churchInfo } = useSiteSettings();
  const fullAddress = [churchInfo.address, churchInfo.city, churchInfo.state, churchInfo.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="bg-muted/40">
      <CardContent className="space-y-5 p-7">
        <h3 className="font-display text-xl font-semibold text-primary">
          {t('contact.getInTouch')}
        </h3>

        {fullAddress && (
          <ContactInfoItem icon={MapPin} label={t('contact.address')}>
            <a href={toMapsHref(fullAddress)} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              {fullAddress}
            </a>
          </ContactInfoItem>
        )}

        {churchInfo.phone && (
          <ContactInfoItem icon={Phone} label={t('contact.phone')}>
            <a href={toTelHref(churchInfo.phone)} className="hover:text-primary">
              {formatPhoneDisplay(churchInfo.phone)}
            </a>
          </ContactInfoItem>
        )}

        {churchInfo.email && (
          <ContactInfoItem icon={Mail} label={t('contact.email')}>
            <a href={toMailtoHref(churchInfo.email)} className="hover:text-primary">
              {churchInfo.email}
            </a>
          </ContactInfoItem>
        )}

        <ContactInfoItem icon={Clock} label={t('contact.serviceTimes')}>
          <ul className="space-y-1">
            {(churchInfo.serviceTimes || []).map((s, idx) => (
              <li key={idx}>
                <span className="font-semibold">{pickLocalized(s, 'day')}</span> · {s.time}
              </li>
            ))}
          </ul>
        </ContactInfoItem>

        {churchInfo.pastorName && (
          <ContactInfoItem icon={HeartHandshake} label={language === 'am' ? 'የፓስተር አገልግሎት' : 'Pastoral contact'}>
            <p className="font-semibold">{pickLocalized(churchInfo, 'pastorName')}</p>
            <p className="text-muted-foreground">{pickLocalized(churchInfo, 'pastorRole')}</p>
          </ContactInfoItem>
        )}
      </CardContent>
    </Card>
  );
}

export default function Contact() {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('contact');
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const contactForm = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: 'general',
      message: '',
    },
  });

  const prayerForm = useForm({
    defaultValues: { name: '', email: '', request: '', isPrivate: false },
  });

  const onContactSubmit = async (values) => {
    setSubmitting(true);
    try {
      await submitContactForm(values);
      setSubmitted('contact');
      contactForm.reset();
      toast.success(t('contact.contactThanks'));
    } catch {
      toast.error(language === 'am' ? 'መልዕክት መላክ አልተቻለም።' : 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  const onPrayerSubmit = async (values) => {
    setSubmitting(true);
    try {
      await submitPrayerRequest(values);
      setSubmitted('prayer');
      prayerForm.reset();
      toast.success(t('contact.prayerThanks'));
    } catch {
      toast.error(language === 'am' ? 'ጥያቄ መላክ አልተቻለም።' : 'Could not submit your prayer request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PageHero title={t('contact.thankYouTitle')} />
        <Section containerSize="md">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 px-8 py-16 text-center">
              <CheckCircle2 className="h-14 w-14 text-success" />
              <h2 className="font-display text-2xl font-semibold text-primary">
                {t('contact.thankYouTitle')}
              </h2>
              <p className="max-w-md text-muted-foreground">
                {submitted === 'contact' ? t('contact.contactThanks') : t('contact.prayerThanks')}
              </p>
              <Button onClick={() => setSubmitted(null)} className="mt-2">
                {t('contact.sendAnother')}
              </Button>
            </CardContent>
          </Card>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero title={t('contact.heroTitle')} subtitle={t('contact.heroSubtitle')} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <Card>
            <CardContent className="p-8">
              <Tabs value={mode} onValueChange={setMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact">{t('contact.contactTab')}</TabsTrigger>
                  <TabsTrigger value="prayer">{t('contact.prayerTab')}</TabsTrigger>
                </TabsList>

                <TabsContent value="contact">
                  <form
                    onSubmit={contactForm.handleSubmit(onContactSubmit)}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="firstName">
                          {language === 'am' ? 'ስም' : 'First name'}
                        </Label>
                        <Input
                          id="firstName"
                          aria-invalid={Boolean(contactForm.formState.errors.firstName)}
                          {...contactForm.register('firstName', { required: t('common.required') })}
                        />
                        {contactForm.formState.errors.firstName && (
                          <p className="text-xs text-destructive">
                            {contactForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="lastName">
                          {language === 'am' ? 'የአባት ስም' : 'Last name'}
                        </Label>
                        <Input
                          id="lastName"
                          aria-invalid={Boolean(contactForm.formState.errors.lastName)}
                          {...contactForm.register('lastName', { required: t('common.required') })}
                        />
                        {contactForm.formState.errors.lastName && (
                          <p className="text-xs text-destructive">
                            {contactForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          aria-invalid={Boolean(contactForm.formState.errors.email)}
                          {...contactForm.register('email', {
                            required: t('common.required'),
                            pattern: { value: EMAIL_REGEX, message: language === 'am' ? 'ትክክለኛ ኢሜል ያስገቡ።' : 'Enter a valid email.' },
                          })}
                        />
                        {contactForm.formState.errors.email && (
                          <p className="text-xs text-destructive">
                            {contactForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">{language === 'am' ? 'ስልክ (አማራጭ)' : 'Phone (optional)'}</Label>
                        <Input id="phone" type="tel" {...contactForm.register('phone')} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="subject">{language === 'am' ? 'ርዕስ' : 'Subject'}</Label>
                      <Select
                        defaultValue="general"
                        onValueChange={(v) => contactForm.setValue('subject', v)}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {language === 'am' ? opt.labelAm : opt.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message">{language === 'am' ? 'መልዕክት' : 'Message'}</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        aria-invalid={Boolean(contactForm.formState.errors.message)}
                        {...contactForm.register('message', { required: t('common.required') })}
                      />
                      {contactForm.formState.errors.message && (
                        <p className="text-xs text-destructive">
                          {contactForm.formState.errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" size="lg" disabled={submitting}>
                      <Send /> {submitting ? t('contact.sending') : t('contact.sendMessage')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="prayer">
                  <form
                    onSubmit={prayerForm.handleSubmit(onPrayerSubmit)}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="prayerName">{language === 'am' ? 'ሙሉ ስም' : 'Your name'}</Label>
                      <Input
                        id="prayerName"
                        aria-invalid={Boolean(prayerForm.formState.errors.name)}
                        {...prayerForm.register('name', { required: t('common.required') })}
                      />
                      {prayerForm.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {prayerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="prayerEmail">{language === 'am' ? 'ኢሜል (አማራጭ)' : 'Email (optional)'}</Label>
                      <Input id="prayerEmail" type="email" {...prayerForm.register('email')} />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="request">{language === 'am' ? 'ጥያቄዎ' : 'Your request'}</Label>
                      <Textarea
                        id="request"
                        rows={6}
                        aria-invalid={Boolean(prayerForm.formState.errors.request)}
                        {...prayerForm.register('request', { required: t('common.required') })}
                      />
                      {prayerForm.formState.errors.request && (
                        <p className="text-xs text-destructive">
                          {prayerForm.formState.errors.request.message}
                        </p>
                      )}
                    </div>

                    <label className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
                      <Checkbox
                        id="isPrivate"
                        onCheckedChange={(checked) => prayerForm.setValue('isPrivate', Boolean(checked))}
                      />
                      <span className="text-muted-foreground">
                        {language === 'am'
                          ? 'ጥያቄዬ በምስጢር ይያዝ።'
                          : 'Keep this request private — only the pastoral team will see it.'}
                      </span>
                    </label>

                    <Button type="submit" size="lg" disabled={submitting}>
                      <Send /> {submitting ? t('contact.submitting') : t('contact.submitPrayer')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <ContactInfo />
        </div>
      </Section>
    </>
  );
}
