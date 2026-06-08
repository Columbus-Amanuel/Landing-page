import { FAMILY_RELATIONSHIPS, normalizeFamilyRelationship } from '@/lib/familyRelationships';

/**
 * @typedef {Object} TreePersonNode
 * @property {'person'} kind
 * @property {string} id
 * @property {string} userId
 * @property {string} label
 * @property {boolean} [isRoot]
 */

/**
 * @typedef {Object} TreeGhostNode
 * @property {'ghost'} kind
 * @property {string} id
 * @property {'mother' | 'father'} ghostRole
 * @property {string} labelKey
 */

/**
 * @typedef {TreePersonNode | TreeGhostNode} TreeNode
 */

/**
 * @typedef {Object} FamilyTreeModel
 * @property {TreeNode[]} parents
 * @property {TreePersonNode[]} siblings
 * @property {TreePersonNode} root
 * @property {TreePersonNode[]} spouses
 * @property {TreePersonNode[]} children
 */

function userLabel(user) {
  if (!user) return '';
  return user.displayName || user.email || user.id || '';
}

/**
 * @param {string} rootUid
 * @param {Array<{ toUserId: string, relationship: string }>} rootLinks
 * @param {Array<{ uid: string, links: Array<{ toUserId: string, relationship: string }> }>} related
 * @param {Array<{ id: string, displayName?: string, email?: string }>} users
 * @returns {FamilyTreeModel}
 */
export function buildFamilyTreeModel(rootUid, rootLinks, related, users) {
  const userById = Object.fromEntries(users.map((u) => [u.id, u]));

  const makePerson = (uid, isRoot = false) => ({
    kind: 'person',
    id: uid,
    userId: uid,
    label: userLabel(userById[uid]) || uid,
    isRoot,
  });

  const parents = new Set();
  const children = new Set();
  const siblings = new Set();
  const spouses = new Set();

  const absorbLinks = (uid, links) => {
    links.forEach((link) => {
      const rel = normalizeFamilyRelationship(link.relationship);
      if (rel === FAMILY_RELATIONSHIPS.PARENT) parents.add(link.toUserId);
      else if (rel === FAMILY_RELATIONSHIPS.CHILD) children.add(link.toUserId);
      else if (rel === FAMILY_RELATIONSHIPS.SIBLING) siblings.add(link.toUserId);
      else if (rel === FAMILY_RELATIONSHIPS.SPOUSE) spouses.add(link.toUserId);
    });
  };

  absorbLinks(rootUid, rootLinks);

  const siblingCluster = new Set([rootUid, ...siblings]);

  related.forEach(({ uid, links }) => {
    if (!siblingCluster.has(uid)) return;
    links.forEach((link) => {
      const rel = normalizeFamilyRelationship(link.relationship);
      if (rel === FAMILY_RELATIONSHIPS.PARENT) parents.add(link.toUserId);
      if (rel === FAMILY_RELATIONSHIPS.SIBLING) {
        siblings.add(link.toUserId);
        siblingCluster.add(link.toUserId);
      }
    });
  });

  // Siblings share the same parents — propagate any known parent across the cluster.
  related.forEach(({ uid, links }) => {
    if (!siblingCluster.has(uid)) return;
    links.forEach((link) => {
      if (normalizeFamilyRelationship(link.relationship) === FAMILY_RELATIONSHIPS.PARENT) {
        parents.add(link.toUserId);
      }
    });
  });

  const siblingIds = [...siblingCluster].filter((id) => id !== rootUid);
  const parentNodes = [...parents].map((uid) => makePerson(uid));

  /** @type {TreeGhostNode[]} */
  const ghostParents = [];
  if (siblingIds.length > 0 && parentNodes.length === 0) {
    ghostParents.push({
      kind: 'ghost',
      id: 'ghost:mother',
      ghostRole: 'mother',
      labelKey: 'admin.users.familyTree.ghostMother',
    });
    ghostParents.push({
      kind: 'ghost',
      id: 'ghost:father',
      ghostRole: 'father',
      labelKey: 'admin.users.familyTree.ghostFather',
    });
  } else if (siblingIds.length > 0 && parentNodes.length === 1) {
    // One known parent for a sibling group — infer the other parent as a ghost.
    ghostParents.push({
      kind: 'ghost',
      id: 'ghost:other-parent',
      ghostRole: 'father',
      labelKey: 'admin.users.familyTree.ghostOtherParent',
    });
  }

  return {
    parents: [...ghostParents, ...parentNodes],
    siblings: siblingIds.map((uid) => makePerson(uid)),
    root: makePerson(rootUid, true),
    spouses: [...spouses].map((uid) => makePerson(uid)),
    children: [...children].map((uid) => makePerson(uid)),
  };
}
