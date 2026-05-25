/**
 * Static "about the church" defaults used until the admin populates
 * `siteSettings.churchInfo` in Firestore. The values here mirror live data
 * on the EEUCC site at 1055 McNaughten Rd, Columbus, OH 43213.
 */

export const SITE = {
  name: 'Ethiopian Emmanuel United Church of Columbus',
  shortName: 'EEUCC',
  tagline: 'A Christ-centered community in Columbus, Ohio.',
  taglineAm: 'በኮሎምበስ ኦሃዮ የክርስቶስ ማዕከል የሆነ ማህበረሰብ።',
  address: '1055 McNaughten Rd',
  city: 'Columbus',
  state: 'OH',
  zip: '43213',
  phone: '+1 (614) 555-0142',
  email: 'info@eeucc.org',
  socials: {
    facebook: 'https://www.facebook.com/',
    youtube: 'https://www.youtube.com/',
    instagram: '',
  },
};

export const DEFAULT_SERVICE_TIMES = [
  { day: 'Sunday', dayAm: 'እሁድ', time: '4:00 PM – 7:00 PM', note: 'In-person & Online', noteAm: 'በቦታ እና በመስመር ላይ' },
  { day: 'Wednesday', dayAm: 'ረቡዕ', time: '7:00 PM', note: 'Midweek Bible Study', noteAm: 'የመካከለኛ ሣምንት ጥናት' },
];

export const DEFAULT_VALUES = [
  { icon: 'book', title: 'Bible-rooted teaching', titleAm: 'መጽሐፍ ቅዱስ መርን ይማራል', desc: 'Every message anchored in scripture.', descAm: 'መልዕክቶቻችን በመጽሐፍ ቅዱስ የተመሰረቱ ናቸው።' },
  { icon: 'heart', title: 'Family worship', titleAm: 'የቤተሰብ አምልኮ', desc: 'Bilingual worship for every generation.', descAm: 'በሁለት ቋንቋዎች ለማንኛውም ትውልድ።' },
  { icon: 'hands', title: 'Active outreach', titleAm: 'የውጪ አገልግሎት', desc: 'Serving Columbus and the Ethiopian diaspora.', descAm: 'ለኮሎምበስ እና ለሐበሻ ማህበረሰብ።' },
  { icon: 'sparkles', title: 'Spirit-led ministry', titleAm: 'በመንፈስ የተመራ', desc: 'Prayer, fellowship and discipleship.', descAm: 'በጸሎት፣ ህብረት እና በትምህርት።' },
];

export const DEFAULT_BELIEFS = [
  { title: 'One God in Trinity', titleAm: 'አንድ አምላክ በሥላሴ', desc: 'We worship one God in three persons: Father, Son, and Holy Spirit.', descAm: 'አንድ አምላክ በሦስት ሰዎች: አባት፣ ወልድ እና መንፈስ ቅዱስ።' },
  { title: 'Scripture is authoritative', titleAm: 'መጽሐፍ ቅዱስ ሥልጣን', desc: 'The Bible is the inspired Word of God and the final authority for life.', descAm: 'መጽሐፍ ቅዱስ የእግዚአብሔር ቃል ነው።' },
  { title: 'Salvation by grace', titleAm: 'መዳን በጸጋ', desc: 'Salvation comes by grace through faith in Jesus Christ.', descAm: 'መዳን በጸጋ በኢየሱስ ክርስቶስ እምነት ይመጣል።' },
];
