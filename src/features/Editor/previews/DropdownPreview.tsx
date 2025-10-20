// src/features/Editor/previews/DropdownPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import { FormFieldPreviewHeader } from './FormFieldPreviewHeader';
import styles from './FormFieldPreview.module.css';

interface DropdownPreviewProps {
  label: string;
  isEditing: boolean;
  required: boolean;
  hintText?: string;
  placeholder?: string;
  editableProps?: EditableProps<HTMLInputElement>;
}

const DropdownPreview = ({ label, isEditing, required, hintText, placeholder, editableProps }: DropdownPreviewProps) => {
  return (
    <div className={styles.previewWrapper}>
      <FormFieldPreviewHeader 
        label={label}
        required={required}
        isEditing={isEditing}
        editableProps={editableProps}
      />

      <div className={`${styles.previewInput} ${styles.previewDropdown}`}>
        <span>{placeholder || 'Select an option...'}</span>
        <span className="material-symbols-rounded">arrow_drop_down</span>
      </div>

      {hintText && <div className={styles.hintText}>{hintText}</div>}
    </div>
  );
};

export default DropdownPreview;