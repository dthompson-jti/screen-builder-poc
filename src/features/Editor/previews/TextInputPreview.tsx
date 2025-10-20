// src/features/Editor/previews/TextInputPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import { FormFieldPreviewHeader } from './FormFieldPreviewHeader';
import styles from './FormFieldPreview.module.css';

interface TextInputPreviewProps {
  label: string;
  isEditing: boolean;
  required: boolean;
  hintText?: string;
  placeholder?: string;
  editableProps?: EditableProps<HTMLInputElement>;
}

export const TextInputPreview = ({ label, isEditing, required, hintText, placeholder, editableProps }: TextInputPreviewProps) => {
  return (
    <div className={styles.previewWrapper}>
      <FormFieldPreviewHeader 
        label={label}
        required={required}
        isEditing={isEditing}
        editableProps={editableProps}
      />
      
      <div className={styles.previewInput}>
        {placeholder}
      </div>

      {hintText && <div className={styles.hintText}>{hintText}</div>}
    </div>
  );
};