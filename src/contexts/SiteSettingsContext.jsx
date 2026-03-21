/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { getChurchInfo, getGivingSettings } from '../services/siteSettingsService';

const SiteSettingsContext = createContext(null);

export const DEFAULT_CHURCH_INFO = {
  officialName: 'Ethiopian Emmanuel United Church of Columbus',
  amharicName: 'የኢትዮዽያ አማኑኤል ሕብረት ቤተክርስቲያን',
  address: '1055 McNaughten Rd',
  city: 'Columbus',
  state: 'OH',
  zip: '43213',
  phone: '(614) 843-5975',
  email: 'emmanuel.ohio1055@gmail.com',
  facebookUrl: 'https://facebook.com/p/Ethiopian-Emmanuel-United-Church-of-Columbus-100067210424028/',
  youtubeUrl: 'https://youtube.com/@ethiopianemmanuelunitedchu9591',
  missionStatement:
    'We exist to glorify God through worship, prayer, biblical teaching, and discipleship in our Ethiopian and broader Columbus community.',
  missionStatementAm:
    'በአምልኮ፣ በጸሎት፣ በቃሉ ትምህርት እና በደቀ መዝሙርነት፣ በኢትዮጵያ ማህበረሰብ እና ሰፊ ኮለንበስ ውስጥ እግዚአብሔርን ለማክበር እንኖራለን።',
  storyPara1:
    'Ethiopian Emmanuel United Church of Columbus (EEUCC) serves the Ethiopian Christian community in Central Ohio as a Christ-centered church for worship, fellowship, and spiritual growth.',
  storyPara1Am:
    'ኢትዮጵያ አማኑኤል ሕብረት ቤተክርስቲያን (EEUCC) በኮሎምቢያ ኦሃዮ ያለውን የኢትዮጵያ ክርስቲያን ማህበረሰብ ያገለግላል። ቤቱ ለአምልኮ፣ ለሕብረት እና ለመንፈሳዊ እድገት የቀረበ ሲሆን ምዕመናን ሙሉ ሕይወታቸውን ለክርስቶስ ለማሳለፍ ይጣጣሩ።',
  storyPara2:
    'Public church milestones point to a founding period around 2012, and the congregation celebrated 13 years of ministry in 2025. The church is connected to the wider Ethiopian Emmanuel United Church tradition and continues to build a strong bilingual and multicultural ministry in Columbus.',
  storyPara2Am:
    'ቤተ ክርስቲያናችን በ2012 ዓ.ም አካባቢ የተመሰረተ ሲሆን፣ ምዕመናን በ2025 የ13 ዓመት አገልግሎት ወሳኝ ምዕራፍ ደስ ብሏቸዋል። ቤቱ ከሰፊው የኢትዮጵያ አማኑኤል ሕብረት ቤተ ክርስቲያን ቤተሰብ ጋር ተሳስሮ ለሁለት ቋንቋ እና ለባህል ብዝሃነት ሁለተናዊ አገልግሎት ይሰጣል።',
  serviceTimes: [
    { day: 'Sunday', dayAm: 'እሁድ', time: '4:00 PM – 7:00 PM', note: 'Main Worship Service', noteAm: 'ዋና የአምልኮ አገልግሎት' },
  ],
  beliefs: [
    {
      title: 'The Holy Scriptures',
      titleAm: 'ቅዱሳት መጻሕፍት',
      desc: 'We believe the Old and New Testaments are divinely inspired and the final authority for faith, life, and worship.',
      descAm: 'የብሉይ እና አዲስ ኪዳን መጽሐፍ ቅዱሶች በእግዚአብሔር አነሳሽነት የተጻፉ ሲሆን ለእምነት፣ ለሕይወት እና ለአምልኮ የመጨረሻ ስልጣን ናቸው ብለን እናምናለን።',
    },
    {
      title: 'The Trinity',
      titleAm: 'ቅድስት ሥላሴ',
      desc: 'We believe in one God eternally existing as Father, Son, and Holy Spirit.',
      descAm: 'አንድ እግዚአብሔር ለዘለዓለም አብ፣ ወልድ እና መንፈስ ቅዱስ ሆኖ ይኖራል ብለን እናምናለን።',
    },
    {
      title: 'Jesus Christ',
      titleAm: 'ኢየሱስ ክርስቶስ',
      desc: 'Jesus is fully God and fully man. He died for our sins, rose on the third day, and will return in glory.',
      descAm: 'ኢየሱስ ሙሉ እግዚአብሔር እና ሙሉ ሰው ነው። ስለ ኃጢያታችን ሞቶ፣ በሦስተኛ ቀን ተነሳ፣ እና በክብር ይመጣል።',
    },
    {
      title: 'Salvation',
      titleAm: 'ድነት',
      desc: "Salvation is by God's grace through faith in Jesus Christ alone.",
      descAm: 'ድነት በኢየሱስ ክርስቶስ ብቻ ባለው እምነት በእግዚአብሔር ጸጋ ነው።',
    },
    {
      title: 'The Holy Spirit',
      titleAm: 'መንፈስ ቅዱስ',
      desc: 'The Holy Spirit glorifies Christ and empowers believers for holy living and ministry.',
      descAm: 'መንፈስ ቅዱስ ክርስቶስን ያከብራል እና አማኞችን ለቅዱስ ሕይወት እና ለአገልግሎት ያበረታቸዋል።',
    },
    {
      title: 'The Church',
      titleAm: 'ቤተ ክርስቲያን',
      desc: 'The Church is the body of Christ, called to fellowship, discipleship, and proclamation of the Gospel.',
      descAm: 'ቤተ ክርስቲያን የክርስቶስ አካል ሲሆን ለሕብረት፣ ለደቀ መዝሙርነት እና ለምስሬ ስብከት ተጠርቷል።',
    },
  ],
  values: [
    {
      icon: 'handRaised',
      title: 'Spirit-Filled Worship',
      titleAm: 'በመንፈስ የተሞላ አምልኮ',
      desc: 'Worshiping Jesus Christ together as a church family',
      descAm: 'እንደ ቤተ ክርስቲያን ቤተሰብ ሆነን ኢየሱስ ክርስቶስን አብረን ማምለክ',
    },
    {
      icon: 'bookOpen',
      title: 'Biblical Foundation',
      titleAm: 'የመጽሐፍ ቅዱስ መሰረት',
      desc: 'Built on the authority of the Holy Scriptures',
      descAm: 'ሁሉ ነገር በቅዱሳት መጻሕፍት ስልጣን ላይ የተመሰረተ',
    },
    {
      icon: 'userGroup',
      title: 'Family Discipleship',
      titleAm: 'የቤተሰብ ደቀ መዝሙርነት',
      desc: 'Growing families and children in Christian faith',
      descAm: 'ቤተሰቦችን እና ልጆችን በክርስቲያናዊ እምነት ማሳደግ',
    },
    {
      icon: 'globeAlt',
      title: 'Ethiopian Community in Columbus',
      titleAm: 'ኢትዮጵያ ማህበረሰብ በኮለንበስ',
      desc: 'Serving locally while connected to a global church body',
      descAm: 'ዓለም አቀፍ ቤተ ክርስቲያን ጋር ተሳስሮ በአካባቢ ማገልገል',
    },
  ],
};

export const DEFAULT_GIVING = {
  funds: [
    { id: 'general', label: 'General Fund', labelAm: 'አጠቃላይ ፈንድ', desc: 'Supports all church ministries and operations', descAm: 'ሁሉንም የቤተ ክርስቲያን አገልግሎቶችን እና ሥራዎችን ይደግፋል' },
    { id: 'missions', label: 'Missions Fund', labelAm: 'የሚሲዮን ፈንድ', desc: 'Supports global and local mission partners', descAm: 'ዓለም አቀፍ እና አካባቢያዊ ሚሲዮናዊ አጋሮችን ይደግፋል' },
    { id: 'building', label: 'Building Fund', labelAm: 'የሕንፃ ፈንድ', desc: 'Contributes to facility growth and maintenance', descAm: 'ለቦታ እድገት እና ጥበቃ አስተዋፅዖ ያደርጋል' },
    { id: 'benevolence', label: 'Benevolence Fund', labelAm: 'የበጎ አድራጎት ፈንድ', desc: 'Helps families and individuals in need', descAm: 'ለሚያስፈልጋቸው ቤተሰቦች እና ግለሰቦች ይረዳል' },
  ],
  mailPayableTo: 'Ethiopian Emmanuel United Church of Columbus',
  mailAddress: '1055 McNaughten Rd\nColumbus, OH 43213',
  textNumber: '',
  textKeyword: 'GIVE',
  onlineGivingUrl: '',
  plannedGivingText: '',
  plannedGivingTextAm: '',
  scriptureText:
    'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.',
  scriptureCite: '2 Corinthians 9:7',
  scriptureTextAm: 'እያንዳንዳችሁ ትሰጡ ዘንድ በልባችሁ የወሰናችሁትን ስጡ፤ ያዝኑ ሳይሆን ወይም ግድ ሳይሆናቸው፤ ደስ ብሎ ሰጪውን እግዚአብሔር ይወዳልና።',
  scriptureCiteAm: '2 ቆሮንቶስ 9:7',
};

export function SiteSettingsProvider({ children }) {
  const [churchInfo, setChurchInfo] = useState(null);
  const [givingSettings, setGivingSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    Promise.all([getChurchInfo(), getGivingSettings()]).then(([info, giving]) => {
      setChurchInfo(info);
      setGivingSettings(giving);
      setLoading(false);
    });
  }, [reloadKey]);

  const reloadSettings = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const merged = {
    churchInfo: churchInfo ? { ...DEFAULT_CHURCH_INFO, ...churchInfo } : DEFAULT_CHURCH_INFO,
    givingSettings: givingSettings ? { ...DEFAULT_GIVING, ...givingSettings } : DEFAULT_GIVING,
    loading,
    reloadSettings,
  };

  return (
    <SiteSettingsContext.Provider value={merged}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
