// src/features/Editor/previews/TextInputPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import styles from './FormFieldPreview.module.css'; // FIXED PATH

interface TextInputPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>;
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