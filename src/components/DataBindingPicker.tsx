// src/components/DataBindingPicker.tsx
import { BoundData } from '../types';
import styles from './DataBindingPicker.module.css';

interface DataBindingPickerProps {
  binding: BoundData | null | undefined;
  onOpen: () => void;
}

export const DataBindingPicker = ({ binding, onOpen }: DataBindingPickerProps) => {
  const isBound = !!binding;

  const controlClasses = `${styles.pickerControl} ${isBound ? styles.bound : styles.unbound}`;
  const labelClasses = `${styles.pickerLabel} ${isBound ? styles.bound : ''}`;

  return (
    <div className={styles.dataBindingPicker}>
      <div className={controlClasses} onClick={onOpen}>
        <span className={labelClasses}>
          {isBound ? binding.fieldName : 'No data binding'}
        </span>
        <button className="btn-tertiary icon-only" aria-label="Select data binding" tabIndex={-1} style={{pointerEvents: 'none'}}>
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>
      {isBound && <span className={styles.pickerHelperText}>{binding.path}</span>}
    </div>
  );
};