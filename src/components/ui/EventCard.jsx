import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

export default function EventCard({ event }) {
  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const { t, language } = useLanguage();
  const am = language === 'am';

  const title = am && event.titleAm ? event.titleAm : event.title;
  const description = am && event.descriptionAm ? event.descriptionAm : event.description;
  const location = am && event.locationAm ? event.locationAm : event.location;

  return (
    <div className="event-card">
      {event.imageUrl && <img src={event.imageUrl} alt={title} className="event-card-image" />}
      <div className="event-card-body">
        <div className="event-card-date">
          <span className="event-month">{format(eventDate, 'MMM')}</span>
          <span className="event-day">{format(eventDate, 'd')}</span>
        </div>
        <div className="event-card-info">
          <h3 className="event-card-title">{title}</h3>
          <p className="event-card-time">{format(eventDate, 'EEEE, MMMM d · h:mm a')}</p>
          <p className="event-card-location">{location}</p>
          {description && <p className="event-card-desc">{description}</p>}
          <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">{t('events.learnMore')}</Link>
        </div>
      </div>
    </div>
  );
}
