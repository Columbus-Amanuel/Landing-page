import { format } from 'date-fns';

/**
 * Firestore stores dates as `Timestamp` objects. UI code receives either a
 * Timestamp (with `.toDate()`) or a plain string/Date. This normalizes both.
 *
 * @param {unknown} value
 * @returns {Date | null}
 */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format a Firestore-or-Date value with a date-fns format string.
 *
 * @param {unknown} value
 * @param {string} pattern
 * @returns {string}
 */
export function formatDate(value, pattern = 'MMMM d, yyyy') {
  const date = toDate(value);
  return date ? format(date, pattern) : '';
}

/**
 * Format a time-only value (e.g. "16:00").
 *
 * @param {unknown} value
 * @returns {string}
 */
export function formatTime(value) {
  return formatDate(value, 'h:mm a');
}

/**
 * Pretty-print a phone number for `tel:` links and display.
 * Falls back to the raw value when the digit count doesn't match a known shape.
 *
 * @param {string} value
 * @returns {string}
 */
export function formatPhoneDisplay(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
}

/**
 * Build a `tel:` href, normalising whitespace and dashes.
 *
 * @param {string} value
 * @returns {string}
 */
export function toTelHref(value) {
  if (!value) return '';
  const digits = String(value).replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

/**
 * Build a `mailto:` href that is safe to drop into JSX.
 *
 * @param {string} email
 * @param {{ subject?: string, body?: string }} [opts]
 */
export function toMailtoHref(email, opts = {}) {
  if (!email) return '';
  const params = new URLSearchParams();
  if (opts.subject) params.set('subject', opts.subject);
  if (opts.body) params.set('body', opts.body);
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/**
 * Build a Google Maps "directions" link for a postal address.
 *
 * @param {string} address
 */
export function toMapsHref(address) {
  if (!address) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Format a number as USD currency (no decimals for round amounts).
 *
 * @param {number | string} value
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  const fractionDigits = num % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

/**
 * Take the first two initials from a name string ("Pastor Daniel Tilaye" -> "DT").
 *
 * @param {string} name
 */
export function getInitials(name) {
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
