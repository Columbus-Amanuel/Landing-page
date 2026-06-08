/** Roles a user can hold within a ministry. */
export const MINISTRY_ROLES = {
  MEMBER: 'member',
  LEADER: 'leader',
  COORDINATOR: 'coordinator',
  VOLUNTEER: 'volunteer',
};

export const ASSIGNABLE_MINISTRY_ROLES = [
  MINISTRY_ROLES.MEMBER,
  MINISTRY_ROLES.LEADER,
  MINISTRY_ROLES.COORDINATOR,
  MINISTRY_ROLES.VOLUNTEER,
];

export function normalizeMinistryRole(role) {
  if (ASSIGNABLE_MINISTRY_ROLES.includes(role)) return role;
  return MINISTRY_ROLES.MEMBER;
}

export function ministryRoleLabelKey(role) {
  const r = normalizeMinistryRole(role);
  return `admin.users.ministryRole.${r}`;
}
