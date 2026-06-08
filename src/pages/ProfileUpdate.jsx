import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import MemberProfileForm from '@/components/common/MemberProfileForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const emptyProfile = {
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
};

export default function ProfileUpdate() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: emptyProfile,
  });

  useEffect(() => {
    if (!user) return;
    reset({
      ...emptyProfile,
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

            <MemberProfileForm
              email={user?.email || ''}
              register={register}
              errors={errors}
              onSubmit={handleSubmit(onSubmit)}
              submitting={submitting}
              error={error}
              footer={(
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="ghost">
                    <Link to={ROUTES.home}>{t('common.cancel')}</Link>
                  </Button>
                  <Button type="submit" size="lg" disabled={submitting}>
                    <Save className="h-4 w-4" />
                    {submitting ? t('common.loading') : t('profileUpdate.save')}
                  </Button>
                </div>
              )}
            />
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
