/**
 * Default options for the Give page. The actual fund list and giving URL are
 * sourced from `siteSettings.giving` in Firestore, but these are the safe
 * fallbacks if the admin hasn't configured them yet.
 */

export const AMOUNT_PRESETS = [25, 50, 100, 250, 500, 1000];

export const FREQUENCIES = [
  { id: 'oneTime', labelKey: 'give.oneTime' },
  { id: 'weekly', labelKey: 'give.weekly' },
  { id: 'monthly', labelKey: 'give.monthly' },
];

export const FUNDS_FALLBACK = [
  {
    id: 'general',
    label: 'General Tithes & Offerings',
    labelAm: 'መደበኛ መዋጮ እና አስራት',
    desc: 'Supports day-to-day church operations and ministries.',
    descAm: 'የመደበኛ ቤተክርስቲያን አገልግሎቶችን ይደግፋል።',
  },
  {
    id: 'missions',
    label: 'Missions & Outreach',
    labelAm: 'ሚሲዮናዊ አገልግሎት',
    desc: 'Funds local outreach and global mission partners.',
    descAm: 'የውጭ ሚሲዮናዊ አጋርነቶችን ይደግፋል።',
  },
  {
    id: 'building',
    label: 'Building Fund',
    labelAm: 'የግንባታ ፈንድ',
    desc: 'Maintenance and expansion of our church facility.',
    descAm: 'የቤተክርስቲያን ሕንፃ ጥገና እና ማስፋፊያ።',
  },
];
