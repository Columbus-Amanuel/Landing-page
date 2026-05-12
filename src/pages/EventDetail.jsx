import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import Container from '@/components/common/Container';
import BackLink from '@/components/common/BackLink';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEventById } from '@/services/eventsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatTime, toDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function EventDetail() {
  const { id } = useParams();
  const { t, pickLocalized } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEventById(id)
      .then((data) => active && setEvent(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" center />;
  if (!event) {
    return (
      <Container className="py-24">
        <EmptyState
          title={t('events.notFound')}
          action={
            <Button asChild>
              <Link to={ROUTES.events}>{t('events.backToEvents')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const date = toDate(event.date);
  const title = pickLocalized(event, 'title');
  const description = pickLocalized(event, 'description');
  const details = pickLocalized(event, 'details');
  const location = pickLocalized(event, 'location');

  return (
    <article className="pb-24">
      {event.imageUrl && (
        <div className="relative h-[40vh] min-h-[18rem] w-full overflow-hidden bg-muted">
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        </div>
      )}

      <Container size="md" className="pt-12">
        <BackLink to={ROUTES.events} className="mb-8">
          {t('events.backToEvents')}
        </BackLink>

        <h1 className="font-hero text-4xl font-semibold text-primary md:text-5xl">{title}</h1>

        <div className="mt-6 flex flex-wrap gap-3">
          {date && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <Calendar className="h-4 w-4 text-accent" />
              {formatDate(date)}
            </Badge>
          )}
          {date && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              {formatTime(date)}
            </Badge>
          )}
          {location && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
              <MapPin className="h-4 w-4 text-accent" />
              {location}
            </Badge>
          )}
        </div>

        {description && (
          <p className="mt-8 text-lg leading-relaxed text-foreground/90">{description}</p>
        )}

        {details && (
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {details}
          </div>
        )}

        {event.registrationUrl && (
          <div className="mt-10">
            <Button asChild size="lg" variant="accent">
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                {t('events.registerNow')} <ExternalLink />
              </a>
            </Button>
          </div>
        )}
      </Container>
    </article>
  );
}
