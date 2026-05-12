import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { toDate, formatDate, formatTime } from '@/lib/format';
import { buildPath, ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

/**
 * Calendar-style card used in event listings and the Home page preview.
 *
 * @param {{ event: { id, title, titleAm?, description?, descriptionAm?, date, location?, locationAm?, imageUrl? }, className?: string }} props
 */
export default function EventCard({ event, className }) {
  const { t, pickLocalized } = useLanguage();
  const date = toDate(event.date);

  const title = pickLocalized(event, 'title');
  const description = pickLocalized(event, 'description');
  const location = pickLocalized(event, 'location');

  return (
    <Card className={cn('group flex h-full flex-col overflow-hidden p-0 hover:border-primary/40 hover:shadow-float', className)}>
      {event.imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {date && (
            <Badge className="absolute left-4 top-4 bg-card text-foreground shadow-soft">
              <Calendar className="h-3 w-3" />
              {formatDate(date, 'MMM d')}
            </Badge>
          )}
        </div>
      ) : (
        date && (
          <div className="flex aspect-[16/9] flex-col items-center justify-center bg-primary/5 text-primary">
            <span className="font-display text-xs uppercase tracking-[0.18em] text-accent">
              {formatDate(date, 'MMM')}
            </span>
            <span className="font-hero text-6xl font-semibold leading-none">
              {formatDate(date, 'd')}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">{formatDate(date, 'yyyy')}</span>
          </div>
        )
      )}

      <CardContent className="flex flex-1 flex-col gap-3 p-6 pt-6">
        <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
        {date && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(date)} · {formatTime(date)}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
          </div>
        )}
        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </CardContent>

      <CardFooter className="mt-auto justify-between p-6 pt-0">
        <Button variant="link" asChild>
          <Link to={buildPath(ROUTES.eventDetail, { id: event.id })} className="gap-1.5">
            {t('events.learnMore')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
