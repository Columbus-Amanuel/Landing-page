import { useEffect } from 'react';

/**
 * Lock `document.body` scrolling while a given boolean is true.
 * Used by full-screen Sheets / Dialogs that open below the navbar but should
 * prevent the page underneath from scrolling.
 *
 * @param {boolean} locked
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
