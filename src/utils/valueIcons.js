/**
 * Mission value icon keys + legacy emoji map. Used by `<ValueIcon />` to
 * look up the right Lucide icon for `churchInfo.values[].icon`.
 *
 * Legacy admin entries may still carry an emoji string (e.g. "📖"); the
 * `normalizeValueIconKey` helper translates those to the canonical key.
 */

export const VALUE_ICON_KEYS = ['book', 'heart', 'hands', 'sparkles', 'flame', 'globe', 'shield', 'users'];

const LEGACY_EMOJI_TO_KEY = {
  '📖': 'book',
  '📚': 'book',
  '❤️': 'heart',
  '💛': 'heart',
  '🙏': 'hands',
  '👐': 'hands',
  '✨': 'sparkles',
  '🔥': 'flame',
  '🌍': 'globe',
  '🌎': 'globe',
  '🛡️': 'shield',
  '👥': 'users',
};

export function normalizeValueIconKey(input) {
  if (!input) return 'sparkles';
  const value = String(input).trim();
  if (VALUE_ICON_KEYS.includes(value)) return value;
  if (LEGACY_EMOJI_TO_KEY[value]) return LEGACY_EMOJI_TO_KEY[value];
  return 'sparkles';
}
