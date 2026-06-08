import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { USER_INDEX_COLLECTION } from './usersAdminService';
import { isStaffRole } from '@/lib/roles';

const STAFF_ROLE_QUERY = ['admin', 'super-admin', 'super_admin'];

export const submitContactForm = (data) =>
  addDoc(collection(db, 'contactMessages'), {
    ...data,
    status: 'unread',
    createdAt: serverTimestamp(),
  });

export const submitPrayerRequest = (data) =>
  addDoc(collection(db, 'prayerRequests'), {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
  });

export const getContactMessages = async () => {
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getPrayerRequests = async () => {
  const q = query(collection(db, 'prayerRequests'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Staff directory rows for inbox assignment (super-admin list on userIndex).
 * @returns {Promise<Array<{ id: string, displayName: string, email?: string, role?: string }>>}
 */
export const fetchStaffForAssignment = async () => {
  const q = query(collection(db, USER_INDEX_COLLECTION), where('role', 'in', STAFF_ROLE_QUERY));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((row) => isStaffRole(row.role))
    .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '', undefined, { sensitivity: 'base' }));
};

function buildStatusPatch(status, actor) {
  const patch = { status };
  if (status === 'resolved' && actor?.uid) {
    patch.resolvedByUid = actor.uid;
    patch.resolvedByName = actor.displayName || actor.email || 'Staff';
    patch.resolvedAt = serverTimestamp();
  }
  return patch;
}

function buildAssigneePatch(assignee) {
  if (assignee?.uid) {
    return {
      assignedToUid: assignee.uid,
      assignedToName: assignee.displayName || assignee.email || 'Staff',
    };
  }
  return { assignedToUid: null, assignedToName: null };
}

export const updateContactMessageStatus = (id, status, actor = null) =>
  updateDoc(doc(db, 'contactMessages', id), buildStatusPatch(status, actor));

export const updatePrayerRequestStatus = (id, status, actor = null) =>
  updateDoc(doc(db, 'prayerRequests', id), buildStatusPatch(status, actor));

export const assignContactMessage = (id, assignee) =>
  updateDoc(doc(db, 'contactMessages', id), buildAssigneePatch(assignee));

export const assignPrayerRequest = (id, assignee) =>
  updateDoc(doc(db, 'prayerRequests', id), buildAssigneePatch(assignee));
