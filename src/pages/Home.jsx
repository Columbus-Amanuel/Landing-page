import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  PlayCircleIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getUpcomingEvents } from '../services/eventsService';
import { getSermons } from '../services/sermonsService';
import { submitContactForm } from '../services/contactService';
import { getYoutubeVideoId } from '../services/youthVideosService';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import EventCard from '../components/ui/EventCard';
import SermonCard from '../components/ui/SermonCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ValueIcon from '../components/ui/ValueIcon';

const DEFAULT_HERO_YOUTUBE_VIDEO_ID = '9tFh_EwJWdc';

function resolveHeroYoutubeId(value = '') {
  const trimmedValue = String(value).trim();
  if (!trimmedValue) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedValue)) return trimmedValue;
  return getYoutubeVideoId(trimmedValue);
}

const HERO_CALLBACK_PLACEHOLDER_EMAIL = 'not-provided@example.com';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHeroVideoVisible, setIsHeroVideoVisible] = useState(false);
  const [heroVideoBurstTick, setHeroVideoBurstTick] = useState(0);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const { churchInfo } = useSiteSettings();

  const {
    register: registerCallback,
    handleSubmit: handleSubmitCallback,
    reset: resetCallback,
    formState: { errors: callbackErrors },
  } = useForm({ defaultValues: { name: '', phone: '' } });

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
  const {
    address,
    city,
    state,
    zip,
    phone,
    email,
    pastorName,
    pastorNameAm,
  } = churchInfo || {};
  const fullAddress = [address, city && state ? `${city}, ${state}` : city || state, zip]
    .filter(Boolean)
    .join(' ');
  const mapsHref =
    fullAddress &&
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const pastorDisplay = am ? (pastorNameAm || pastorName) : (pastorName || pastorNameAm);
  const missionStatement = am
    ? (churchInfo?.missionStatementAm || churchInfo?.missionStatement || t('home.missionBody'))
    : (churchInfo?.missionStatement || t('home.missionBody'));
  const primaryService = serviceTimes[0] || null;
  const primaryServiceDay = primaryService
    ? (am && primaryService.dayAm ? primaryService.dayAm : primaryService.day)
    : '';
  const primaryServiceSummary = primaryService
    ? [primaryServiceDay, primaryService.time].filter(Boolean).join(' • ')
    : '';
  const primaryServiceNote = primaryService
    ? (am && primaryService.noteAm ? primaryService.noteAm : primaryService.note)
    : '';
  const missionTeaser =
    missionStatement.length > 170
      ? `${missionStatement.slice(0, 167).trimEnd()}...`
      : missionStatement;
  const heroVideoId = resolveHeroYoutubeId(
    import.meta.env.VITE_HERO_YOUTUBE_VIDEO_ID || DEFAULT_HERO_YOUTUBE_VIDEO_ID,
  );
  const heroVideoEmbedUrl = heroVideoId
    ? `https://www.youtube-nocookie.com/embed/${heroVideoId}?autoplay=1&mute=1&loop=1&playlist=${heroVideoId}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1`
    : '';

  const openCallbackDialog = () => {
    resetCallback();
    setCallbackSuccess(false);
    setCallbackOpen(true);
  };

  const closeCallbackDialog = () => {
    if (callbackSubmitting) return;
    setCallbackOpen(false);
    setCallbackSuccess(false);
    resetCallback();
  };

  const onSubmitHeroCallback = async ({ name, phone }) => {
    setCallbackSubmitting(true);
    try {
      await submitContactForm({
        firstName: name.trim(),
        lastName: '',
        email: HERO_CALLBACK_PLACEHOLDER_EMAIL,
        phone: phone.trim(),
        subject: t('home.heroCallbackSubject'),
        message: t('home.heroCallbackMessageBody'),
      });
      setCallbackSuccess(true);
      resetCallback();
    } catch {
      alert(am ? 'ችግር ተፈጥሯል። እንደገና ይሞክሩ።' : 'Something went wrong. Please try again.');
    } finally {
      setCallbackSubmitting(false);
    }
  };

  const toggleHeroVideo = () => {
    setIsHeroVideoVisible((currentValue) => !currentValue);
    setHeroVideoBurstTick((currentValue) => currentValue + 1);
  };

  return (
    <div className="page-home">
      <Dialog open={callbackOpen} onClose={closeCallbackDialog} className="profile-dialog-overlay">
        <div className="profile-dialog-backdrop" aria-hidden="true" />
        <div className="profile-dialog-container">
          <DialogPanel className="profile-dialog-panel hero-callback-dialog-panel">
            <DialogTitle className="profile-dialog-title">
              {callbackSuccess ? t('home.heroCallbackThanksTitle') : t('home.heroCallbackDialogTitle')}
            </DialogTitle>
            {callbackSuccess ? (
              <>
                <p className="profile-dialog-body">{t('home.heroCallbackThanksBody')}</p>
                <button type="button" className="btn btn-primary" onClick={closeCallbackDialog}>
                  {t('home.heroCallbackClose')}
                </button>
              </>
            ) : (
              <form className="form hero-callback-form" onSubmit={handleSubmitCallback(onSubmitHeroCallback)}>
                <p className="profile-dialog-body hero-callback-dialog-lead">{t('home.heroCallbackDialogLead')}</p>
                <div className="form-group">
                  <label htmlFor="hero-callback-name">{t('home.heroCallbackNameLabel')}</label>
                  <input
                    id="hero-callback-name"
                    className="form-input"
                    autoComplete="name"
                    {...registerCallback('name', { required: t('common.required') })}
                  />
                  {callbackErrors.name && (
                    <span className="form-error">{callbackErrors.name.message}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="hero-callback-phone">{t('home.heroCallbackPhoneLabel')}</label>
                  <input
                    id="hero-callback-phone"
                    type="tel"
                    className="form-input"
                    autoComplete="tel"
                    inputMode="tel"
                    {...registerCallback('phone', {
                      required: t('common.required'),
                      validate: (value) => {
                        const digits = String(value).replace(/\D/g, '');
                        if (digits.length >= 10) return true;
                        return t('home.heroCallbackPhoneInvalid');
                      },
                    })}
                  />
                  {callbackErrors.phone && (
                    <span className="form-error">{callbackErrors.phone.message}</span>
                  )}
                </div>
                <div className="hero-callback-dialog-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeCallbackDialog}>
                    {t('home.heroCallbackCancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={callbackSubmitting}>
                    {callbackSubmitting ? t('contact.sending') : t('home.heroCallbackSubmit')}
                  </button>
                </div>
              </form>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <section className={`hero hero--showcase${isHeroVideoVisible ? ' hero--video-focus' : ''}`}>
        <div className="hero-showcase-stage">
          {heroVideoEmbedUrl ? (
            <div className="hero-video-frame-wrap">
              <iframe
                className="hero-video-frame"
                src={heroVideoEmbedUrl}
                title={t('home.heroVideoTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                tabIndex={isHeroVideoVisible ? 0 : -1}
              />
            </div>
          ) : null}
          <div className="hero-showcase-mesh" />
          <div className="hero-showcase-glow hero-showcase-glow--left" />
          <div className="hero-showcase-glow hero-showcase-glow--right" />
          <div className="hero-showcase-orbit" />
        </div>
        <div className="hero-overlay" />
        {heroVideoEmbedUrl && (
          <div className="hero-video-toggle-wrap">
            <button
              type="button"
              className="btn btn-outline-light btn-sm hero-video-toggle"
              onClick={toggleHeroVideo}
              aria-pressed={isHeroVideoVisible}
            >
              {isHeroVideoVisible ? (
                <XMarkIcon className="btn-inline-icon" aria-hidden />
              ) : (
                <PlayCircleIcon className="btn-inline-icon" aria-hidden />
              )}
              <span>{isHeroVideoVisible ? t('home.hideVideoBtn') : t('home.showVideoBtn')}</span>
            </button>
            <span className="hero-video-burst" key={heroVideoBurstTick} aria-hidden>
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} className="hero-video-burst-particle" style={{ '--particle-index': index }} />
              ))}
            </span>
          </div>
        )}
        <div className="container hero-shell">
          <div className="hero-content hero-content--showcase">
            <div className="hero-kicker-row">
              <button
                type="button"
                className="hero-meta-pill hero-meta-pill--action"
                onClick={openCallbackDialog}
              >
                <PhoneIcon aria-hidden />
                <span>{t('home.heroLetUsCallYou')}</span>
              </button>
              {fullAddress && mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hero-meta-pill hero-meta-pill--action hero-meta-pill--multiline"
                >
                  <MapPinIcon aria-hidden />
                  <span>{fullAddress}</span>
                </a>
              )}
            </div>

            <h1 className="hero-title">{t('home.prewelcome')}</h1>
            <h1 className="hero-title">{t('home.title')}</h1>
            <p className="hero-subtitle">{t('home.subtitle')}</p>

            <div className="hero-actions">
              <Link to="/about" className="btn btn-primary btn-lg">{t('home.aboutBtn')}</Link>
              <Link to="/sermons" className="btn btn-outline-light btn-lg">{t('home.sermonsBtn')}</Link>
            </div>

            <div className="hero-signal-bar">
              {primaryServiceSummary && (
                <article className="hero-signal-card">
                  <span className="hero-signal-label">{t('home.joinTitle')}</span>
                  <strong>{primaryServiceSummary}</strong>
                  {primaryServiceNote && <p>{primaryServiceNote}</p>}
                </article>
              )}

              <article className="hero-signal-card hero-signal-card--accent">
                <span className="hero-signal-label">{t('home.missionTitle')}</span>
                <p>{missionTeaser}</p>
              </article>
            </div>
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

      {(fullAddress || phone || email) && (
        <section className="home-contact-lab" aria-labelledby="home-contact-lab-title">
          <div className="home-contact-lab-grid-bg" aria-hidden />
          <div className="home-contact-lab-glow" aria-hidden />
          <div className="container">
            <p className="home-contact-lab-eyebrow">{t('home.contactLabEyebrow')}</p>
            <h2 id="home-contact-lab-title" className="home-contact-lab-title">
              {t('home.contactLabTitle')}
            </h2>
            <p className="home-contact-lab-lead">{t('home.contactLabLead')}</p>

            <div className="home-contact-lab-panels">
              {fullAddress && (
                <article className="home-contact-panel">
                  <div className="home-contact-panel-header">
                    <span className="home-contact-panel-icon" aria-hidden>
                      <MapPinIcon />
                    </span>
                    <div>
                      <h3 className="home-contact-panel-label">{t('home.contactLabAddressLabel')}</h3>
                      <p className="home-contact-panel-value">{fullAddress}</p>
                    </div>
                  </div>
                  {mapsHref && (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="home-contact-panel-link"
                    >
                      <span>{t('home.contactLabDirections')}</span>
                      <ArrowTopRightOnSquareIcon aria-hidden />
                    </a>
                  )}
                </article>
              )}

              {(phone || email) && (
                <article className="home-contact-panel home-contact-panel--pastor">
                  <div className="home-contact-panel-header">
                    <span className="home-contact-panel-icon" aria-hidden>
                      <UserCircleIcon />
                    </span>
                    <div>
                      <h3 className="home-contact-panel-label">{t('home.contactLabPastorLabel')}</h3>
                      {pastorDisplay ? (
                        <p className="home-contact-panel-pastor-name">{pastorDisplay}</p>
                      ) : (
                        <p className="home-contact-panel-role">{t('home.contactLabPastorFallback')}</p>
                      )}
                    </div>
                  </div>
                  <ul className="home-contact-panel-actions">
                    {phone && (
                      <li>
                        <a href={`tel:${String(phone).replace(/\D/g, '')}`} className="home-contact-chip">
                          <PhoneIcon aria-hidden />
                          <span>{phone}</span>
                        </a>
                      </li>
                    )}
                    {email && (
                      <li>
                        <a href={`mailto:${email}`} className="home-contact-chip">
                          <EnvelopeIcon aria-hidden />
                          <span>{email}</span>
                        </a>
                      </li>
                    )}
                  </ul>
                  <Link to="/contact" className="home-contact-panel-cta">
                    {t('home.contactLabMessage')}
                  </Link>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

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
