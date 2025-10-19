// src/features/Editor/previews/PlainTextPreview.tsx
import React from 'react';
import styles from './PlainTextPreview.module.css';

interface EditableProps {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
}

interface PlainTextPreviewProps {
  label: string;
  content?: string;
  isEditing: boolean;
  editableProps?: EditableProps;
}

const PlainTextPreview = ({ content, isEditing, editableProps }: PlainTextPreviewProps) => {
  const hasContent = content && content.trim().length > 0;

  return (
    <div className={styles.previewWrapper}>
      {isEditing && editableProps ? (
        <textarea
          ref={editableProps.ref as React.RefObject<HTMLTextAreaElement>}
          value={editableProps.value}
          onChange={editableProps.onChange}
          onKeyDown={editableProps.onKeyDown}
          onBlur={editableProps.onBlur}
          className={styles.editingTextarea}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className={`${styles.textContent} ${!hasContent ? styles.placeholder : ''}`}>
          {hasContent ? content : 'Enter text'}
        </div>
      )}
    </div>
  );
};

export default PlainTextPreview;