import { useEffect, useState } from 'react';
import { getAllEvents } from '../services/eventsService';
import { useLanguage } from '../contexts/LanguageContext';
import EventCard from '../components/ui/EventCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-events">
      <section className="page-hero">
        <h1>{t('nav.events')}</h1>
        <p>{language === 'am' ? 'በቤተ ክርስቲያናችን የሚካሄዱ ነገሮችን ይከታተሉ።' : "Stay connected with what's happening at Grace Community Church."}</p>
      </section>

      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner center size="lg" />}
          {error && <div className="error-state"><p>{language === 'am' ? 'ዝግጅቶችን መጫን አልተቻለም።' : 'Failed to load events. Please try again later.'}</p></div>}
          {!loading && !error && events.length === 0 && (
            <p className="empty-state">{language === 'am' ? 'በአሁኑ ጊዜ ምንም ዝግጅት የለም።' : 'No events scheduled at this time. Check back soon!'}</p>
          )}
          {!loading && !error && events.length > 0 && (
            <div className="events-list">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
