import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUpcomingEvents } from '../services/eventsService';
import { getSermons } from '../services/sermonsService';
import EventCard from '../components/ui/EventCard';
import SermonCard from '../components/ui/SermonCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUpcomingEvents(3), getSermons(3)])
      .then(([evts, srms]) => {
        setEvents(evts);
        setSermons(srms);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Welcome Home</h1>
          <p className="hero-subtitle">
            A place to belong, believe, and become. Join us every Sunday as we worship together.
          </p>
          <div className="hero-actions">
            <Link to="/about" className="btn btn-primary btn-lg">Learn About Us</Link>
            <Link to="/sermons" className="btn btn-outline-light btn-lg">Watch Sermons</Link>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Join Us for Worship</h2>
          <div className="service-times-grid">
            {[
              { day: 'Sunday', times: ['9:00 AM', '11:00 AM'], note: 'In-person & Online' },
              { day: 'Wednesday', times: ['7:00 PM'], note: 'Midweek Bible Study' },
            ].map((s) => (
              <div key={s.day} className="service-time-card">
                <h3>{s.day}</h3>
                {s.times.map((t) => <p key={t} className="service-time">{t}</p>)}
                <p className="service-note">{s.note}</p>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/contact" className="btn btn-primary">Plan Your Visit</Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text">
              <h2 className="section-title text-left">Our Mission</h2>
              <p>
                We exist to glorify God by making disciples of Jesus Christ who love God, love
                others, and serve the world. Every person who walks through our doors matters —
                and every life has eternal purpose.
              </p>
              <Link to="/about" className="btn btn-outline mt-4">Read Our Story</Link>
            </div>
            <div className="mission-values">
              {[
                { icon: '🙏', title: 'Authentic Worship', desc: 'Encountering God through Spirit-led praise' },
                { icon: '📖', title: 'Biblical Teaching', desc: 'Grounded in the truth of Scripture' },
                { icon: '🤝', title: 'Real Community', desc: 'Life-giving relationships that go deep' },
                { icon: '🌍', title: 'Global Impact', desc: 'Serving locally, reaching globally' },
              ].map((v) => (
                <div key={v.title} className="value-card">
                  <span className="value-icon">{v.icon}</span>
                  <div>
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <Link to="/events" className="btn btn-ghost">View All Events →</Link>
          </div>
          {loading ? (
            <LoadingSpinner center />
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <p className="empty-state">No upcoming events. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Recent Sermons */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Sermons</h2>
            <Link to="/sermons" className="btn btn-ghost">View All Sermons →</Link>
          </div>
          {loading ? (
            <LoadingSpinner center />
          ) : sermons.length > 0 ? (
            <div className="sermons-grid">
              {sermons.map((s) => <SermonCard key={s.id} sermon={s} />)}
            </div>
          ) : (
            <p className="empty-state">Sermons coming soon!</p>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2>Ready to take the next step?</h2>
          <p>We'd love to connect with you and answer any questions you have.</p>
          <Link to="/contact" className="btn btn-primary btn-lg">Get In Touch</Link>
        </div>
      </section>
    </div>
  );
}
