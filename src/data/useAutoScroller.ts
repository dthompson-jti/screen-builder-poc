// src/data/useAutoScroller.ts
import { useEffect, RefObject } from 'react';
import { useAtom } from 'jotai';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { scrollRequestAtom } from './atoms';

gsap.registerPlugin(ScrollToPlugin);

export const useAutoScroller = (scrollContainerRef: RefObject<HTMLElement | null>) => {
  const [scrollRequest, setScrollRequest] = useAtom(scrollRequestAtom);

  useEffect(() => {
    if (!scrollRequest || !scrollContainerRef.current) return;

    const targetElement = document.querySelector(`[data-id="${scrollRequest.componentId}"]`) as HTMLElement;
    if (targetElement) {
        // Ensure the element is visible before scrolling for accurate position
        const isVisible = targetElement.offsetParent !== null;
        if (isVisible) {
            gsap.to(scrollContainerRef.current, {
                duration: 0.7,
                scrollTo: { y: targetElement, offsetY: 100 },
                ease: 'power2.inOut',
            });
        }
    }
    // Reset atom to consume the "event"
    setScrollRequest(null);
  }, [scrollRequest, setScrollRequest, scrollContainerRef]);
};