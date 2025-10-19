// src/data/useIsMac.ts
import { useMemo } from 'react';

/**
 * A simple hook to determine if the user is on a Mac operating system.
 * This is useful for displaying the correct keyboard shortcut modifier (⌘ vs Ctrl).
 */
export const useIsMac = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }, []);
};