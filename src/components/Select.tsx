// src/components/Select.tsx
import React from 'react';
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
      <RadixSelect.Item className={styles.selectItem} {...props} ref={forwardedRef}>
        {/* Slot A: Fixed-width container for alignment */}
        <div className={styles.selectItemLeftSlot}>
          {/* The checkmark, rendered by Radix when state is 'checked' */}
          <RadixSelect.ItemIndicator className={styles.selectItemIndicator}>
            <span className="material-symbols-rounded">check</span>
          </RadixSelect.ItemIndicator>
          {/* The decorative icon, always rendered in the DOM but hidden via CSS when checked */}
          {icon && <span className={`material-symbols-rounded ${styles.selectItemIcon}`}>{icon}</span>}
        </div>
        {/* Slot B: Label */}
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      </RadixSelect.Item>
    );
  }
);

export const Select = ({ children, value, onValueChange, placeholder }: SelectProps) => {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger className={styles.selectTrigger} aria-label={placeholder}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={styles.selectIcon}>
          <span className="material-symbols-rounded">expand_more</span>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={styles.selectContent} position="popper" sideOffset={5}>
          <RadixSelect.ScrollUpButton className={styles.selectScrollButton}>
            <span className="material-symbols-rounded">expand_less</span>
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className={styles.selectViewport}>
            {children}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className={styles.selectScrollButton}>
            <span className="material-symbols-rounded">expand_more</span>
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};