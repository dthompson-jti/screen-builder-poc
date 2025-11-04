// src/components/InlineTextInput.tsx
import { useEditable } from '../data/useEditable';
import styles from './InlineTextInput.module.css';

interface InlineTextInputProps {
  value: string;
  onCommit: (newValue: string) => void;
  onCancel: () => void;
}

export const InlineTextInput = ({ value, onCommit, onCancel }: InlineTextInputProps) => {
  // FIX: Provide the missing 'isEditing' argument (always true for this component)
  // and specify the generic type to ensure the ref type is correct.
  const { ref, ...editableProps } = useEditable<HTMLInputElement>(
    value,
    onCommit,
    onCancel,
    true // This component is always in editing mode when rendered.
  );

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