import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getChurchInfo,
  getGivingSettings,
  getYouthContent,
  DEFAULT_CHURCH_INFO,
  DEFAULT_GIVING_SETTINGS,
  DEFAULT_YOUTH_CONTENT,
} from '../services/siteSettingsService';
import { buildMinistriesNavItems } from '../services/ministriesService';
import { ROUTES } from '../constants/routes';

const SiteSettingsContext = createContext(null);

const INITIAL_MINISTRIES_NAV = [
  {
    key: 'ministry-legacy-youth',
    to: ROUTES.youthChildren,
    labelEn: DEFAULT_YOUTH_CONTENT.heroTitleEn,
    labelAm: DEFAULT_YOUTH_CONTENT.heroTitleAm,
  },
];

/**
 * Loads the three Firestore docs that drive site-wide content:
 *  - churchInfo  (address, mission, beliefs, values, service times)
 *  - giving      (funds list, scripture, planned giving)
 *  - youth       (legacy Youth & Children copy when no `ministries` doc claims that slug)
 *
 * Also loads enabled ministry links for the public navbar / footer.
 *
 * Falls back to defaults from `src/constants/site.js` + `siteSettingsService`
 * so the UI always renders even with empty Firestore.
 */
export function SiteSettingsProvider({ children }) {
  const [churchInfo, setChurchInfo] = useState(DEFAULT_CHURCH_INFO);
  const [givingSettings, setGivingSettings] = useState(DEFAULT_GIVING_SETTINGS);
  const [youthContent, setYouthContent] = useState(DEFAULT_YOUTH_CONTENT);
  const [ministriesNav, setMinistriesNav] = useState(INITIAL_MINISTRIES_NAV);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [info, giving, youth, navMin] = await Promise.all([
      getChurchInfo(),
      getGivingSettings(),
      getYouthContent(),
      buildMinistriesNavItems(),
    ]);
    setChurchInfo(info);
    setGivingSettings(giving);
    setYouthContent(youth);
    setMinistriesNav(navMin?.length ? navMin : INITIAL_MINISTRIES_NAV);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider
      value={{ churchInfo, givingSettings, youthContent, ministriesNav, loading, refresh }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used inside SiteSettingsProvider');
  }
  return ctx;
}
