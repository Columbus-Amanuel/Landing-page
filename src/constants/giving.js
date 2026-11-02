/**
 * Fallback fund list for the Give page. The live list comes from
 * `siteSettings.giving` in Firestore when an admin has saved one.
 */

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
