import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  inverseFamilyRelationship,
  normalizeFamilyRelationship,
} from '@/lib/familyRelationships';

export const USER_FAMILY_COLLECTION = 'userFamilyLinks';

/** @param {string} fromUserId @param {string} toUserId */
export function familyLinkDocId(fromUserId, toUserId) {
  return `${fromUserId}_${toUserId}`;
}

function trimOrNull(value) {
  if (value == null || typeof value !== 'string') return null;
  const s = value.trim();
  return s.length ? s : null;
}

/**
 * @param {import('firebase/firestore').QueryDocumentSnapshot} d
 */
function mapFamilyDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    relationship: normalizeFamilyRelationship(data.relationship),
    note: data.note ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Raw links where the user appears on either side.
 * @param {string} uid
 */
export async function listAllFamilyLinksForUser(uid) {
  const [fromSnap, toSnap] = await Promise.all([
    getDocs(query(collection(db, USER_FAMILY_COLLECTION), where('fromUserId', '==', uid))),
    getDocs(query(collection(db, USER_FAMILY_COLLECTION), where('toUserId', '==', uid))),
  ]);
  const byId = new Map();
  [...fromSnap.docs, ...toSnap.docs].forEach((d) => {
    byId.set(d.id, mapFamilyDoc(d));
  });
  return [...byId.values()];
}

/**
 * Family members from `uid`'s perspective for admin UI.
 * @param {string} uid
 * @returns {Promise<Array<{ toUserId: string, relationship: string, note: string }>>}
 */
export async function listUserFamilyLinks(uid) {
  const links = await listAllFamilyLinksForUser(uid);
  const byOther = new Map();

  links.forEach((link) => {
    if (link.fromUserId === uid) {
      byOther.set(link.toUserId, {
        toUserId: link.toUserId,
        relationship: link.relationship,
        note: link.note || '',
      });
      return;
    }
    if (link.toUserId === uid && !byOther.has(link.fromUserId)) {
      byOther.set(link.fromUserId, {
        toUserId: link.fromUserId,
        relationship: inverseFamilyRelationship(link.relationship),
        note: link.note || '',
      });
    }
  });

  return [...byOther.values()].sort((a, b) => a.toUserId.localeCompare(b.toUserId));
}

/**
 * Replace outbound family links for `uid` and keep reciprocal links in sync.
 * @param {string} uid
 * @param {Array<{ toUserId: string, relationship?: string, note?: string }>} links
 */
export async function replaceUserFamilyLinks(uid, links) {
  const next = links
    .filter((row) => row?.toUserId && row.toUserId !== uid)
    .map((row) => ({
      toUserId: row.toUserId,
      relationship: normalizeFamilyRelationship(row.relationship),
      note: trimOrNull(row.note),
    }));

  const nextToIds = new Set(next.map((row) => row.toUserId));
  if (nextToIds.size !== next.length) {
    throw new Error('Duplicate family member');
  }

  const existing = await listAllFamilyLinksForUser(uid);
  const existingOutbound = existing.filter((link) => link.fromUserId === uid);

  const batch = writeBatch(db);
  const ts = serverTimestamp();

  existingOutbound.forEach((link) => {
    if (!nextToIds.has(link.toUserId)) {
      batch.delete(doc(db, USER_FAMILY_COLLECTION, familyLinkDocId(uid, link.toUserId)));
      batch.delete(doc(db, USER_FAMILY_COLLECTION, familyLinkDocId(link.toUserId, uid)));
    }
  });

  next.forEach((row) => {
    const prev = existingOutbound.find((link) => link.toUserId === row.toUserId);
    const inverse = inverseFamilyRelationship(row.relationship);

    batch.set(
      doc(db, USER_FAMILY_COLLECTION, familyLinkDocId(uid, row.toUserId)),
      {
        fromUserId: uid,
        toUserId: row.toUserId,
        relationship: row.relationship,
        note: row.note,
        createdAt: prev?.createdAt || ts,
        updatedAt: ts,
      },
      { merge: true },
    );

    const prevInverse = existing.find(
      (link) => link.fromUserId === row.toUserId && link.toUserId === uid,
    );

    batch.set(
      doc(db, USER_FAMILY_COLLECTION, familyLinkDocId(row.toUserId, uid)),
      {
        fromUserId: row.toUserId,
        toUserId: uid,
        relationship: inverse,
        note: row.note,
        createdAt: prevInverse?.createdAt || ts,
        updatedAt: ts,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

/**
 * Family links for the root user plus one hop through direct relatives (for tree layout).
 * @param {string} rootUid
 */
export async function fetchFamilyTreeContext(rootUid) {
  const rootLinks = await listUserFamilyLinks(rootUid);
  const relatedIds = [...new Set(rootLinks.map((link) => link.toUserId))];
  const related = await Promise.all(
    relatedIds.map(async (uid) => ({
      uid,
      links: await listUserFamilyLinks(uid),
    })),
  );
  return { rootUid, rootLinks, related };
}
