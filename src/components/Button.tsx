// src/components/Button.tsx
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'on-solid';
  size?: 'xs' | 's' | 'm';
  iconOnly?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'm',
      iconOnly = false,
      asChild = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const combinedClassName = `btn ${className || ''}`;

    return (
      <Comp
        className={combinedClassName}
        data-variant={variant}
        data-size={size}
        data-icon-only={iconOnly}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);