import { useEffect, useState } from 'react';
import { getAllEvents } from '../services/eventsService';
import { useLanguage } from '../contexts/LanguageContext';
import EventCard from '../components/ui/EventCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-events">
      <section className="page-hero">
        <h1>{t('events.heroTitle')}</h1>
        <p>{t('events.heroSubtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner center size="lg" />}
          {error && <div className="error-state"><p>{t('events.loadError')}</p></div>}
          {!loading && !error && events.length === 0 && (
            <p className="empty-state">{t('events.noEvents')}</p>
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
