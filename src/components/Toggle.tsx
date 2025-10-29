// src/components/Toggle.tsx
import React from 'react';
import * as RadixToggle from '@radix-ui/react-toggle';

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  asChild?: boolean;
}

/**
 * An unstyled Toggle primitive from Radix UI.
 * To give it styles, use the `asChild` prop and pass a styled component,
 * typically the application's `Button` component.
 * @example
 * <Toggle asChild>
 *   <Button variant="tertiary" size="m">
 *     <span className="material-symbols-rounded">format_bold</span>
 *   </Button>
 * </Toggle>
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ asChild = false, ...props }, ref) => {
    // The `asChild` prop is passed directly to RadixToggle.Root, which handles
    // merging props with the child component. If asChild is false, it renders
    // its own button element, which will be unstyled.
    return (
      <RadixToggle.Root
        ref={ref}
        {...props}
        asChild={asChild}
      />
    );
  }
);