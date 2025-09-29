// src/components/useScrollSpy.ts
import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (
  elementIds: string[],
  options: IntersectionObserverInit
): string => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    const elements = elementIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    observer.current = new IntersectionObserver((entries) => {
      // Find the entry that is intersecting the most at the top of the viewport
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);

      if (intersectingEntries.length > 0) {
        // Sort by the one closest to the top of the viewport
        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(intersectingEntries[0].target.id);
      }
    }, options);

    elements.forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [elementIds, options]);

  return activeId;
};