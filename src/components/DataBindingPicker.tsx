// src/components/DataBindingPicker.tsx
import { BoundData } from '../types';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
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
        <Tooltip content="Select data binding">
          <Button
            variant="quaternary"
            size="xs"
            iconOnly
            aria-label="Select data binding"
            tabIndex={-1}
          >
            <span className="material-symbols-rounded">more_horiz</span>
          </Button>
        </Tooltip>
      </div>
      {isBound && <span className={styles.pickerHelperText}>{binding.path}</span>}
    </div>
  );
};