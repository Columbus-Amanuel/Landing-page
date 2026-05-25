import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES } from '@/constants/routes';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[calc(100svh-var(--navbar-height))] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandCrossIcon className="mb-6 text-primary/40" size={56} />
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">404</p>
      <h1 className="mt-2 font-hero text-5xl font-semibold text-primary md:text-6xl">
        {t('notFound.message')}
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        The page you’re looking for has moved or never existed.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link to={ROUTES.home}>
          <Home /> {t('notFound.goHome')}
        </Link>
      </Button>
    </div>
  );
}
