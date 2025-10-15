// src/data/useOnClickOutside.ts
import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    // FIX: Simplified to the most robust and standard implementation.
    // The useEffect hook runs *after* the render and commit phase, which means
    // the click event that caused the menu to open has already completed its
    // propagation. Therefore, we can safely attach the listener immediately.
    // This removes the need for flags, timeouts, or complex event logic.
    const listener = (event: AnyEvent) => {
      const el = ref.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Dependencies are correct: re-attach if the ref or handler changes.
}