import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset the window scroll position to (0, 0) whenever the route changes.
 * Lives at the top of the router tree (next to `<Routes>`).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
