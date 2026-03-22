import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getEventById } from '../services/eventsService';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BackLink from '../components/ui/BackLink';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const am = language === 'am';

  useEffect(() => {
    getEventById(id).then(setEvent).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner center size="lg" />;
  if (!event) {
    return (
      <div className="container section">
        <p>{t('events.notFound')} <Link to="/events">{t('events.backToEvents')}</Link></p>
      </div>
    );
  }

  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  const title = am && event.titleAm ? event.titleAm : event.title;
  const description = am && event.descriptionAm ? event.descriptionAm : event.description;
  const details = am && event.detailsAm ? event.detailsAm : event.details;
  const location = am && event.locationAm ? event.locationAm : event.location;

  return (
    <div className="page-event-detail">
      {event.imageUrl && <div className="event-detail-hero"><img src={event.imageUrl} alt={title} /></div>}
      <section className="section">
        <div className="container container-narrow">
          <BackLink to="/events">{t('events.backToEvents')}</BackLink>
          <h1 className="event-detail-title">{title}</h1>
          <div className="event-detail-meta">
            <span className="meta-inline">
              <CalendarDaysIcon aria-hidden />
              {format(eventDate, 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="meta-inline">
              <ClockIcon aria-hidden />
              {format(eventDate, 'h:mm a')}
            </span>
            <span className="meta-inline">
              <MapPinIcon aria-hidden />
              {location}
            </span>
          </div>
          <div className="event-detail-body">
            {description && <p>{description}</p>}
            {details && <p>{details}</p>}
          </div>
          {event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
              {t('events.registerNow')}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
