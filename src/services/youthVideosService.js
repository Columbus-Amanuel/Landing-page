import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
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

/** Videos not assigned to a specific ministry (legacy Youth & Children admin). */
export const getYouthVideos = async () => {
  const q = query(collection(db, COLLECTION), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((v) => v.ministryId == null || v.ministryId === '');
};

/**
 * @param {string | null} ministryId — Firestore ministry doc id
 * @param {{ legacyYouthSlug?: boolean }} [options] — when slug is `youth-children`, also include legacy unassigned videos
 */
export const getVideosForMinistry = async (ministryId, options = {}) => {
  const { legacyYouthSlug = false } = options;
  if (!ministryId && legacyYouthSlug) return getYouthVideos();
  if (!ministryId) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      where('ministryId', '==', ministryId),
      orderBy('sortOrder', 'asc'),
    );
    const snap = await getDocs(q);
    let out = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (legacyYouthSlug) {
      const legacy = await getYouthVideos();
      const seen = new Set(out.map((x) => x.id));
      for (const row of legacy) {
        if (!seen.has(row.id)) out.push(row);
      }
      out.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return out;
  } catch {
    const all = await getDocs(query(collection(db, COLLECTION), orderBy('sortOrder', 'asc')));
    const rows = all.docs.map((d) => ({ id: d.id, ...d.data() }));
    return rows.filter(
      (v) =>
        v.ministryId === ministryId ||
        (legacyYouthSlug && (v.ministryId == null || v.ministryId === '')),
    );
  }
};

export const createYouthVideo = (data) => {
  const { ministryId, ...rest } = data;
  const payload = {
    ...rest,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (ministryId) payload.ministryId = ministryId;
  return addDoc(collection(db, COLLECTION), payload);
};

export const updateYouthVideo = (id, data) =>
  updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteYouthVideo = (id) => deleteDoc(doc(db, COLLECTION, id));
