import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const YOUTH_VIDEOS_COLLECTION = 'youthVideos';
const YOUTH_PAGE_COLLECTION = 'youthPageContent';
const YOUTH_PAGE_DOC_ID = 'main';

export const getYouthVideos = async () => {
  const q = query(collection(db, YOUTH_VIDEOS_COLLECTION), orderBy('sortOrder', 'asc'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((videoDoc) => ({ id: videoDoc.id, ...videoDoc.data() }));
};

export const createYouthVideo = (data) => addDoc(collection(db, YOUTH_VIDEOS_COLLECTION), {
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const deleteYouthVideo = (id) => deleteDoc(doc(db, YOUTH_VIDEOS_COLLECTION, id));

export const getYouthPageContent = async () => {
  const snap = await getDoc(doc(db, YOUTH_PAGE_COLLECTION, YOUTH_PAGE_DOC_ID));
  return snap.exists() ? snap.data() : null;
};

export const updateYouthPageContent = (data) => setDoc(
  doc(db, YOUTH_PAGE_COLLECTION, YOUTH_PAGE_DOC_ID),
  {
    ...data,
    updatedAt: serverTimestamp(),
  },
  { merge: true },
);
