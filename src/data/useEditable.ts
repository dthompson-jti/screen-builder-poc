// src/data/useEditable.ts
import { useState, useRef, useEffect } from 'react';

interface UseEditableOptions {
  multiline?: boolean;
}

export interface EditableProps<T extends HTMLElement> {
  // MODIFIED: The ref can be null initially.
  ref: React.RefObject<T | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
}

/**
 * A hook to manage the state and lifecycle of an inline editable text input.
 * It now internally handles focusing and selecting text when editing begins.
 */
export const useEditable = <T extends HTMLInputElement | HTMLTextAreaElement>(
  initialValue: string,
  onCommit: (newValue: string) => void,
  onCancel: () => void,
  isEditing: boolean, // <-- NEW: Explicitly pass the editing state
  options: UseEditableOptions = {}
): EditableProps<T> => {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<T>(null);

  // NEW: Centralized effect to handle focus and selection.
  // This ensures that whenever the component enters editing mode,
  // the text is focused and selected, regardless of how it was triggered.
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        ref.current?.focus();
        ref.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isEnter = e.key === 'Enter';
    const allowNewline = options.multiline && e.shiftKey;

    if (isEnter && !allowNewline) {
      e.preventDefault();
      onCommit(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onCommit(value);
  };

  return {
    ref,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };
};