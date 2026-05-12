import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { submitChurchProfileUpdate } from '@/services/missingDataService';
import { ROUTES } from '@/constants/routes';

/**
 * "Help us complete the church profile" — a long form members can fill out
 * with up-to-date EEUCC contact / pastoral details that an admin then reviews.
 */
export default function ProfileUpdate() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { churchInfo } = useSiteSettings();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      churchName: churchInfo.name || '',
      address: churchInfo.address || '',
      city: churchInfo.city || '',
      state: churchInfo.state || '',
      zip: churchInfo.zip || '',
      phone: churchInfo.phone || '',
      email: churchInfo.email || '',
      pastorName: churchInfo.pastorName || '',
      pastorRole: churchInfo.pastorRole || '',
      facebookUrl: churchInfo.facebookUrl || '',
      youtubeUrl: churchInfo.youtubeUrl || '',
      notes: '',
    },
  });

  const onSubmit = async (values) => {
    setError('');
    setSubmitting(true);
    try {
      await submitChurchProfileUpdate(values, user);
      reset();
      setSuccessOpen(true);
    } catch (err) {
      setError(err?.message || (language === 'am' ? 'ስህተት ተከስቷል።' : 'Could not submit your update.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={language === 'am' ? 'መለያ' : 'Member'}
        title={language === 'am' ? 'የቤተክርስቲያን ፕሮፋይል ያስተካክሉ' : 'Help us keep EEUCC up to date'}
        subtitle={
          language === 'am'
            ? 'የቤተክርስቲያን መረጃ ካልታደሰ ይህን መልክት በመላክ እንዲታደስ ይረዳሉ።'
            : 'Submit corrections to our church profile and an admin will review them.'
        }
      />

      <Section containerSize="md">
        <Card>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <Fieldset legend={language === 'am' ? 'መሰረታዊ መረጃ' : 'Basic info'}>
                <FieldRow>
                  <Field label={language === 'am' ? 'የቤተክርስቲያን ስም' : 'Church name'} error={errors.churchName?.message}>
                    <Input
                      aria-invalid={Boolean(errors.churchName)}
                      {...register('churchName', { required: t('common.required') })}
                    />
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label={language === 'am' ? 'አድራሻ' : 'Street address'}>
                    <Input {...register('address')} />
                  </Field>
                </FieldRow>
                <FieldRow cols={3}>
                  <Field label={language === 'am' ? 'ከተማ' : 'City'}><Input {...register('city')} /></Field>
                  <Field label={language === 'am' ? 'ግዛት' : 'State'}><Input {...register('state')} /></Field>
                  <Field label="ZIP"><Input {...register('zip')} /></Field>
                </FieldRow>
                <FieldRow cols={2}>
                  <Field label={language === 'am' ? 'ስልክ' : 'Phone'}><Input type="tel" {...register('phone')} /></Field>
                  <Field label="Email"><Input type="email" {...register('email')} /></Field>
                </FieldRow>
              </Fieldset>

              <Fieldset legend={language === 'am' ? 'የፓስተር መረጃ' : 'Pastoral contact'}>
                <FieldRow cols={2}>
                  <Field label={language === 'am' ? 'ስም' : 'Pastor name'}><Input {...register('pastorName')} /></Field>
                  <Field label={language === 'am' ? 'ሚና' : 'Role / title'}><Input {...register('pastorRole')} /></Field>
                </FieldRow>
              </Fieldset>

              <Fieldset legend={language === 'am' ? 'በመስመር ላይ' : 'Online'}>
                <FieldRow cols={2}>
                  <Field label="Facebook URL"><Input type="url" {...register('facebookUrl')} /></Field>
                  <Field label="YouTube URL"><Input type="url" {...register('youtubeUrl')} /></Field>
                </FieldRow>
              </Fieldset>

              <Field label={language === 'am' ? 'ተጨማሪ ማስታወሻ' : 'Additional notes'}>
                <Textarea rows={4} {...register('notes')} placeholder={language === 'am' ? 'ሌላ ማንኛውም ማስታወሻ…' : 'Anything else we should know…'} />
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="ghost">
                  <Link to={ROUTES.about}>{language === 'am' ? 'ይቅር' : 'Cancel'}</Link>
                </Button>
                <Button type="submit" size="lg" disabled={submitting}>
                  <Send /> {submitting ? t('common.loading') : (language === 'am' ? 'መረጃ ላክ' : 'Submit update')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-center">
              {language === 'am' ? 'አመሰግናለሁ!' : 'Thank you!'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {language === 'am'
                ? 'መረጃዎ ደርሷል። አስተዳዳሪ ይገመግማል።'
                : 'Your update was received. An admin will review it shortly.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setSuccessOpen(false)}>
              {language === 'am' ? 'ዝጋ' : 'Close'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---------- Small inline form helpers (kept local; only used here) ---------- */

function Fieldset({ legend, children }) {
  return (
    <fieldset className="rounded-lg border border-border p-5">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {legend}
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function FieldRow({ cols = 1, children }) {
  const grid =
    cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';
  return <div className={`grid gap-4 ${grid}`}>{children}</div>;
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
