import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
