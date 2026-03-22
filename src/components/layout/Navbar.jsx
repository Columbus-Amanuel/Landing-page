import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import BrandCrossIcon from '../ui/BrandCrossIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../services/authService';

function NavDropdown({ label, items, groupActive }) {
  return (
    <Menu as="div" className="nav-dropdown">
      <MenuButton
        className={`nav-dropdown-trigger${groupActive ? ' is-active' : ''}`}
      >
        {label}
        <ChevronDownIcon className="nav-dropdown-chevron" aria-hidden />
      </MenuButton>
      <MenuItems
        className="nav-dropdown-panel"
        anchor="bottom start"
        transition
        modal={false}
      >
        {items.map(({ to, label: itemLabel, end }) => (
          <MenuItem key={to}>
            {({ focus }) => (
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-dropdown-item${isActive ? ' active' : ''}${focus ? ' is-focus' : ''}`
                }
              >
                {itemLabel}
              </NavLink>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ministriesActive = pathname.startsWith('/youth-children');
  const mediaActive =
    pathname.startsWith('/sermons') || pathname.startsWith('/events');
  const ministriesItems = useMemo(
    () => [
      { to: '/youth-children', label: t('nav.youthChildren'), end: true },
    ],
    [t],
  );

  const mediaItems = useMemo(
    () => [
      { to: '/sermons', label: t('nav.sermons'), end: false },
      { to: '/events', label: t('nav.events'), end: false },
    ],
    [t],
  );

  const mobileConnectItems = useMemo(
    () => [
      { to: '/contact', label: t('nav.contact'), end: true },
      { to: '/give', label: t('nav.give'), end: true },
    ],
    [t],
  );

  const accountLinks = useMemo(() => {
    const links = [];
    if (user) {
      links.push({ to: '/profile-update', label: t('nav.completeProfile'), end: true });
    }
    if (profile?.role === 'admin') {
      links.push({ to: '/admin', label: t('nav.admin'), end: false });
    }
    return links;
  }, [profile?.role, t, user]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logoutUser();
    navigate('/');
  };

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark" aria-hidden>
            <BrandCrossIcon className="brand-icon" />
          </span>
          <span className="brand-name">{t('common.churchName')}</span>
        </Link>

        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {t('nav.home')}
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {t('nav.about')}
          </NavLink>
          <NavDropdown
            label={t('nav.ministries')}
            items={ministriesItems}
            groupActive={ministriesActive}
          />
          <NavDropdown
            label={t('nav.media')}
            items={mediaItems}
            groupActive={mediaActive}
          />
          <NavLink
            to="/contact"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {t('nav.contact')}
          </NavLink>
          <NavLink
            to="/give"
            end
            className={({ isActive }) =>
              `nav-link nav-link${isActive ? ' active' : ''}`
            }
          >
            {t('nav.give')}
          </NavLink>
          {accountLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="lang-toggle" role="group" aria-label={t('common.language')}>
            <button
              type="button"
              className={language === 'en' ? 'is-on' : ''}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={language === 'am' ? 'is-on' : ''}
              onClick={() => changeLanguage('am')}
            >
              አማ
            </button>
          </div>
          {user ? (
            <div className="user-menu">
              <span className="user-greeting" title={profile?.displayName || user.email}>
                {t('nav.hi')}, {profile?.displayName || user.email}
              </span>
              <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              {t('common.signIn')}
            </Link>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-nav"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        >
          <span className={`hamburger ${mobileOpen ? 'open' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="mobile-menu" id="site-mobile-nav">
            <div className="mobile-nav-section">
              <p className="mobile-nav-label">{t('nav.main')}</p>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.about')}
              </NavLink>
            </div>

            <div className="mobile-nav-section">
              <p className="mobile-nav-label">{t('nav.ministries')}</p>
              {ministriesItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="mobile-nav-section">
              <p className="mobile-nav-label">{t('nav.media')}</p>
              {mediaItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="mobile-nav-section">
              <p className="mobile-nav-label">{t('nav.connect')}</p>
              {mobileConnectItems.map(({ to, label, end, emphasize }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `mobile-nav-link${emphasize ? ' mobile-nav-link-give' : ''}${isActive ? ' active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {accountLinks.length > 0 && (
              <div className="mobile-nav-section">
                <p className="mobile-nav-label">{t('nav.account')}</p>
                {accountLinks.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            <div className="mobile-menu-actions">
              <div className="lang-toggle" role="group" aria-label={t('common.language')}>
                <button
                  type="button"
                  className={language === 'en' ? 'is-on' : ''}
                  onClick={() => changeLanguage('en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={language === 'am' ? 'is-on' : ''}
                  onClick={() => changeLanguage('am')}
                >
                  አማ
                </button>
              </div>
              {user ? (
                <button type="button" onClick={handleLogout} className="mobile-nav-link">
                  {t('common.logout')}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('common.signIn')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
