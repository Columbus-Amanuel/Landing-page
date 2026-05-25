import { ROUTES } from './routes';

/**
 * Public nav data — desktop bar AND mobile drawer read from the same arrays
 * so the two surfaces never drift. Labels are translation keys.
 */

export const PRIMARY_NAV = [
  { key: 'home', to: ROUTES.home, labelKey: 'nav.home', end: true },
  { key: 'about', to: ROUTES.about, labelKey: 'nav.about' },
  { key: 'sermons', to: ROUTES.sermons, labelKey: 'nav.sermons' },
  { key: 'events', to: ROUTES.events, labelKey: 'nav.events' },
];

/** @deprecated Public ministry links are loaded from Firestore via `SiteSettingsContext` (`ministriesNav`). Kept empty so imports do not break. */
export const MINISTRIES_NAV = [];

export const CONNECT_NAV = [
  { key: 'contact', to: ROUTES.contact, labelKey: 'nav.contact' },
  { key: 'give', to: ROUTES.give, labelKey: 'nav.give', emphasize: true },
];

export const ADMIN_NAV = [
  { key: 'dashboard', to: ROUTES.admin, labelKey: 'admin.nav.dashboard', end: true },
  { key: 'churchInfo', to: ROUTES.adminChurchInfo, labelKey: 'admin.nav.churchInfo' },
  { key: 'events', to: ROUTES.adminEvents, labelKey: 'admin.nav.events' },
  { key: 'sermons', to: ROUTES.adminSermons, labelKey: 'admin.nav.sermons' },
  { key: 'giving', to: ROUTES.adminGiving, labelKey: 'admin.nav.giving' },
  { key: 'ministries', to: ROUTES.adminMinistries, labelKey: 'admin.nav.ministries' },
  {
    key: 'messages',
    to: ROUTES.adminMessages,
    labelKey: 'admin.nav.messages',
    requireSuperAdmin: true,
  },
  {
    key: 'users',
    to: ROUTES.adminUsers,
    labelKey: 'admin.nav.users',
    requireSuperAdmin: true,
  },
];

/** Returns true when `pathname` belongs to any item in `items`. */
export const isGroupActive = (pathname, items) =>
  items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
