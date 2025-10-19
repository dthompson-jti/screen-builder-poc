// src/data/useEditable.ts
// NEW FILE
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface UseEditableOptions {
  isMultiLine?: boolean;
}

/**
 * A hook to manage the state of an in-place editable text input.
 * It handles the internal value, commit/cancel logic, and keyboard events.
 */
export const useEditable = (
  initialValue: string,
  onCommit: (newValue: string) => void,
  onCancel: () => void,
  options?: UseEditableOptions
) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Focus and select text when the component mounts (i.e., when editing begins)
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, []);

  const handleCommit = () => {
    const trimmedValue = currentValue.trim();
    // Only commit if the value is not empty and has actually changed.
    if (trimmedValue && trimmedValue !== initialValue.trim()) {
      onCommit(trimmedValue);
    } else {
      onCancel(); // Cancel if the value is empty or unchanged
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    // For single-line inputs, Enter commits the change.
    if (e.key === 'Enter' && !options?.isMultiLine) {
      e.preventDefault();
      handleCommit();
    }
  };

  const handleBlur = () => {
    handleCommit();
  };

  return {
    ref,
    value: currentValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCurrentValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };
};