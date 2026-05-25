import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_YOUTH_CONTENT } from './siteSettingsService';
import {
  DEFAULT_MINISTRY_SECTIONS,
  normalizeMinistrySections,
} from '@/constants/ministrySections';

const COL = 'ministries';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * @param {string} slug
 * @returns {string}
 */
export function normalizeMinistrySlug(slug) {
  return String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function isValidMinistrySlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug) && slug.length >= 2 && slug.length <= 80;
}

/**
 * @param {import('firebase/firestore').DocumentSnapshot} d
 */
function mapDoc(d) {
  const raw = d.data() || {};
  return {
    id: d.id,
    ...DEFAULT_YOUTH_CONTENT,
    ...raw,
    slug: raw.slug ?? '',
    navLabelEn: raw.navLabelEn ?? '',
    navLabelAm: raw.navLabelAm ?? '',
    enabled: raw.enabled !== false,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
    sections: normalizeMinistrySections(raw.sections),
  };
}

/**
 * @returns {Record<string, unknown>}
 */
export function newMinistryTemplate() {
  return {
    slug: '',
    navLabelEn: '',
    navLabelAm: '',
    enabled: true,
    sortOrder: 0,
    sections: [...DEFAULT_MINISTRY_SECTIONS],
    ...DEFAULT_YOUTH_CONTENT,
  };
}

export async function listPublicMinistriesOrdered() {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => mapDoc(d))
      .filter((m) => m.enabled !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
}

export async function listAllMinistriesAdmin() {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => mapDoc(d))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
}

/**
 * @param {string} slug
 * @param {string | undefined} excludeDocId
 */
export async function isMinistrySlugTaken(slug, excludeDocId) {
  const s = normalizeMinistrySlug(slug);
  if (!s) return false;
  const qy = query(collection(db, COL), where('slug', '==', s), limit(5));
  const snap = await getDocs(qy);
  for (const d of snap.docs) {
    if (d.id !== excludeDocId) return true;
  }
  return false;
}

export async function getMinistryById(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return mapDoc(snap);
}

export async function getMinistryBySlugFromFirestore(slug) {
  const s = normalizeMinistrySlug(slug);
  if (!s) return null;
  const qy = query(collection(db, COL), where('slug', '==', s), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  return mapDoc(snap.docs[0]);
}

/**
 * Public ministry payload: Firestore doc, or legacy Youth & Children from siteSettings.
 *
 * @param {string} slug
 * @param {Record<string, unknown>} youthContent — from `siteSettings/youth` merge
 */
export async function resolvePublicMinistry(slug, youthContent) {
  const s = normalizeMinistrySlug(slug);
  if (!s) return null;
  const fromDb = await getMinistryBySlugFromFirestore(s);
  if (fromDb) return { legacyYouth: false, ministry: fromDb };
  if (s === 'youth-children') {
    const merged = { ...DEFAULT_YOUTH_CONTENT, ...youthContent };
    return {
      legacyYouth: true,
      ministry: {
        id: null,
        slug: 'youth-children',
        navLabelEn: merged.heroTitleEn,
        navLabelAm: merged.heroTitleAm,
        enabled: true,
        sections: normalizeMinistrySections(undefined),
        ...merged,
      },
    };
  }
  return null;
}

/**
 * @param {Record<string, unknown>} data
 */
function sanitizeWritePayload(data) {
  const {
    slug,
    navLabelEn,
    navLabelAm,
    enabled,
    sortOrder,
    sections,
    id: _omitId,
    createdAt: _c,
    updatedAt: _u,
    ...rest
  } = data;

  const base = {
    ...DEFAULT_YOUTH_CONTENT,
    ...rest,
    slug: normalizeMinistrySlug(slug),
    navLabelEn: String(navLabelEn ?? '').trim(),
    navLabelAm: String(navLabelAm ?? '').trim(),
    enabled: enabled !== false,
    sortOrder: typeof sortOrder === 'number' && !Number.isNaN(sortOrder) ? sortOrder : 0,
    sections: normalizeMinistrySections(sections),
    updatedAt: serverTimestamp(),
  };

  return base;
}

export async function createMinistry(data) {
  const payload = sanitizeWritePayload(data);
  if (!isValidMinistrySlug(payload.slug)) {
    throw new Error('Invalid URL slug (use lowercase letters, numbers, and hyphens).');
  }
  if (await isMinistrySlugTaken(payload.slug)) {
    throw new Error('That URL slug is already in use.');
  }
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMinistry(docId, data) {
  const payload = sanitizeWritePayload(data);
  if (!isValidMinistrySlug(payload.slug)) {
    throw new Error('Invalid URL slug (use lowercase letters, numbers, and hyphens).');
  }
  if (await isMinistrySlugTaken(payload.slug, docId)) {
    throw new Error('That URL slug is already in use.');
  }
  await setDoc(doc(db, COL, docId), payload, { merge: true });
}

export async function deleteMinistry(docId) {
  await deleteDoc(doc(db, COL, docId));
}

/**
 * Nav entries: enabled Firestore ministries, plus legacy Youth when no doc claims `youth-children`.
 *
 * @returns {Promise<{ key: string, to: string, labelEn: string, labelAm: string }[]>}
 */
export async function buildMinistriesNavItems() {
  const list = await listPublicMinistriesOrdered();
  const hasYouthDoc = list.some((m) => m.slug === 'youth-children');
  const items = list.map((m) => ({
    key: `ministry-${m.id}`,
    to: `/ministries/${encodeURIComponent(m.slug)}`,
    labelEn: m.navLabelEn || m.heroTitleEn || m.slug,
    labelAm: m.navLabelAm || m.heroTitleAm || m.navLabelEn || m.slug,
  }));
  if (!hasYouthDoc) {
    items.unshift({
      key: 'ministry-legacy-youth',
      to: '/youth-children',
      labelEn: DEFAULT_YOUTH_CONTENT.heroTitleEn,
      labelAm: DEFAULT_YOUTH_CONTENT.heroTitleAm,
    });
  }
  return items;
}
