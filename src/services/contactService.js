import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

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

export const updateContactMessageStatus = (id, status) =>
  updateDoc(doc(db, 'contactMessages', id), { status });

export const updatePrayerRequestStatus = (id, status) =>
  updateDoc(doc(db, 'prayerRequests', id), { status });
