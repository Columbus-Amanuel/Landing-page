import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SITE_SETTINGS = 'siteSettings';

export const getChurchInfo = async () => {
  const snap = await getDoc(doc(db, SITE_SETTINGS, 'churchInfo'));
  return snap.exists() ? snap.data() : null;
};

export const updateChurchInfo = (data) =>
  setDoc(
    doc(db, SITE_SETTINGS, 'churchInfo'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );

export const getGivingSettings = async () => {
  const snap = await getDoc(doc(db, SITE_SETTINGS, 'giving'));
  return snap.exists() ? snap.data() : null;
};

export const updateGivingSettings = (data) =>
  setDoc(
    doc(db, SITE_SETTINGS, 'giving'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
