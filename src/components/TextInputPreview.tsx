// src/components/TextInputPreview.tsx
import styles from './TextInputPreview.module.css';

export const TextInputPreview = ({ label }: { label: string }) => (
  <div className={styles.fieldPreview}>
    <label>{label}</label>
    <input type="text" placeholder={`Enter ${label.toLowerCase()}`} disabled />
  </div>
);