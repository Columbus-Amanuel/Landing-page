import { Link } from 'react-router-dom';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function About() {
  const { churchInfo, loading } = useSiteSettings();
  const { t, language } = useLanguage();

  const am = language === 'am';

  const {
    officialName, amharicName,
    address, city, state, zip,
    phone, email,
    facebookUrl, youtubeUrl,
    storyPara1, storyPara1Am,
    storyPara2, storyPara2Am,
    serviceTimes, beliefs,
  } = churchInfo;

  if (loading) return <LoadingSpinner center />;

  return (
    <div className="page-about">
      <section className="page-hero">
        <h1>{t('about.heroTitle')}</h1>
        <p>{t('about.heroSubtitle')}</p>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">{t('about.ourStory')}</h2>
          {(am ? storyPara1Am || storyPara1 : storyPara1) && (
            <p>{am ? storyPara1Am || storyPara1 : storyPara1}</p>
          )}
          {(am ? storyPara2Am || storyPara2 : storyPara2) && (
            <p>{am ? storyPara2Am || storyPara2 : storyPara2}</p>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">{t('about.whatWeBelieve')}</h2>
          {beliefs && beliefs.length > 0 ? (
            <div className="beliefs-grid">
              {beliefs.map((belief, i) => (
                <div key={i} className="belief-card">
                  <h3>{am && belief.titleAm ? belief.titleAm : belief.title}</h3>
                  <p>{am && belief.descAm ? belief.descAm : belief.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">{t('about.beliefsEmpty')}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t('about.worshipContact')}</h2>
          <div className="location-grid">
            <div className="location-info">
              {officialName && (
                <>
                  <h3>{t('about.churchName')}</h3>
                  <p>{officialName}</p>
                  {amharicName && <p>{amharicName}</p>}
                  <br />
                </>
              )}
              {address && (
                <>
                  <h3>{t('about.address')}</h3>
                  <p>{address}{city ? `, ${city}` : ''}{state ? `, ${state}` : ''}{zip ? ` ${zip}` : ''}</p>
                  <br />
                </>
              )}
              {serviceTimes && serviceTimes.length > 0 && (
                <>
                  <h3>{t('about.serviceTimes')}</h3>
                  {serviceTimes.map((st, i) => (
                    <p key={i}>
                      {am && st.dayAm ? st.dayAm : st.day}: {st.time}
                      {(am ? st.noteAm || st.note : st.note) ? ` — ${am && st.noteAm ? st.noteAm : st.note}` : ''}
                    </p>
                  ))}
                  <br />
                </>
              )}
              {phone && (
                <>
                  <h3>{t('about.phone')}</h3>
                  <a href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                  <br />
                </>
              )}
              {email && (
                <>
                  <h3>{t('about.email')}</h3>
                  <a href={`mailto:${email}`}>{email}</a>
                  <br />
                </>
              )}
              {(facebookUrl || youtubeUrl) && (
                <>
                  <h3>{t('about.online')}</h3>
                  {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer">{t('about.facebook')}</a>}
                  {facebookUrl && youtubeUrl && <br />}
                  {youtubeUrl && <a href={youtubeUrl} target="_blank" rel="noreferrer">{t('about.youtube')}</a>}
                </>
              )}
            </div>
            <div className="location-map">
              {address && city && (
                <iframe
                  title="Church Location"
                  className="map-embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}&output=embed`}
                />
              )}
              <div className="map-placeholder-extra">
                <p className="text-sm">{t('about.missingDetails')}</p>
                <Link to="/profile-update" className="btn btn-primary mt-4">{t('about.completeProfile')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
