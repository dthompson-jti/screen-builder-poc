// src/features/Editor/previews/FormFieldPreviewHeader.tsx
import { EditableProps } from '../../../data/useEditable';
import styles from './FormFieldPreviewHeader.module.css';

interface FormFieldPreviewHeaderProps {
  label: string;
  required: boolean;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>;
}

export const FormFieldPreviewHeader = ({ label, required, isEditing, editableProps }: FormFieldPreviewHeaderProps) => {
  return (
    <>
      <label className={`${styles.previewLabel} ${isEditing ? styles.isEditing : ''}`}>
        {label}
        {required && <span className={styles.requiredAsterisk}>*</span>}
      </label>

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
    </>
  );
};