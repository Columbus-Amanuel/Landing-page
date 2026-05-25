import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ASSIGNABLE_ROLES } from '@/lib/roles';

/** Lightweight directory docs for paginated admin lists (minimal fields). */
export const USER_INDEX_COLLECTION = 'userIndex';

export const USER_DIRECTORY_PAGE_SIZE = 40;

/**
 * One page of directory rows (super-admin only). Ordered by display name, then doc id.
 *
 * @param {number} [pageSize]
 * @param {import('firebase/firestore').QueryDocumentSnapshot | null} [cursor] last doc from previous page
 * @returns {Promise<{ items: Array<{ id: string, displayName?: string, email?: string, role?: string }>, lastDoc: import('firebase/firestore').QueryDocumentSnapshot | null, hasMore: boolean }>}
 */
export async function fetchUserDirectoryPage(pageSize = USER_DIRECTORY_PAGE_SIZE, cursor = null) {
  const constraints = [
    orderBy('displayName'),
    orderBy(documentId()),
    limit(pageSize),
  ];
  if (cursor) constraints.push(startAfter(cursor));
  const q = query(collection(db, USER_INDEX_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  const hasMore = snap.docs.length === pageSize;
  return { items, lastDoc, hasMore };
}

/**
 * Full profile from `users/{uid}` (super-admin or owner via existing user rules).
 * @param {string} uid
 */
export async function fetchUserDetail(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id };
}

/** @param {string} uid @param {'member' | 'admin' | 'super-admin'} role */
export async function updateUserRole(uid, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new Error('Invalid role');
  }
  const uSnap = await getDoc(doc(db, 'users', uid));
  if (!uSnap.exists()) {
    throw new Error('User not found');
  }
  const u = uSnap.data();
  const batch = writeBatch(db);
  const ts = serverTimestamp();
  batch.update(doc(db, 'users', uid), { role, updatedAt: ts });
  batch.set(
    doc(db, USER_INDEX_COLLECTION, uid),
    {
      displayName: (u.displayName && String(u.displayName).trim()) || '',
      email: u.email || '',
      role,
      createdAt: u.createdAt || ts,
    },
    { merge: true },
  );
  await batch.commit();
}

/**
 * Rebuild `userIndex` from `users` in chunks (super-admin only). Call once if the
 * directory is empty or out of date after older accounts were created.
 * @param {(processed: number) => void} [onProgress]
 * @returns {Promise<number>} total rows written
 */
export async function rebuildUserDirectoryIndex(onProgress) {
  const CHUNK = 400;
  let lastDoc = null;
  let total = 0;
  // Stable scan: every `users` doc has an id; avoids excluding docs missing `displayName`.
  while (true) {
    const constraints = [orderBy(documentId()), limit(CHUNK)];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    const snap = await getDocs(query(collection(db, 'users'), ...constraints));
    if (snap.empty) break;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      const u = d.data();
      batch.set(
        doc(db, USER_INDEX_COLLECTION, d.id),
        {
          displayName: (u.displayName && String(u.displayName).trim()) || '',
          email: u.email || '',
          role: u.role || 'member',
          createdAt: u.createdAt || serverTimestamp(),
        },
        { merge: true },
      );
    });
    await batch.commit();
    total += snap.docs.length;
    onProgress?.(total);
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < CHUNK) break;
  }
  return total;
}
