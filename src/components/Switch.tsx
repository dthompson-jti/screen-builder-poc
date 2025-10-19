// src/components/Switch.tsx
import * as RadixSwitch from '@radix-ui/react-switch';
import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled, id }: SwitchProps) => (
  <RadixSwitch.Root
    className={styles.switchRoot}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    id={id}
  >
    <RadixSwitch.Thumb className={styles.switchThumb} />
  </RadixSwitch.Root>
);