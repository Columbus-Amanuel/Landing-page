/** Keys match Heroicons used in `ValueIcon.jsx`. Legacy emoji values migrate on save. */
export const LEGACY_EMOJI_TO_KEY = {
  '🙏': 'handRaised',
  '📖': 'bookOpen',
  '👨‍👩‍👧‍👦': 'userGroup',
  '🌍': 'globeAlt',
};

export const VALUE_ICON_OPTIONS = [
  { value: 'handRaised', label: 'Worship / prayer' },
  { value: 'bookOpen', label: 'Scripture / teaching' },
  { value: 'userGroup', label: 'Community / family' },
  { value: 'globeAlt', label: 'World / outreach' },
  { value: 'heart', label: 'Love / care' },
  { value: 'musicalNote', label: 'Music' },
  { value: 'academicCap', label: 'Learning' },
  { value: 'sun', label: 'Light / hope' },
  { value: 'sparkles', label: 'Joy / celebration' },
];

const VALID_KEYS = new Set(VALUE_ICON_OPTIONS.map((o) => o.value));

export function normalizeValueIconKey(value) {
  if (!value || typeof value !== 'string') return 'sparkles';
  const trimmed = value.trim();
  if (LEGACY_EMOJI_TO_KEY[trimmed]) return LEGACY_EMOJI_TO_KEY[trimmed];
  if (VALID_KEYS.has(trimmed)) return trimmed;
  return 'sparkles';
}
