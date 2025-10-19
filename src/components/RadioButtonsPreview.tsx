// src/components/RadioButtonsPreview.tsx
import React from 'react';
import styles from './FormFieldPreview.module.css';

// A type for the props passed down from the useEditable hook
interface EditableProps {
  ref: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

interface RadioButtonsPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps;
}

const RadioButtonsPreview = ({ label, isEditing, editableProps }: RadioButtonsPreviewProps) => {
  return (
    <div className={styles.previewWrapper}>
      <label className={`${styles.previewLabel} ${isEditing ? styles.isEditing : ''}`}>{label}</label>
      
      {isEditing && editableProps && (
        <input
          ref={editableProps.ref as React.RefObject<HTMLInputElement>}
          type="text"
          value={editableProps.value}
          onChange={editableProps.onChange}
          onKeyDown={editableProps.onKeyDown}
          onBlur={editableProps.onBlur}
          className={styles.editingInput}
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