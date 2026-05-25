import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
  DEFAULT_SERVICE_TIMES,
  DEFAULT_VALUES,
  DEFAULT_BELIEFS,
  SITE,
} from '../constants/site';
import { FUNDS_FALLBACK } from '../constants/giving';

const COLLECTION = 'siteSettings';
const CHURCH_INFO_DOC = 'churchInfo';
const GIVING_DOC = 'giving';
const YOUTH_DOC = 'youth';

/* ---------------- Defaults ---------------- */

export const DEFAULT_CHURCH_INFO = {
  name: SITE.name,
  shortName: SITE.shortName,
  tagline: SITE.tagline,
  taglineAm: SITE.taglineAm,
  address: SITE.address,
  city: SITE.city,
  state: SITE.state,
  zip: SITE.zip,
  phone: SITE.phone,
  email: SITE.email,
  facebookUrl: SITE.socials.facebook,
  youtubeUrl: SITE.socials.youtube,
  instagramUrl: SITE.socials.instagram,
  missionStatement:
    'We exist to glorify God through worship, prayer, biblical teaching, and discipleship in our Ethiopian and broader Columbus community.',
  missionStatementAm:
    'እግዚአብሔርን በአምልኮ፣ ጸሎት እና በመጽሐፍ ቅዱሳዊ ትምህርት ለማክበር።',
  storyPara1:
    'EEUCC was founded to serve the spiritual and communal needs of the Ethiopian community in Columbus, Ohio.',
  storyPara1Am:
    'EEUCC በኮሎምበስ ኦሃዮ የሐበሻ ማህበረሰብን አገልግሎት ለመስጠት ተመስርቷል።',
  storyPara2:
    'Today, our doors are open to anyone seeking Christ. We worship bilingually in English and Amharic.',
  storyPara2Am:
    'ዛሬ፣ ለክርስቶስ የሚፈልጉ ሁሉ የተከፈቱ ናቸው። በእንግሊዝኛ እና በአማርኛ እናከብራለን።',
  pastorName: 'Pastor Daniel Tilaye',
  pastorNameAm: 'ፓስተር ዳኒኤል ጥላዬ',
  pastorRole: 'Senior Pastor',
  pastorRoleAm: 'ዋና ፓስተር',
  pastorEmail: SITE.email,
  serviceTimes: DEFAULT_SERVICE_TIMES,
  values: DEFAULT_VALUES,
  beliefs: DEFAULT_BELIEFS,
};

export const DEFAULT_GIVING_SETTINGS = {
  onlineGivingUrl: '',
  textToGiveNumber: '',
  textToGiveKeyword: 'GIVE',
  mailAddress: `${SITE.name}\n${SITE.address}\n${SITE.city}, ${SITE.state} ${SITE.zip}`,
  checksPayableTo: SITE.shortName,
  scriptureText:
    'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.',
  scriptureTextAm:
    'እያንዳንዱ ሰው በልቡ እንደወሰነው ይስጥ፣ በጠባያ ወይም በግድ ሳይሆን፤ እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና።',
  scriptureCite: '2 Corinthians 9:7',
  scriptureCiteAm: '2 ቆሮንቶስ 9፡7',
  plannedGivingText:
    'Consider leaving a legacy gift in your estate planning. Contact our office to learn more.',
  plannedGivingTextAm:
    'በውርስ እቅድዎ ውስጥ ስጦታ ለማስቀመጥ ያስቡ። ለበለጠ መረጃ ቢሮአችንን ያግኙ።',
  funds: FUNDS_FALLBACK,
};

export const DEFAULT_YOUTH_CONTENT = {
  heroTitleEn: 'Youth & Children',
  heroTitleAm: 'ወጣቶች እና ህፃናት',
  heroSubtitleEn:
    'A vibrant ministry where young hearts grow in faith, friendship, and purpose.',
  heroSubtitleAm:
    'ወጣት ልቦች በእምነት፣ በወዳጅነት እና በዓላማ ውስጥ የሚያድጉ ንቁ አገልግሎት።',
  introTitleEn: 'Raising the next generation',
  introTitleAm: 'የቀጣይ ትውልድ ማሳደግ',
  introBodyEn:
    'From toddlers through high schoolers, every age has a place to belong and to grow in Christ.',
  introBodyAm:
    'ከህፃናት ጀምሮ እስከ ሁለተኛ ደረጃ ድረስ ለማደግ ቦታ አለ።',
  ctaTitleEn: 'Bring your family this Sunday',
  ctaTitleAm: 'ቤተሰብዎን በዚህ እሁድ ይዘው ይምጡ',
  ctaButtonEn: 'Plan a visit',
  ctaButtonAm: 'ጉብኝትዎን ያቅዱ',
  stats: [
    { valueEn: '60+', labelEn: 'Children every Sunday', labelAm: 'ህፃናት በሁልቀን' },
    { valueEn: '5', labelEn: 'Age-grouped classes', labelAm: 'በዕድሜ የተከፋፈሉ ክፍሎች' },
    { valueEn: '15+', labelEn: 'Volunteer leaders', labelAm: 'በበጎ ፈቃደኝነት የሚያገለግሉ' },
  ],
  ministries: [
    { titleEn: 'Sunday school', titleAm: 'ሰንበት ት/ቤት', bodyEn: 'Bible stories, songs, and crafts in two languages.', bodyAm: 'መጽሐፍ ቅዱሳዊ ታሪኮች በሁለት ቋንቋ።' },
    { titleEn: 'Teen group', titleAm: 'የወጣቶች ቡድን', bodyEn: 'Weekly fellowship and discipleship for high schoolers.', bodyAm: 'ለሁለተኛ ደረጃ ተማሪዎች ሳምንታዊ ህብረት።' },
    { titleEn: 'Family events', titleAm: 'የቤተሰብ ዝግጅቶች', bodyEn: 'Picnics, retreats, and seasonal celebrations.', bodyAm: 'ፒክኒኮች፣ ጉባኤዎች እና በዓላት።' },
  ],
  faqs: [
    {
      questionEn: 'What ages do you serve?',
      questionAm: 'የትኞቹን ዕድሜዎች ታገለግላላችሁ?',
      answerEn: 'Nursery through 12th grade, grouped into age-appropriate classes.',
      answerAm: 'ከህፃናት እስከ 12ኛ ክፍል ድረስ።',
    },
    {
      questionEn: 'How do I sign my child up?',
      questionAm: 'ልጄን እንዴት እመዘግባለሁ?',
      answerEn: 'Stop by the welcome desk on Sunday — we will walk you through the registration form.',
      answerAm: 'በእሁድ ቀን በደህና መጡ ጠረጴዛ ይምጡ - እንረዳዎታለን።',
    },
    {
      questionEn: 'Are background checks required for volunteers?',
      questionAm: 'ለበጎ ፈቃደኞች ብቁነት ይጠየቃል?',
      answerEn: 'Yes — every adult volunteer completes a background check and child-safety orientation.',
      answerAm: 'አዎ - እያንዳንዱ በጎ ፈቃደኛ የብቃት ምርመራ ያደርጋል።',
    },
  ],
};

/* ---------------- Reads ---------------- */

const readDoc = async (docId, fallback) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, docId));
    return snap.exists() ? { ...fallback, ...snap.data() } : fallback;
  } catch {
    return fallback;
  }
};

export const getChurchInfo = () => readDoc(CHURCH_INFO_DOC, DEFAULT_CHURCH_INFO);
export const getGivingSettings = () => readDoc(GIVING_DOC, DEFAULT_GIVING_SETTINGS);
export const getYouthContent = () => readDoc(YOUTH_DOC, DEFAULT_YOUTH_CONTENT);

/* ---------------- Writes ---------------- */

const writeDoc = (docId, data) =>
  setDoc(
    doc(db, COLLECTION, docId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );

export const updateChurchInfo = (data) => writeDoc(CHURCH_INFO_DOC, data);
export const updateGivingSettings = (data) => writeDoc(GIVING_DOC, data);
export const updateYouthContent = (data) => writeDoc(YOUTH_DOC, data);
