import { useEffect, useState } from 'react';
import { CalendarSearch } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import EventCard from '@/components/common/EventCard';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getAllEvents } from '@/services/eventsService';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Events() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllEvents()
      .then((data) => active && setEvents(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow={t('common.churchName')}
        title={t('events.heroTitle')}
        subtitle={t('events.heroSubtitle')}
      />

      <Section>
        {loading ? (
          <LoadingSpinner size="lg" center />
        ) : error ? (
          <ErrorState description={t('events.loadError')} />
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarSearch} title={t('events.noEvents')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
