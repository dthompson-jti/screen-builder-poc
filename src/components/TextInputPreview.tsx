// src/components/TextInputPreview.tsx
import styles from './TextInputPreview.module.css';
import { InlineTextInput } from './InlineTextInput';

interface TextInputPreviewProps {
  label: string;
  isEditing?: boolean;
  componentId?: string;
}

export const TextInputPreview = ({ label, isEditing, componentId }: TextInputPreviewProps) => (
  <div className={styles.fieldPreview}>
    {isEditing && componentId ? (
      <InlineTextInput componentId={componentId} initialValue={label} />
    ) : (
      <label onMouseDown={e => e.stopPropagation()}>{label}</label>
    )}
    <input type="text" placeholder={`Enter ${label.toLowerCase()}`} disabled />
  </div>
);