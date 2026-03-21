import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUpcomingEvents } from '../services/eventsService';
import { getSermons } from '../services/sermonsService';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import EventCard from '../components/ui/EventCard';
import SermonCard from '../components/ui/SermonCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ValueIcon from '../components/ui/ValueIcon';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { churchInfo } = useSiteSettings();

  useEffect(() => {
    Promise.all([getUpcomingEvents(3), getSermons(3)])
      .then(([evts, srms]) => {
        setEvents(evts);
        setSermons(srms);
      })
      .finally(() => setLoading(false));
  }, []);

  const am = language === 'am';

  const serviceTimes = churchInfo?.serviceTimes || [];
  const values = churchInfo?.values || [];
  const missionStatement = am
    ? (churchInfo?.missionStatementAm || churchInfo?.missionStatement || t('home.missionBody'))
    : (churchInfo?.missionStatement || t('home.missionBody'));

  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/about" className="btn btn-primary btn-lg">{t('home.aboutBtn')}</Link>
            <Link to="/sermons" className="btn btn-outline-light btn-lg">{t('home.sermonsBtn')}</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">{t('home.joinTitle')}</h2>
          <div className="service-times-grid">
            {serviceTimes.map((s, i) => (
              <div key={i} className="service-time-card">
                <h3>{am && s.dayAm ? s.dayAm : s.day}</h3>
                <p className="service-time">{s.time}</p>
                {(am ? s.noteAm || s.note : s.note) && (
                  <p className="service-note">{am && s.noteAm ? s.noteAm : s.note}</p>
                )}
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/contact" className="btn btn-primary">{t('home.planVisit')}</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text">
              <h2 className="section-title text-left">{t('home.missionTitle')}</h2>
              <p>{missionStatement}</p>
              <Link to="/about" className="btn btn-outline mt-4">{t('home.readStory')}</Link>
            </div>
            <div className="mission-values">
              {values.map((v, i) => (
                <div key={i} className="value-card">
                  <ValueIcon iconKey={v.icon} />
                  <div>
                    <h4>{am && v.titleAm ? v.titleAm : v.title}</h4>
                    <p>{am && v.descAm ? v.descAm : v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.upcomingEvents')}</h2>
            <Link to="/events" className="btn btn-ghost">{t('home.viewAllEvents')}</Link>
          </div>
          {loading ? (
            <LoadingSpinner center />
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <p className="empty-state">{t('home.noEvents')}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.recentSermons')}</h2>
            <Link to="/sermons" className="btn btn-ghost">{t('home.viewAllSermons')}</Link>
          </div>
          {loading ? (
            <LoadingSpinner center />
          ) : sermons.length > 0 ? (
            <div className="sermons-grid">
              {sermons.map((sermon) => <SermonCard key={sermon.id} sermon={sermon} />)}
            </div>
          ) : (
            <p className="empty-state">{t('home.noSermons')}</p>
          )}
        </div>
      </section>

      <section className="cta-banner">
        <div className="container">
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaText')}</p>
          <Link to="/contact" className="btn btn-primary btn-lg">{t('home.ctaButton')}</Link>
        </div>
      </section>
    </div>
  );
}
