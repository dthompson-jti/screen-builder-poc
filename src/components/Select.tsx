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
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  // FIX: Remove the unused 'className' prop to resolve the ESLint warning.
  ({ children, ...props }, forwardedRef) => {
    return (
      <RadixSelect.Item className={styles.selectItem} {...props} ref={forwardedRef}>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
        <RadixSelect.ItemIndicator className={styles.selectItemIndicator}>
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check</span>
        </RadixSelect.ItemIndicator>
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