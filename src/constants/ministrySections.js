/**
 * Fixed section types for public ministry pages. Each ministry stores an ordered
 * subset in Firestore (`sections`); unknown ids are ignored at render time.
 *
 * Hero (title + subtitle) always renders first — it is not part of this list.
 */
export const MINISTRY_SECTION_IDS = ['intro', 'stats', 'programs', 'videos', 'faqs', 'cta'];

/** Default order when building a new ministry or normalizing legacy data */
export const DEFAULT_MINISTRY_SECTIONS = [...MINISTRY_SECTION_IDS];

const ALLOWED = new Set(MINISTRY_SECTION_IDS);

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeMinistrySections(raw) {
  if (raw == null || !Array.isArray(raw)) return [...DEFAULT_MINISTRY_SECTIONS];
  const out = [];
  const seen = new Set();
  for (const id of raw) {
    if (typeof id !== 'string' || !ALLOWED.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  if (out.length === 0) return [...DEFAULT_MINISTRY_SECTIONS];
  return out;
}

export function isMinistrySectionId(id) {
  return typeof id === 'string' && ALLOWED.has(id);
}
