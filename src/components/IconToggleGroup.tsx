// src/components/IconToggleGroup.tsx
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Tooltip } from './Tooltip';

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
  const handleValueChange = (newValue: T) => {
    if (newValue) { // Radix onValueChange can be empty if all are deselected
      onValueChange(newValue);
    }
  };

  return (
    <ToggleGroup.Root
      type="single"
      className="toggle-group"
      value={value}
      onValueChange={handleValueChange}
      aria-label={id}
    >
      {options.map((option) => (
        <Tooltip content={option.label} key={option.value}>
          <ToggleGroup.Item
            value={option.value}
            aria-label={option.label}
            className="toggle-group-item"
          >
            <span className="material-symbols-rounded">{option.icon}</span>
          </ToggleGroup.Item>
        </Tooltip>
      ))}
    </ToggleGroup.Root>
  );
};