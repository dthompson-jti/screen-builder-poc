// src/features/Editor/previews/LinkPreview.tsx
import { EditableProps } from '../../../data/useEditable';
import styles from './LinkPreview.module.css';

interface LinkPreviewProps {
  content?: string;
  href?: string;
  isEditing: boolean;
  editableProps?: EditableProps<HTMLInputElement>;
}

const LinkPreview = ({ content, href, isEditing, editableProps }: LinkPreviewProps) => {
  const { ref, ...restEditableProps } = editableProps || {};
  return (
    <div className={styles.previewWrapper}>
      {isEditing && editableProps ? (
        <input
          ref={ref}
          type="text"
          {...restEditableProps}
          className={styles.editingInput}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <a href={href || '#'} className={styles.linkPreview} onClick={(e) => e.preventDefault()}>
          {content || 'Link Text'}
        </a>
      )}
    </div>
  );
};

export default LinkPreview;