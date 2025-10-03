// src/components/ComponentPreview.tsx
import styles from './ComponentPreview.module.css';

interface ComponentPreviewProps {
  name: string;
  type: string;
}

export const ComponentPreview = ({ name, type }: ComponentPreviewProps) => {
  return (
    <div className={styles.componentPreview}>
      <p className={styles.componentPreviewName}>{name}</p>
      <span className={styles.componentPreviewType}>{type}</span>
    </div>
  );
};