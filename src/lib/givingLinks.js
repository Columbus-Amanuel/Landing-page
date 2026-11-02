/**
 * Payment links for the Give page. Account names and tags are stored on
 * `siteSettings/giving`; these helpers turn them into app or web URLs.
 */

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function zelleToken(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

/** @param {string} cashtag Cash App tag, with or without a leading `$`. */
export function cashAppPayUrl(cashtag) {
  const raw = String(cashtag || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const tag = raw.replace(/^\$/, '').split(/[/?#]/)[0];
  if (!tag) return '';
  return `https://cash.app/$${encodeURIComponent(tag)}?qr=1`;
}

/**
 * Zelle QR enrollment link. `name` is the recipient shown in the payer's bank app.
 * @param {string} phone
 * @param {string} name
 */
export function zellePayUrl(phone, name) {
  const token = zelleToken(phone);
  const recipient = String(name || '').trim().replace(/\s+/g, ' ');
  if (!token || !recipient) return '';
  const safeName = recipient.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const payload = `{\n  "token" : "${token}",\n  "name" : "${safeName}",\n  "action" : "payment"\n}`;
  return `https://enroll.zellepay.com/qr-codes?data=${encodeBase64(payload)}`;
}

/** @param {string} username Venmo username, with or without `@`. */
export function venmoPayUrl(username) {
  const raw = String(username || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const name = raw.replace(/^@/, '').replace(/^(www\.)?venmo\.com\/(u\/)?/i, '').split(/[/?#]/)[0];
  if (!name) return '';
  return `https://venmo.com/u/${encodeURIComponent(name)}`;
}

/** @param {string} handle PayPal.me name, with or without `paypal.me/`. */
export function paypalPayUrl(handle) {
  const raw = String(handle || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const name = raw
    .replace(/^@/, '')
    .replace(/^(www\.)?paypal\.me\//i, '')
    .split(/[/?#]/)[0];
  if (!name) return '';
  return `https://paypal.me/${encodeURIComponent(name)}`;
}

/** @param {string} url Giving-page address from Givelify, Tithe.ly, Planning Center, or similar. */
export function onlineGivingPayUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/** A method is public when the admin left it on and its account value is filled in. */
export function isGivingMethodVisible(enabled, account) {
  return enabled !== false && String(account || '').trim() !== '';
}
