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
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const YOUTH_VIDEOS_COLLECTION = 'youthVideos';
const YOUTH_PAGE_COLLECTION = 'youthPageContent';
const YOUTH_PAGE_DOC_ID = 'main';

/** Persisted string fields on youthPageContent/main (excludes faqs array). */
export const YOUTH_PAGE_STRING_KEYS = [
  'heroTitleEn',
  'heroTitleAm',
  'heroSubtitleEn',
  'heroSubtitleAm',
  'introTitleEn',
  'introTitleAm',
  'introBodyEn',
  'introBodyAm',
  'statsSectionTitleEn',
  'statsSectionTitleAm',
  'stat1Value',
  'stat1LabelEn',
  'stat1LabelAm',
  'stat2Value',
  'stat2LabelEn',
  'stat2LabelAm',
  'stat3Value',
  'stat3LabelEn',
  'stat3LabelAm',
  'ministrySectionTitleEn',
  'ministrySectionTitleAm',
  'videosSectionTitleEn',
  'videosSectionTitleAm',
  'faqSectionTitleEn',
  'faqSectionTitleAm',
  'cardOneTitleEn',
  'cardOneTitleAm',
  'cardOneDescriptionEn',
  'cardOneDescriptionAm',
  'cardTwoTitleEn',
  'cardTwoTitleAm',
  'cardTwoDescriptionEn',
  'cardTwoDescriptionAm',
  'cardThreeTitleEn',
  'cardThreeTitleAm',
  'cardThreeDescriptionEn',
  'cardThreeDescriptionAm',
  'ctaTitleEn',
  'ctaTitleAm',
  'ctaButtonEn',
  'ctaButtonAm',
  'ctaHref',
  'emptyVideosMessageEn',
  'emptyVideosMessageAm',
];

export const defaultYouthPageFormState = () => {
  const o = { faqs: [] };
  YOUTH_PAGE_STRING_KEYS.forEach((k) => {
    o[k] = '';
  });
  return o;
};

export function sanitizeYouthPageContentForSave(data) {
  const out = {};
  YOUTH_PAGE_STRING_KEYS.forEach((k) => {
    const v = data[k];
    out[k] = v == null ? '' : String(v);
  });
  out.faqs = Array.isArray(data.faqs)
    ? data.faqs.map((item) => ({
        questionEn: String(item?.questionEn ?? ''),
        questionAm: String(item?.questionAm ?? ''),
        answerEn: String(item?.answerEn ?? ''),
        answerAm: String(item?.answerAm ?? ''),
      }))
    : [];
  return out;
}

/** Merge Firestore doc with defaults; strips non-form fields like updatedAt. */
export function normalizeYouthPageContent(raw) {
  const base = defaultYouthPageFormState();
  if (!raw || typeof raw !== 'object') return base;
  const out = { ...base };
  YOUTH_PAGE_STRING_KEYS.forEach((k) => {
    if (raw[k] != null && typeof raw[k] === 'string') out[k] = raw[k];
  });
  if (Array.isArray(raw.faqs)) {
    out.faqs = raw.faqs.map((item) => ({
      questionEn: String(item?.questionEn ?? ''),
      questionAm: String(item?.questionAm ?? ''),
      answerEn: String(item?.answerEn ?? ''),
      answerAm: String(item?.answerAm ?? ''),
    }));
  }
  return out;
}

export function getYoutubeVideoId(url = '') {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';
  const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = trimmedUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return '';
}

/** Default YouTube still image for a video id when no custom thumbnail is set. */
export function getYoutubeDefaultThumbnailUrl(videoId) {
  const id = typeof videoId === 'string' ? videoId.trim() : '';
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export const getYouthVideos = async () => {
  const q = query(collection(db, YOUTH_VIDEOS_COLLECTION), orderBy('sortOrder', 'asc'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((videoDoc) => ({ id: videoDoc.id, ...videoDoc.data() }));
};

export const createYouthVideo = (data) => addDoc(collection(db, YOUTH_VIDEOS_COLLECTION), {
  title: String(data.title ?? ''),
  titleAm: String(data.titleAm ?? ''),
  description: String(data.description ?? ''),
  descriptionAm: String(data.descriptionAm ?? ''),
  url: String(data.url ?? ''),
  speaker: String(data.speaker ?? ''),
  category: String(data.category ?? ''),
  duration: String(data.duration ?? ''),
  thumbnailUrl: String(data.thumbnailUrl ?? ''),
  sortOrder: Number(data.sortOrder) || 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const updateYouthVideo = (id, data) => updateDoc(doc(db, YOUTH_VIDEOS_COLLECTION, id), {
  title: String(data.title ?? ''),
  titleAm: String(data.titleAm ?? ''),
  description: String(data.description ?? ''),
  descriptionAm: String(data.descriptionAm ?? ''),
  url: String(data.url ?? ''),
  speaker: String(data.speaker ?? ''),
  category: String(data.category ?? ''),
  duration: String(data.duration ?? ''),
  thumbnailUrl: String(data.thumbnailUrl ?? ''),
  sortOrder: Number(data.sortOrder) || 0,
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
    ...sanitizeYouthPageContentForSave(data),
    updatedAt: serverTimestamp(),
  },
  { merge: true },
);
