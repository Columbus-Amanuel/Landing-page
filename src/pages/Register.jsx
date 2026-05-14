import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';
import GoogleSignInButton from '@/components/common/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { registerUser, signInWithGoogle } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX } from '@/lib/validators';

export default function Register() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  if (user) {
    navigate(ROUTES.home, { replace: true });
    return null;
  }

  const password = watch('password');

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(values.email, values.password, values.displayName);
      navigate(ROUTES.home);
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setError(language === 'am' ? 'ይህ ኢሜል አስቀድሞ ተመዝግቧል።' : 'That email is already registered.');
      } else {
        setError(err?.message || (language === 'am' ? 'ስህተት ተከስቷል።' : 'Could not create your account.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await refreshProfile();
      navigate(ROUTES.home);
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      if (err?.code === 'auth/account-exists-with-different-credential') {
        setError(
          language === 'am'
            ? 'ይህ ኢሜል አስቀድሞ ተመዝግቧል። በመግቢያ ገጽ በኢሜል ይግቡ።'
            : 'This email is already registered. Sign in with email on the login page.',
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setError(
          language === 'am'
            ? 'ፖፕ አፕ ታግዷል። ብራውዘርዎ ፖፕ አፕን ይፈቅዱ።'
            : 'Pop-up was blocked. Allow pop-ups for this site and try again.',
        );
      } else {
        setError(err?.message || (language === 'am' ? 'ስህተት ተከስቷል።' : 'Could not create your account.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="absolute -left-32 -top-12 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 -bottom-12 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />

      <Card className="relative z-10 w-full max-w-md">
        <CardContent className="px-8 py-10 sm:px-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BrandCrossIcon size={28} />
            </span>
            <h1 className="font-hero text-3xl font-semibold text-primary">
              {language === 'am' ? 'መለያ ይክፈቱ' : 'Join our community'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'am'
                ? 'መለያ መክፈት ለቤተክርስቲያን አገልግሎቶች ይረዳዎታል።'
                : 'Create an account to engage with the church community.'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <GoogleSignInButton
              onClick={onGoogleSignIn}
              loading={googleLoading}
              disabled={loading}
              className="w-full"
            />
            <div className="relative flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('common.orContinueWith')}
              </span>
              <Separator className="flex-1" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">{language === 'am' ? 'ሙሉ ስም' : 'Full name'}</Label>
              <Input
                id="displayName"
                autoComplete="name"
                aria-invalid={Boolean(errors.displayName)}
                {...register('displayName', { required: t('common.required') })}
              />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: t('common.required'),
                  pattern: { value: EMAIL_REGEX, message: language === 'am' ? 'ትክክለኛ ኢሜል ያስገቡ።' : 'Enter a valid email.' },
                })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{language === 'am' ? 'ፓስወርድ' : 'Password'}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password', {
                  required: t('common.required'),
                  minLength: { value: 8, message: language === 'am' ? '8 ቁምፊዎች ቢያንስ።' : 'At least 8 characters.' },
                })}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">{language === 'am' ? 'ፓስወርድ ይድገሙ' : 'Confirm password'}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register('confirmPassword', {
                  required: t('common.required'),
                  validate: (value) =>
                    value === password ||
                    (language === 'am' ? 'ፓስወርዶች ተመሳሳይ መሆን አለባቸው።' : 'Passwords do not match.'),
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={loading || googleLoading} className="mt-2">
              <UserPlus /> {loading ? t('common.loading') : language === 'am' ? 'መለያ ክፈት' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {language === 'am' ? 'መለያ አለዎት?' : 'Already have an account?'}{' '}
              <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
                {t('common.signIn')}
              </Link>
            </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
