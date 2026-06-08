/** How `toUserId` relates to `fromUserId` (e.g. Jane is John's child). */
export const FAMILY_RELATIONSHIPS = {
  SPOUSE: 'spouse',
  PARENT: 'parent',
  CHILD: 'child',
  SIBLING: 'sibling',
  GUARDIAN: 'guardian',
  DEPENDENT: 'dependent',
  OTHER: 'other',
};

export const ASSIGNABLE_FAMILY_RELATIONSHIPS = [
  FAMILY_RELATIONSHIPS.SPOUSE,
  FAMILY_RELATIONSHIPS.PARENT,
  FAMILY_RELATIONSHIPS.CHILD,
  FAMILY_RELATIONSHIPS.SIBLING,
  FAMILY_RELATIONSHIPS.GUARDIAN,
  FAMILY_RELATIONSHIPS.DEPENDENT,
  FAMILY_RELATIONSHIPS.OTHER,
];

const INVERSE = {
  [FAMILY_RELATIONSHIPS.SPOUSE]: FAMILY_RELATIONSHIPS.SPOUSE,
  [FAMILY_RELATIONSHIPS.PARENT]: FAMILY_RELATIONSHIPS.CHILD,
  [FAMILY_RELATIONSHIPS.CHILD]: FAMILY_RELATIONSHIPS.PARENT,
  [FAMILY_RELATIONSHIPS.SIBLING]: FAMILY_RELATIONSHIPS.SIBLING,
  [FAMILY_RELATIONSHIPS.GUARDIAN]: FAMILY_RELATIONSHIPS.DEPENDENT,
  [FAMILY_RELATIONSHIPS.DEPENDENT]: FAMILY_RELATIONSHIPS.GUARDIAN,
  [FAMILY_RELATIONSHIPS.OTHER]: FAMILY_RELATIONSHIPS.OTHER,
};

export function normalizeFamilyRelationship(value) {
  if (ASSIGNABLE_FAMILY_RELATIONSHIPS.includes(value)) return value;
  return FAMILY_RELATIONSHIPS.OTHER;
}

export function inverseFamilyRelationship(value) {
  const r = normalizeFamilyRelationship(value);
  return INVERSE[r] || FAMILY_RELATIONSHIPS.OTHER;
}

export function familyRelationshipLabelKey(value) {
  return `admin.users.familyRole.${normalizeFamilyRelationship(value)}`;
}
