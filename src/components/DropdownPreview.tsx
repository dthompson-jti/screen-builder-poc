// src/components/DropdownPreview.tsx
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

interface DropdownPreviewProps {
  label: string;
  isEditing: boolean;
  editableProps?: EditableProps;
}

const DropdownPreview = ({ label, isEditing, editableProps }: DropdownPreviewProps) => {
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