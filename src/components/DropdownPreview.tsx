// src/components/DropdownPreview.tsx
import styles from './TextInputPreview.module.css'; // Re-use styles for simplicity
import selectStyles from './Select.module.css';
import { InlineTextInput } from './InlineTextInput';

interface DropdownPreviewProps {
  label: string;
  isEditing?: boolean;
  componentId?: string;
}

const DropdownPreview = ({ label, isEditing, componentId }: DropdownPreviewProps) => (
  <div className={styles.fieldPreview}>
    {isEditing && componentId ? (
      <InlineTextInput componentId={componentId} initialValue={label} />
    ) : (
      <label onMouseDown={e => e.stopPropagation()}>{label}</label>
    )}
    <div className={selectStyles.selectTrigger} style={{ pointerEvents: 'none' }}>
      <span>{`Select ${label.toLowerCase()}`}</span>
      <span className={`material-symbols-rounded ${selectStyles.selectIcon}`}>expand_more</span>
    </div>
  </div>
);

export default DropdownPreview;