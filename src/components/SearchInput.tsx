// src/components/SearchInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  variant: 'standalone' | 'integrated';
  autoFocus?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  variant,
  autoFocus = false,
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = React.useId();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const wrapperClasses = `${styles.wrapper} ${isFocused ? styles.focused : ''}`;

  return (
    // This is now the single, clean container. It receives all borders,
    // backgrounds, and focus states. The child input is always transparent.
    <div className={wrapperClasses} data-variant={variant}>
      <label htmlFor={inputId} className={styles.visuallyHidden}>
        {placeholder}
      </label>
      <span className="material-symbols-rounded">search</span>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
      )}
    </div>
  );
};