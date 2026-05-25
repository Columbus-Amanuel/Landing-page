/**
 * Extract an 11-character YouTube video id from any common share URL or id.
 *
 * Accepts:
 *  - bare id ("9tFh_EwJWdc")
 *  - https://youtu.be/<id>
 *  - https://www.youtube.com/watch?v=<id>
 *  - https://www.youtube.com/embed/<id>
 *  - https://www.youtube.com/shorts/<id>
 *
 * @param {string} input
 * @returns {string} The 11-char id, or empty string if unrecognised.
 */
export function getYoutubeVideoId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname === 'youtu.be') {
      return url.pathname.replace(/^\//, '').slice(0, 11);
    }
    if (url.hostname.endsWith('youtube.com') || url.hostname.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v');
      if (v) return v.slice(0, 11);
      const parts = url.pathname.split('/').filter(Boolean);
      const i = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (i !== -1 && parts[i + 1]) return parts[i + 1].slice(0, 11);
    }
  } catch {
    return '';
  }
  return '';
}

/**
 * Build the default `hqdefault.jpg` thumbnail for a YouTube id.
 *
 * @param {string} idOrUrl
 */
export function getYoutubeDefaultThumbnailUrl(idOrUrl) {
  const id = getYoutubeVideoId(idOrUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

/**
 * Build a privacy-friendly nocookie embed URL.
 *
 * @param {string} idOrUrl
 * @param {{ autoplay?: boolean, mute?: boolean, loop?: boolean, controls?: boolean }} [opts]
 */
export function getYoutubeEmbedUrl(idOrUrl, opts = {}) {
  const id = getYoutubeVideoId(idOrUrl);
  if (!id) return '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (opts.autoplay) params.set('autoplay', '1');
  if (opts.mute) params.set('mute', '1');
  if (opts.controls === false) params.set('controls', '0');
  if (opts.loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
