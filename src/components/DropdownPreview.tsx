// src/components/DropdownPreview.tsx
// NEW FILE
import styles from './TextInputPreview.module.css'; // Re-use styles for simplicity
import selectStyles from './Select.module.css';

const DropdownPreview = ({ label }: { label: string }) => (
  <div className={styles.fieldPreview}>
    <label>{label}</label>
    <div className={selectStyles.selectTrigger} style={{ pointerEvents: 'none' }}>
      <span>{`Select ${label.toLowerCase()}`}</span>
      <span className={`material-symbols-rounded ${selectStyles.selectIcon}`}>expand_more</span>
    </div>
  </div>
);

export default DropdownPreview;