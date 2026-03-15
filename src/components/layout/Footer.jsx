import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language, t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-brand">✝ {t('common.churchName')}</h3>
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
            <h4 className="footer-heading">{language === 'am' ? 'የአገልግሎት ሰዓቶች' : 'Service Times'}</h4>
            <ul className="footer-times">
              <li><span>{t('home.sunday')}</span><span>9:00 AM & 11:00 AM</span></li>
              <li><span>{t('home.wednesday')}</span><span>7:00 PM</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} {t('common.churchName')}. {language === 'am' ? 'መብቶች ሁሉ የተጠበቁ ናቸው።' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
