// src/data/useScrollSpy.ts
import { useState, useEffect, useRef, RefObject } from 'react';

export const useScrollSpy = (
  elementIds: string[],
  options: IntersectionObserverInit,
  // FIX: Update the type to correctly accept a ref that can be null initially.
  scrollContainerRef: RefObject<HTMLElement | null>
): string => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);
  const isAtBottom = useRef(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    const elements = elementIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    // Scroll handler to detect when scrolled to the bottom
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Check if we are within 1px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 1) {
        if (!isAtBottom.current) {
          isAtBottom.current = true;
          // Force activeId to the last element's ID
          setActiveId(elementIds[elementIds.length - 1]);
        }
      } else {
        isAtBottom.current = false;
      }
    };

    observer.current = new IntersectionObserver((entries) => {
      // If we are at the bottom, the scroll handler takes precedence.
      if (isAtBottom.current) return;

      const intersectingEntries = entries.filter(entry => entry.isIntersecting);
      if (intersectingEntries.length > 0) {
        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(intersectingEntries[0].target.id);
      }
    }, options);

    elements.forEach(el => observer.current?.observe(el));
    scrollContainer.addEventListener('scroll', handleScroll);

    // Initial check in case it loads at the bottom
    handleScroll();

    return () => {
      observer.current?.disconnect();
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [elementIds, options, scrollContainerRef]);

  return activeId;
};