import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeMinistryRole } from '@/lib/ministryRoles';

export const USER_MINISTRIES_COLLECTION = 'userMinistries';

/**
 * Stable doc id for one user ↔ ministry link.
 * @param {string} uid
 * @param {string} ministryId
 */
export function membershipDocId(uid, ministryId) {
  return `${uid}_${ministryId}`;
}

function trimOrNull(value) {
  if (value == null || typeof value !== 'string') return null;
  const s = value.trim();
  return s.length ? s : null;
}

/**
 * @param {import('firebase/firestore').QueryDocumentSnapshot} d
 * @returns {{ id: string, uid: string, ministryId: string, role: string, note?: string | null, createdAt?: unknown, updatedAt?: unknown }}
 */
function mapMembershipDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    uid: data.uid,
    ministryId: data.ministryId,
    role: normalizeMinistryRole(data.role),
    note: data.note ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * All ministry memberships for a user, ordered by ministry id.
 * @param {string} uid
 */
export async function listUserMinistries(uid) {
  const q = query(collection(db, USER_MINISTRIES_COLLECTION), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(mapMembershipDoc).sort((a, b) => a.ministryId.localeCompare(b.ministryId));
}

/**
 * All members linked to a ministry (for future roster views).
 * @param {string} ministryId
 */
export async function listMinistryMembers(ministryId) {
  const q = query(collection(db, USER_MINISTRIES_COLLECTION), where('ministryId', '==', ministryId));
  const snap = await getDocs(q);
  return snap.docs.map(mapMembershipDoc);
}

/**
 * Replace a user's ministry memberships in one batch (super-admin).
 * @param {string} uid
 * @param {Array<{ ministryId: string, role?: string, note?: string }>} memberships
 */
export async function replaceUserMinistries(uid, memberships) {
  const existing = await listUserMinistries(uid);
  const next = memberships
    .filter((m) => m?.ministryId)
    .map((m) => ({
      ministryId: m.ministryId,
      role: normalizeMinistryRole(m.role),
      note: trimOrNull(m.note),
    }));

  const nextIds = new Set(next.map((m) => m.ministryId));
  if (nextIds.size !== next.length) {
    throw new Error('Duplicate ministry assignment');
  }

  const batch = writeBatch(db);
  const ts = serverTimestamp();

  existing.forEach((row) => {
    if (!nextIds.has(row.ministryId)) {
      batch.delete(doc(db, USER_MINISTRIES_COLLECTION, row.id));
    }
  });

  next.forEach((m) => {
    const id = membershipDocId(uid, m.ministryId);
    const prev = existing.find((r) => r.ministryId === m.ministryId);
    batch.set(
      doc(db, USER_MINISTRIES_COLLECTION, id),
      {
        uid,
        ministryId: m.ministryId,
        role: m.role,
        note: m.note,
        createdAt: prev?.createdAt || ts,
        updatedAt: ts,
      },
      { merge: true },
    );
  });

  await batch.commit();
}
