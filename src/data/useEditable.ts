// src/data/useEditable.ts
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

// Define a type for the elements the hook can work with.
type EditableElement = HTMLInputElement | HTMLTextAreaElement;

// NEW: Export a shared type for props returned by the hook.
// This eliminates duplication and ensures type consistency.
export interface EditableProps<T extends EditableElement> {
  ref: React.RefObject<T | null>;
  value: string;
  onChange: (e: React.ChangeEvent<T>) => void;
  onKeyDown: (e: React.KeyboardEvent<T>) => void;
  onBlur: () => void;
}

// NEW: Options interface to control hook behavior
interface UseEditableOptions {
  multiline?: boolean;
}

/**
 * A hook to manage the state of an in-place editable text input.
 * It handles the internal value, commit/cancel logic, and keyboard events.
 * FIX: Now uses generics to correctly type the ref and event handlers.
 * The default type is HTMLInputElement.
 * UPDATED: Now supports a `multiline` option for use with textareas.
 */
export const useEditable = <T extends EditableElement = HTMLInputElement>(
  initialValue: string,
  onCommit: (newValue: string) => void,
  onCancel: () => void,
  options: UseEditableOptions = {} // NEW: options parameter
): EditableProps<T> => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const ref = useRef<T>(null);

  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  const handleCommit = () => {
    // Only commit if the value has actually changed. An empty value is allowed.
    if (currentValue !== initialValue) {
      onCommit(currentValue); // Commit the untrimmed value to preserve line breaks
    } else {
      onCancel(); // Cancel if the value is unchanged
    }
  };

  const handleKeyDown = (e: KeyboardEvent<T>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    
    if (options.multiline) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      }
    }
  };

  const handleBlur = () => {
    handleCommit();
  };

  return {
    ref,
    value: currentValue,
    onChange: (e: React.ChangeEvent<T>) => setCurrentValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };
};