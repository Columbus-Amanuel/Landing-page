import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const EVENTS_COLLECTION = 'events';

export const getUpcomingEvents = async (count = 10) => {
  const now = new Date();
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('date', '>=', now),
    orderBy('date', 'asc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllEvents = async () => {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getEventById = async (id) => {
  const snap = await getDoc(doc(db, EVENTS_COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createEvent = (data) =>
  addDoc(collection(db, EVENTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateEvent = (id, data) =>
  updateDoc(doc(db, EVENTS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteEvent = (id) => deleteDoc(doc(db, EVENTS_COLLECTION, id));
