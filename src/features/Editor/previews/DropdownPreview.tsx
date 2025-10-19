// src/features/Editor/previews/DropdownPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import styles from './FormFieldPreview.module.css'; // FIXED PATH

interface DropdownPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>;
}

const DropdownPreview = ({ label, isEditing, editableProps }: DropdownPreviewProps) => {
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

      <div className={`${styles.previewInput} ${styles.previewDropdown}`}>
        <span className="material-symbols-rounded">arrow_drop_down</span>
      </div>
    </div>
  );
};

export default DropdownPreview;