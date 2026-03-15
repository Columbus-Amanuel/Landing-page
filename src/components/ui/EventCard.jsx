import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

export default function EventCard({ event }) {
  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const { language } = useLanguage();

  return (
    <div className="event-card">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-card-image" />}
      <div className="event-card-body">
        <div className="event-card-date">
          <span className="event-month">{format(eventDate, 'MMM')}</span>
          <span className="event-day">{format(eventDate, 'd')}</span>
        </div>
        <div className="event-card-info">
          <h3 className="event-card-title">{event.title}</h3>
          <p className="event-card-time">{format(eventDate, 'EEEE, MMMM d · h:mm a')}</p>
          <p className="event-card-location">{event.location}</p>
          <p className="event-card-desc">{event.description}</p>
          <Link to={`/events/${event.id}`} className="btn btn-outline btn-sm">{language === 'am' ? 'ተጨማሪ መረጃ' : 'Learn More'}</Link>
        </div>
      </div>
    </div>
  );
}
