import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const YOUTH_VIDEOS_COLLECTION = 'youthVideos';

export const getYouthVideos = async () => {
  const q = query(collection(db, YOUTH_VIDEOS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((videoDoc) => ({ id: videoDoc.id, ...videoDoc.data() }));
};

export const createYouthVideo = (data) => addDoc(collection(db, YOUTH_VIDEOS_COLLECTION), {
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const deleteYouthVideo = (id) => deleteDoc(doc(db, YOUTH_VIDEOS_COLLECTION, id));
