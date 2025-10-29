// src/components/Toggle.tsx
import React from 'react';
import * as RadixToggle from '@radix-ui/react-toggle';
import { Slot } from '@radix-ui/react-slot';

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  asChild?: boolean;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <RadixToggle.Root
        ref={ref}
        className={`toggle-button ${className || ''}`}
        {...props}
        asChild={asChild}
      >
        <Comp>{props.children}</Comp>
      </RadixToggle.Root>
    );
  }
);