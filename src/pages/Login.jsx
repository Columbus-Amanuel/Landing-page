import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Separator } from '@/components/ui/separator';
import GoogleSignInButton from '@/components/common/GoogleSignInButton';
import { loginUser, resetPassword, signInWithGoogle } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { EMAIL_REGEX } from '@/lib/validators';

export default function Login() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (user) {
    navigate(ROUTES.home, { replace: true });
    return null;
  }

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(values.email, values.password);
        navigate(ROUTES.home);
      } else {
        await resetPassword(values.email);
        setResetSent(true);
      }
    } catch (err) {
      setError(err?.message || (language === 'am' ? 'ስህተት ተከስቷል።' : 'Something went wrong.'));
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
            ? 'ይህ ኢሜል በሌላ መንገድ ተመዝግቧል። በኢሜል እና ፓስወርድ ይግቡ።'
            : 'This email is already registered with email/password. Sign in with email instead.',
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setError(
          language === 'am'
            ? 'ፖፕ አፕ ታግዷል። ብራውዘርዎ ፖፕ አፕን ይፈቅዱ።'
            : 'Pop-up was blocked. Allow pop-ups for this site and try again.',
        );
      } else {
        setError(err?.message || (language === 'am' ? 'ስህተት ተከስቷል።' : 'Something went wrong.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="absolute -left-32 top-12 h-96 w-96 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 -bottom-12 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

      <Card className="relative z-10 w-full max-w-md">
        <CardContent className="px-8 py-10 sm:px-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BrandCrossIcon size={28} />
            </span>
            <h1 className="font-hero text-3xl font-semibold text-primary">
              {mode === 'login'
                ? language === 'am' ? 'ይግቡ' : 'Welcome back'
                : language === 'am' ? 'ፓስወርድ ይቀይሩ' : 'Reset password'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? t('common.churchName')
                : language === 'am'
                  ? 'ኢሜልዎን ያስገቡ እና አዲስ ፓስወርድ መልክት እንልክልዎታለን።'
                  : 'Enter your email and we’ll send you a reset link.'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetSent ? (
            <div className="mt-6 space-y-5">
              <Alert variant="success">
                <AlertDescription>
                  {language === 'am'
                    ? 'መልክት ተልኳል። ኢሜልዎን ይመልከቱ።'
                    : 'Check your inbox — we’ve sent password reset instructions.'}
                </AlertDescription>
              </Alert>
              <Button
                variant="ghost"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="w-full"
              >
                <ArrowLeft /> {language === 'am' ? 'ወደ መግቢያ' : 'Back to sign in'}
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {mode === 'login' && (
                <>
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
                </>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

              {mode === 'login' && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">{language === 'am' ? 'ፓስወርድ' : 'Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password', { required: t('common.required') })}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              )}

              <Button type="submit" size="lg" disabled={loading || googleLoading} className="mt-2">
                {mode === 'login' ? (
                  <>
                    <LogIn /> {loading ? t('common.loading') : t('common.signIn')}
                  </>
                ) : (
                  <>
                    <KeyRound /> {loading ? t('common.loading') : language === 'am' ? 'መልክት ላክ' : 'Send reset link'}
                  </>
                )}
              </Button>

              {mode === 'login' ? (
                <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="font-medium text-primary hover:underline"
                  >
                    {language === 'am' ? 'ፓስወርድዎን ረሱ?' : 'Forgot your password?'}
                  </button>
                  <p>
                    {language === 'am' ? 'መለያ የለዎትም?' : "Don't have an account?"}{' '}
                    <Link to={ROUTES.register} className="font-semibold text-primary hover:underline">
                      {language === 'am' ? 'መለያ ይክፈቱ' : 'Create one'}
                    </Link>
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode('login')}
                  className="w-full"
                >
                  <ArrowLeft /> {language === 'am' ? 'ወደ መግቢያ' : 'Back to sign in'}
                </Button>
              )}
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
