import { Link } from 'react-router-dom';
import BrandCrossIcon from '../ui/BrandCrossIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();
  const { churchInfo } = useSiteSettings();

  const serviceTimes = churchInfo?.serviceTimes || [];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-brand">
              <BrandCrossIcon className="footer-brand-cross" aria-hidden />
              {t('common.churchName')}
            </h3>
            <p className="footer-tagline">
              {language === 'am' ? 'እምነትን፣ ማህበረሰብን እና ተስፋን በአንድነት እንገነባለን።' : 'Building faith, community, and hope together.'}
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">{language === 'am' ? 'ፈጣን አገናኞች' : 'Quick Links'}</h4>
            <ul className="footer-links">
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/sermons">{t('nav.sermons')}</Link></li>
              <li><Link to="/events">{t('nav.events')}</Link></li>
              <li><Link to="/give">{t('nav.give')}</Link></li>
              <li><Link to="/youth-children">{t('nav.youthChildren')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">{t('about.serviceTimes')}</h4>
            {serviceTimes.length > 0 ? (
              <ul className="footer-times">
                {serviceTimes.map((st, i) => (
                  <li key={i}>
                    <span>{language === 'am' && st.dayAm ? st.dayAm : st.day}</span>
                    <span>{st.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="footer-tagline">{language === 'am' ? 'እዚህ ቤተክርስቲያን ይቀላቀሉን።' : 'Join us at the church.'}</p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} {t('common.churchName')}. {language === 'am' ? 'መብቶች ሁሉ የተጠበቁ ናቸው።' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
