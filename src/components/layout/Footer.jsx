import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-brand">✝ Grace Community Church</h3>
            <p className="footer-tagline">Building faith, community, and hope together.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook" className="social-link">📘</a>
              <a href="#" aria-label="Instagram" className="social-link">📷</a>
              <a href="#" aria-label="YouTube" className="social-link">▶️</a>
              <a href="#" aria-label="Twitter" className="social-link">🐦</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/sermons">Sermons</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/give">Give</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Ministries</h4>
            <ul className="footer-links">
              <li><a href="#">Youth Ministry</a></li>
              <li><a href="#">Children's Ministry</a></li>
              <li><a href="#">Worship Team</a></li>
              <li><a href="#">Community Outreach</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Service Times</h4>
            <ul className="footer-times">
              <li><span>Sunday</span><span>9:00 AM & 11:00 AM</span></li>
              <li><span>Wednesday</span><span>7:00 PM</span></li>
            </ul>
            <div className="footer-address">
              <p>123 Faith Avenue</p>
              <p>Your City, ST 12345</p>
              <a href="tel:+15551234567">(555) 123-4567</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Grace Community Church. All rights reserved.</p>
          <p>
            <Link to="/privacy">Privacy Policy</Link> &middot;{' '}
            <Link to="/terms">Terms of Use</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
