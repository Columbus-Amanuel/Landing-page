import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  getYoutubeVideoId as _getYoutubeVideoId,
  getYoutubeDefaultThumbnailUrl as _getYoutubeDefaultThumbnailUrl,
} from '../lib/youtube';

const COLLECTION = 'youthVideos';

/**
 * Re-export the YouTube helpers from `lib/youtube.js` so legacy imports
 * (`from '../services/youthVideosService'`) keep working.
 */
export const getYoutubeVideoId = _getYoutubeVideoId;
export const getYoutubeDefaultThumbnailUrl = _getYoutubeDefaultThumbnailUrl;

export const getYouthVideos = async () => {
  const q = query(collection(db, COLLECTION), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createYouthVideo = (data) =>
  addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateYouthVideo = (id, data) =>
  updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteYouthVideo = (id) => deleteDoc(doc(db, COLLECTION, id));
