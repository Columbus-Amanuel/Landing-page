import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Mic,
  Heart,
  Sparkles,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Container from '@/components/common/Container';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

const TILES = [
  { key: 'churchInfo', icon: Building2, to: ROUTES.adminChurchInfo },
  { key: 'events', icon: CalendarDays, to: ROUTES.adminEvents },
  { key: 'sermons', icon: Mic, to: ROUTES.adminSermons },
  { key: 'giving', icon: Heart, to: ROUTES.adminGiving },
  { key: 'youth', icon: Sparkles, to: ROUTES.adminYouth },
  { key: 'messages', icon: Inbox, to: ROUTES.adminMessages },
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  return (
    <Container size="xl" className="px-0">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {t('admin.welcome')}
        </p>
        <h1 className="mt-1 font-hero text-3xl font-semibold text-primary md:text-4xl">
          {t('admin.dashboard.title')}
          {profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t('admin.dashboard.subtitle')}
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.key}
            to={tile.to}
            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-float">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tile.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold text-primary">
                  {t(`admin.nav.${tile.key}`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`admin.tiles.${tile.key}`)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  {t('admin.dashboard.open')} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
