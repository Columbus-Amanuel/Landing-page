import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getEventById } from '../services/eventsService';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner center size="lg" />;
  if (!event) return <div className="container section"><p>{language === 'am' ? 'ዝግጅት አልተገኘም።' : 'Event not found.'} <Link to="/events">{language === 'am' ? 'ወደ ዝግጅቶች ተመለስ' : 'Back to Events'}</Link></p></div>;

  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  return (
    <div className="page-event-detail">
      {event.imageUrl && <div className="event-detail-hero"><img src={event.imageUrl} alt={event.title} /></div>}
      <section className="section">
        <div className="container container-narrow">
          <Link to="/events" className="back-link">← {language === 'am' ? 'ወደ ዝግጅቶች ተመለስ' : 'Back to Events'}</Link>
          <h1 className="event-detail-title">{event.title}</h1>
          <div className="event-detail-meta">
            <span>📅 {format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
            <span>🕐 {format(eventDate, 'h:mm a')}</span>
            <span>📍 {event.location}</span>
          </div>
          <div className="event-detail-body">
            <p>{event.description}</p>
            {event.details && <p>{event.details}</p>}
          </div>
          {event.registrationUrl && <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">{language === 'am' ? 'አሁን ይመዝገቡ' : 'Register Now'}</a>}
        </div>
      </section>
    </div>
  );
}
