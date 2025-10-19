// src/components/RadioButtonsPreview.tsx
import { EditableProps } from '../data/useEditable'; // Import shared type
import styles from './FormFieldPreview.module.css';

interface RadioButtonsPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>; // Use shared, typed props
}

const RadioButtonsPreview = ({ label, isEditing, editableProps }: RadioButtonsPreviewProps) => {
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

      <div className={styles.previewRadioGroup}>
        <div className={styles.previewRadioButton}>
          <div className={styles.previewRadioCircle} /> Option 1
        </div>
        <div className={styles.previewRadioButton}>
          <div className={styles.previewRadioCircle} /> Option 2
        </div>
      </div>
    </div>
  );
};

export default RadioButtonsPreview;