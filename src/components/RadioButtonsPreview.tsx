// src/components/RadioButtonsPreview.tsx
// NEW FILE
import styles from './TextInputPreview.module.css'; // Re-use styles for simplicity
import radioStyles from './RadioButtonsPreview.module.css';

const RadioButtonsPreview = ({ label }: { label: string }) => (
  <div className={styles.fieldPreview}>
    <label>{label}</label>
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