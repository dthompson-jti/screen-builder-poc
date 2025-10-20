// src/components/IconToggleGroup.tsx
import { Tooltip } from './Tooltip';
import styles from './IconToggleGroup.module.css';

interface IconToggleOption<T extends string> {
  value: T;
  label: string;
  icon: string;
}

interface IconToggleGroupProps<T extends string> {
  options: IconToggleOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  id?: string;
}

export const IconToggleGroup = <T extends string>({
  options,
  value,
  onValueChange,
  id,
}: IconToggleGroupProps<T>) => {
  return (
    <div className={styles.toggleGroup} role="radiogroup" id={id}>
      {options.map((option) => (
        <Tooltip content={option.label} key={option.value}>
          <button
            type="button"
            role="radio"
            aria-checked={value === option.value}
            data-state={value === option.value ? 'on' : 'off'}
            className={styles.toggleButton}
            onClick={() => onValueChange(option.value)}
            aria-label={option.label}
          >
            <span className="material-symbols-rounded">{option.icon}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
};