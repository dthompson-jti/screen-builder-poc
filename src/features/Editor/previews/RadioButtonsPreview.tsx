// src/features/Editor/previews/RadioButtonsPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import { FormFieldPreviewHeader } from './FormFieldPreviewHeader';
import styles from './FormFieldPreview.module.css';

interface RadioButtonsPreviewProps {
  label: string;
  isEditing: boolean;
  required: boolean;
  hintText?: string;
  editableProps?: EditableProps<HTMLInputElement>;
}

const RadioButtonsPreview = ({ label, isEditing, required, hintText, editableProps }: RadioButtonsPreviewProps) => {
  return (
    <div className={styles.previewWrapper}>
      <FormFieldPreviewHeader 
        label={label}
        required={required}
        isEditing={isEditing}
        editableProps={editableProps}
      />

      <div className={styles.previewRadioGroup}>
        <div className={styles.previewRadioButton}>
          <div className={styles.previewRadioCircle} /> Option 1
        </div>
        <div className={styles.previewRadioButton}>
          <div className={styles.previewRadioCircle} /> Option 2
        </div>
      </div>

      {hintText && <div className={styles.hintText}>{hintText}</div>}
    </div>
  );
};

export default RadioButtonsPreview;