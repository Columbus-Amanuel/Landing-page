import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getChurchInfo,
  getGivingSettings,
  getYouthContent,
  DEFAULT_CHURCH_INFO,
  DEFAULT_GIVING_SETTINGS,
  DEFAULT_YOUTH_CONTENT,
} from '../services/siteSettingsService';

const SiteSettingsContext = createContext(null);

/**
 * Loads the three Firestore docs that drive site-wide content:
 *  - churchInfo  (address, mission, beliefs, values, service times)
 *  - giving      (funds list, scripture, planned giving)
 *  - youth       (youth & children page content)
 *
 * Falls back to defaults from `src/constants/site.js` + `siteSettingsService`
 * so the UI always renders even with empty Firestore.
 */
export function SiteSettingsProvider({ children }) {
  const [churchInfo, setChurchInfo] = useState(DEFAULT_CHURCH_INFO);
  const [givingSettings, setGivingSettings] = useState(DEFAULT_GIVING_SETTINGS);
  const [youthContent, setYouthContent] = useState(DEFAULT_YOUTH_CONTENT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [info, giving, youth] = await Promise.all([
      getChurchInfo(),
      getGivingSettings(),
      getYouthContent(),
    ]);
    setChurchInfo(info);
    setGivingSettings(giving);
    setYouthContent(youth);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider
      value={{ churchInfo, givingSettings, youthContent, loading, refresh }}
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
