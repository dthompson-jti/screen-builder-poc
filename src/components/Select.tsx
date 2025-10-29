// src/components/Select.tsx
import React, { useState } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import styles from './Select.module.css';

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  icon?: string;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, icon, ...props }, forwardedRef) => {
    return (
      // Use the global .menu-item class for styling
      <RadixSelect.Item className="menu-item" {...props} ref={forwardedRef}>
        {/* Slot A: Fixed-width container for alignment from global menu.css */}
        <div className="checkmark-container">
          {/* The checkmark, rendered by Radix when state is 'checked' */}
          <RadixSelect.ItemIndicator>
            <span className="material-symbols-rounded">check</span>
          </RadixSelect.ItemIndicator>
          {/* The decorative icon, hidden via CSS when checked */}
          {icon && <span className={`material-symbols-rounded ${styles.selectItemIcon}`}>{icon}</span>}
        </div>
        {/* Slot B: Label */}
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  }
);

export const Select = ({ children, value, onValueChange, placeholder }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
      <RadixSelect.Trigger 
        className={styles.selectTrigger} 
        aria-label={placeholder}
        data-focused={isOpen} // Add data attribute for focus styling
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={styles.selectIcon}>
          <span className="material-symbols-rounded">expand_more</span>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        {/* Use global .menu-popover for appearance and local .selectContent for width */}
        <RadixSelect.Content className={`${styles.selectContent} menu-popover`} position="popper" sideOffset={5}>
          <RadixSelect.ScrollUpButton className="menu-item">
            <span className="material-symbols-rounded">expand_less</span>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className={styles.selectViewport}>
            {children}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="menu-item">
            <span className="material-symbols-rounded">expand_more</span>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};