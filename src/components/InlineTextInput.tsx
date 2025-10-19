// src/components/InlineTextInput.tsx
import { useEditable } from '../data/useEditable';
import styles from './InlineTextInput.module.css';

interface InlineTextInputProps {
  value: string;
  onCommit: (newValue: string) => void;
  onCancel: () => void;
}

export const InlineTextInput = ({ value, onCommit, onCancel }: InlineTextInputProps) => {
  const { ref, ...editableProps } = useEditable(value, onCommit, onCancel);

  return (
    <input
      ref={ref}
      type="text"
      {...editableProps}
      className={styles.inlineInput}
      // Prevent clicks inside the input from propagating to the parent FormItem,
      // which would incorrectly trigger the selection logic again.
      onClick={(e) => e.stopPropagation()}
    />
  );
};