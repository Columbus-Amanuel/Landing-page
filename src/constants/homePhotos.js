/**
 * Optional photography for the home page "Fidel poster" layout.
 *
 * Every slot is optional: a slot with no `src` is simply not rendered, so the
 * page looks complete with zero photos. To add a photo, drop the file in
 * `public/photos/` and reference it here (e.g. `src: '/photos/worship.jpg'`).
 * Photos are shown with a blue duotone wash so they match the church seal.
 *
 * @typedef {{ src: string, alt?: string, altAm?: string }} HomePhoto
 */

/** Small portrait that overlaps the hero video frame (e.g. the pastor). */
export const HERO_SECONDARY_PHOTO = { src: '', alt: '' };

/** Up to two photos shown under the large service time (sanctuary, Bible study). */
export const SERVICE_TIMES_PHOTOS = [];

/**
 * "Life at Emmanuel" photo wall. The section only appears once at least one
 * photo is listed. Seven photos fill the full poster collage.
 * @type {HomePhoto[]}
 */
export const GALLERY_PHOTOS = [];

/** Tall photo beside the mission values (e.g. community outreach). */
export const MISSION_PHOTO = { src: '', alt: '' };

/** Round portrait in the pastoral-contact card. */
export const PASTOR_PHOTO = { src: '', alt: '' };
