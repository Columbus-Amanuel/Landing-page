/** Firestore `users/{uid}.role` values used by the app. */
export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
};

export const ASSIGNABLE_ROLES = [ROLES.MEMBER, ROLES.ADMIN, ROLES.SUPER_ADMIN];

/** Admin panel access: admins and super-admins. */
export function isStaffRole(role) {
  const r = normalizeUserRole(role);
  return r === ROLES.ADMIN || r === ROLES.SUPER_ADMIN;
}

/** User directory and role management. */
export function isSuperAdminRole(role) {
  return normalizeUserRole(role) === ROLES.SUPER_ADMIN;
}

/** Default for legacy documents missing `role`. */
export function normalizeUserRole(role) {
  if (role === ROLES.SUPER_ADMIN || role === 'super_admin') return ROLES.SUPER_ADMIN;
  if (role === ROLES.ADMIN || role === ROLES.MEMBER) return role;
  return ROLES.MEMBER;
}

/** TEMPORARY: single-letter role hint for UI (m / a / s). Remove when no longer needed. */
export function getRoleAbbrev(role) {
  const r = normalizeUserRole(role);
  if (r === ROLES.SUPER_ADMIN) return 's';
  if (r === ROLES.ADMIN) return 'a';
  return 'm';
}
