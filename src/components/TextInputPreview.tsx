// src/components/TextInputPreview.tsx
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

interface TextInputPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps;
}

export const TextInputPreview = ({ label, isEditing, editableProps }: TextInputPreviewProps) => {
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
      
      <div className={styles.previewInput}></div>
    </div>
  );
};