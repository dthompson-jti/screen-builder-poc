// src/data/useEditable.ts
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

// Define a type for the elements the hook can work with.
type EditableElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * A hook to manage the state of an in-place editable text input.
 * It handles the internal value, commit/cancel logic, and keyboard events.
 * FIX: Now uses generics to correctly type the ref and event handlers.
 * The default type is HTMLInputElement.
 */
export const useEditable = <T extends EditableElement = HTMLInputElement>(
  initialValue: string,
  onCommit: (newValue: string) => void,
  onCancel: () => void,
) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const ref = useRef<T>(null);

  // FIX: This effect syncs the internal state with the initialValue prop.
  // This prevents the input from resetting on every keystroke when the parent re-renders,
  // while still allowing the editor to be reset when a different component is selected.
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  // REMOVED: The focus logic is now handled by the component that controls the editing state (FormItem).
  // This is more reliable as the hook itself doesn't know when an "edit session" begins.

  const handleCommit = () => {
    const trimmedValue = currentValue.trim();
    // Only commit if the value is not empty and has actually changed.
    if (trimmedValue && trimmedValue !== initialValue.trim()) {
      onCommit(trimmedValue);
    } else {
      onCancel(); // Cancel if the value is empty or unchanged
    }
  };

  const handleKeyDown = (e: KeyboardEvent<T>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    // For single-line inputs, Enter commits the change.
    if (e.key === 'Enter') {
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
    onChange: (e: React.ChangeEvent<T>) => setCurrentValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };
};