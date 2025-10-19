// src/components/RadioButtonsPreview.tsx
import styles from './TextInputPreview.module.css'; // Re-use styles for simplicity
import radioStyles from './RadioButtonsPreview.module.css';
import { InlineTextInput } from './InlineTextInput';

interface RadioButtonsPreviewProps {
  label: string;
  isEditing?: boolean;
  componentId?: string;
}

const RadioButtonsPreview = ({ label, isEditing, componentId }: RadioButtonsPreviewProps) => (
  <div className={styles.fieldPreview}>
    {isEditing && componentId ? (
      <InlineTextInput componentId={componentId} initialValue={label} />
    ) : (
      <label onMouseDown={e => e.stopPropagation()}>{label}</label>
    )}
    <div className={radioStyles.radioGroup}>
      <div className={radioStyles.radioOption}>
        <div className={radioStyles.radioCircle} />
        <span>Option 1</span>
      </div>
      <div className={radioStyles.radioOption}>
        <div className={radioStyles.radioCircle} />
        <span>Option 2</span>
      </div>
    </div>
  </div>
);

export default RadioButtonsPreview;