/**
 * Static list of sermon categories shown as filter tabs on `/sermons`.
 * `id` is the stored Firestore value; labels live in i18n.
 *
 * Keep `all` first — the Sermons page uses it as the default state.
 */

export const SERMON_CATEGORIES = [
  { id: 'all', labelKey: 'sermons.categoryAll' },
  { id: 'sunday', labelKey: 'sermons.categorySunday' },
  { id: 'study', labelKey: 'sermons.categoryStudy' },
  { id: 'youth', labelKey: 'sermons.categoryYouth' },
  { id: 'special', labelKey: 'sermons.categorySpecial' },
];

export const CATEGORY_ID_BY_LABEL_KEY = Object.fromEntries(
  SERMON_CATEGORIES.map(({ id, labelKey }) => [labelKey, id]),
);

export const DEFAULT_CATEGORY_ID = SERMON_CATEGORIES[0].id;
