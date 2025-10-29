// src/components/Tooltip.tsx
import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  delay?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * A reusable, accessible, and high-craft tooltip component
 * built on top of Radix UI.
 */
export const Tooltip = ({ children, content, delay = 300, side = 'top' }: TooltipProps) => {
  if (!content) {
    return children;
  }

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={delay}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="tooltip-content" side={side} sideOffset={5}>
            {content}
            <RadixTooltip.Arrow className="tooltip-arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};