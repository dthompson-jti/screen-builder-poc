// src/components/StaticBindingDisplay.tsx
import { BoundData } from '../types';
import styles from './StaticBindingDisplay.module.css';

interface StaticBindingDisplayProps {
  binding: BoundData | null | undefined;
}

export const StaticBindingDisplay = ({ binding }: StaticBindingDisplayProps) => {
  if (!binding) {
    return null;
  }

  return (
    <div className={styles.staticBindingDisplay}>
      <span>{binding.nodeName}</span>
      <span className={`material-symbols-rounded ${styles.chevron}`}>chevron_right</span>
      <span>{binding.fieldName}</span>
    </div>
  );
};