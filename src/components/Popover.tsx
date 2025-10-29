// src/components/Popover.tsx
import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover = ({ trigger, children, open, onOpenChange }: PopoverProps) => {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className="popover-content" sideOffset={5}>
          {children}
          <RadixPopover.Arrow className="popover-arrow" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};