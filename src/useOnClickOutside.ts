// src/useOnClickOutside.ts
import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

// FINAL FIX: The hook's signature is now correctly typed. It explicitly accepts
// a RefObject whose `.current` property can be an HTMLElement OR null. This
// directly matches the type provided by `useRef<HTMLDivElement>(null)` in the
// calling component, permanently resolving the TypeScript error.
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref.current;

      // The hook's logic already safely handles the case where `el` is null.
      // The only problem was the type signature.
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
  }, [ref, handler]);
}