/**
 * Centralised route paths. Importing from here keeps `<Link>` targets, NavLink
 * `active` matches, and admin guards in sync.
 */

export const ROUTES = {
  home: '/',
  about: '/about',
  events: '/events',
  eventDetail: '/events/:id',
  sermons: '/sermons',
  sermonDetail: '/sermons/:id',
  contact: '/contact',
  give: '/give',
  youthChildren: '/youth-children',
  ministries: '/ministries',
  ministryDetail: '/ministries/:slug',
  login: '/login',
  register: '/register',
  profileUpdate: '/profile-update',
  admin: '/admin',
  adminChurchInfo: '/admin/church-info',
  adminEvents: '/admin/events',
  adminSermons: '/admin/sermons',
  adminGiving: '/admin/giving',
  adminYouth: '/admin/youth',
  adminMinistries: '/admin/ministries',
  adminMinistryEdit: '/admin/ministries/:ministryId',
  adminMessages: '/admin/messages',
  adminUsers: '/admin/users',
  adminMedia: '/admin/media',
};

/** Build a concrete detail URL ("/events/abc") from a route template + id. */
export function buildPath(template, params = {}) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(value)),
    template,
  );
}
