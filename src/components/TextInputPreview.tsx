// src/components/TextInputPreview.tsx
import { EditableProps } from '../data/useEditable'; // Import shared type
import styles from './FormFieldPreview.module.css';

interface TextInputPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>; // Use shared, typed props
}

export const TextInputPreview = ({ label, isEditing, editableProps }: TextInputPreviewProps) => {
  return (
    <div className={styles.previewWrapper}>
      <label className={`${styles.previewLabel} ${isEditing ? styles.isEditing : ''}`}>{label}</label>
      
      {isEditing && editableProps && (
        <input
          ref={editableProps.ref}
          type="text"
          value={editableProps.value}
          onChange={editableProps.onChange}
          onKeyDown={editableProps.onKeyDown}
          onBlur={editableProps.onBlur}
          className={styles.editingInput}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      
      <div className={styles.previewInput}></div>
    </div>
  );
};