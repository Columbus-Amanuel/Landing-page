import { ROUTES } from './routes';

/**
 * Public nav data — desktop bar AND mobile drawer read from the same arrays
 * so the two surfaces never drift. Labels are translation keys.
 */

export const PRIMARY_NAV = [
  { key: 'home', to: ROUTES.home, labelKey: 'nav.home', end: true },
  { key: 'about', to: ROUTES.about, labelKey: 'nav.about' },
];

export const MINISTRIES_NAV = [
  { key: 'youth', to: ROUTES.youthChildren, labelKey: 'nav.youthChildren' },
];

export const MEDIA_NAV = [
  { key: 'sermons', to: ROUTES.sermons, labelKey: 'nav.sermons' },
  { key: 'events', to: ROUTES.events, labelKey: 'nav.events' },
];

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
  { key: 'youth', to: ROUTES.adminYouth, labelKey: 'admin.nav.youth' },
  { key: 'messages', to: ROUTES.adminMessages, labelKey: 'admin.nav.messages' },
];

/** Returns true when `pathname` belongs to any item in `items`. */
export const isGroupActive = (pathname, items) =>
  items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
