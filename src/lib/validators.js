/**
 * Shared regex / validator helpers used by react-hook-form rules.
 * Keeping them here makes it easy to swap the message wording later.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true if at least 10 digits are present (allows formatting chars). */
export function isValidPhone(value) {
  if (!value) return false;
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 10;
}

/** Returns true for syntactically reasonable email addresses. */
export function isValidEmail(value) {
  return Boolean(value && EMAIL_REGEX.test(String(value)));
}

/** Returns the digits-only form of a phone string (good for storing). */
export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}
