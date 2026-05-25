import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
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
import { saveMemberProfile } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { getRoleAbbrev } from '@/lib/roles';

export default function ProfileUpdate() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      displayName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      dateOfBirth: '',
      occupation: '',
      ministryInterests: '',
      bio: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      displayName: profile?.displayName || user.displayName || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zip: profile?.zip || '',
      dateOfBirth: profile?.dateOfBirth || '',
      occupation: profile?.occupation || '',
      ministryInterests: profile?.ministryInterests || '',
      bio: profile?.bio || '',
      emergencyContactName: profile?.emergencyContactName || '',
      emergencyContactPhone: profile?.emergencyContactPhone || '',
    });
  }, [user, profile, reset]);

  const onSubmit = async (values) => {
    if (!user) return;
    setError('');
    setSubmitting(true);
    try {
      await saveMemberProfile(user, values);
      await refreshProfile();
      setSuccessOpen(true);
    } catch (err) {
      setError(err?.message || t('profileUpdate.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={t('profileUpdate.eyebrow')}
        title={t('profileUpdate.title')}
        subtitle={t('profileUpdate.subtitle')}
      />

      <Section containerSize="md">
        <Card>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* TEMPORARY: role letter — m member, a admin, s super-admin; remove when no longer needed */}
            <p className="mb-6 text-xs text-muted-foreground">
              <span className="me-2">Role</span>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/50 font-mono text-sm font-semibold text-foreground"
                title="m = member, a = admin, s = super-admin"
              >
                {getRoleAbbrev(profile?.role)}
              </span>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
              <Fieldset legend={t('profileUpdate.sectionAccount')}>
                <FieldRow>
                  <Field label={t('profileUpdate.fullName')} error={errors.displayName?.message}>
                    <Input
                      autoComplete="name"
                      aria-invalid={Boolean(errors.displayName)}
                      {...register('displayName', { required: t('common.required') })}
                    />
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label={t('profileUpdate.email')}>
                    <Input value={user?.email || ''} disabled readOnly className="bg-muted/50" />
                  </Field>
                </FieldRow>
              </Fieldset>

              <Fieldset legend={t('profileUpdate.sectionContact')}>
                <FieldRow>
                  <Field label={t('profileUpdate.phone')}>
                    <Input type="tel" autoComplete="tel" {...register('phone')} />
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label={t('profileUpdate.street')}>
                    <Input autoComplete="street-address" {...register('address')} />
                  </Field>
                </FieldRow>
                <FieldRow cols={3}>
                  <Field label={t('profileUpdate.city')}><Input autoComplete="address-level2" {...register('city')} /></Field>
                  <Field label={t('profileUpdate.state')}><Input autoComplete="address-level1" {...register('state')} /></Field>
                  <Field label={t('profileUpdate.zip')}><Input autoComplete="postal-code" {...register('zip')} /></Field>
                </FieldRow>
              </Fieldset>

              <Fieldset legend={t('profileUpdate.sectionPersonal')}>
                <FieldRow cols={2}>
                  <Field label={t('profileUpdate.dateOfBirth')}>
                    <Input type="date" {...register('dateOfBirth')} />
                  </Field>
                  <Field label={t('profileUpdate.occupation')}>
                    <Input {...register('occupation')} />
                  </Field>
                </FieldRow>
                <Field label={t('profileUpdate.bio')}>
                  <Textarea rows={3} {...register('bio')} placeholder={t('profileUpdate.bioPlaceholder')} />
                </Field>
                <Field label={t('profileUpdate.ministryInterests')}>
                  <Textarea rows={3} {...register('ministryInterests')} placeholder={t('profileUpdate.ministryPlaceholder')} />
                </Field>
              </Fieldset>

              <Fieldset legend={t('profileUpdate.sectionEmergency')}>
                <FieldRow cols={2}>
                  <Field label={t('profileUpdate.emergencyName')}>
                    <Input {...register('emergencyContactName')} />
                  </Field>
                  <Field label={t('profileUpdate.emergencyPhone')}>
                    <Input type="tel" {...register('emergencyContactPhone')} />
                  </Field>
                </FieldRow>
              </Fieldset>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="ghost">
                  <Link to={ROUTES.home}>{t('common.cancel')}</Link>
                </Button>
                <Button type="submit" size="lg" disabled={submitting}>
                  <Save className="h-4 w-4" />
                  {submitting ? t('common.loading') : t('profileUpdate.save')}
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
              {t('profileUpdate.successTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('profileUpdate.successBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setSuccessOpen(false)}>
              {t('profileUpdate.successClose')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
