import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../services/authService';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => {
      const links = [
        { to: '/', label: t('nav.home') },
        { to: '/about', label: t('nav.about') },
        { to: '/sermons', label: t('nav.sermons') },
        { to: '/events', label: t('nav.events') },
        { to: '/contact', label: t('nav.contact') },
        { to: '/give', label: t('nav.give') },
      ];

      if (user) {
        links.push({ to: '/profile-update', label: 'Complete Profile' });
      }

      return links;
    },
    [t, user],
  );

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✝</span>
          <span className="brand-name">{t('common.churchName')}</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <select
            aria-label={t('common.language')}
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="btn btn-ghost btn-sm"
          >
            <option value="en">{t('common.english')}</option>
            <option value="am">{t('common.amharic')}</option>
          </select>
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">{t('nav.hi')}, {profile?.displayName || user.email}</span>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline btn-sm">{t('nav.admin')}</Link>
              )}
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">{t('common.logout')}</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">{t('common.signIn')}</Link>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {user ? (
            <button onClick={handleLogout} className="mobile-nav-link">{t('common.logout')}</button>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {t('common.signIn')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
