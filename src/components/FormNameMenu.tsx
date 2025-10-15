// src/components/FormNameMenu.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../data/useOnClickOutside';
import styles from './FormNameEditor.module.css';

interface FormNameMenuProps {
  onRename: () => void;
  onClose: () => void;
}

export const FormNameMenu = ({ onRename, onClose }: FormNameMenuProps) => {
  // FIX: Broaden the ref type to the more generic HTMLElement.
  // This satisfies the type signature of the useOnClickOutside hook.
  const menuRef = useRef<HTMLElement>(null);
  useOnClickOutside(menuRef, onClose);

  return (
    // We can safely cast the ref here for the specific div element.
    <div className={styles.menuPopover} ref={menuRef as React.RefObject<HTMLDivElement>}>
      <button className="menu-item" onClick={onRename}>
        <span className="material-symbols-rounded">drive_file_rename_outline</span>
        Rename
      </button>
      <div className={styles.menuDivider} />
      <button className="menu-item" disabled>
        <span className="material-symbols-rounded">history</span>
        Version history
      </button>
      <button className="menu-item" disabled>
        <span className="material-symbols-rounded">content_copy</span>
        Duplicate
      </button>
      <button className="menu-item" disabled>
        <span className="material-symbols-rounded">delete</span>
        Delete
      </button>
    </div>
  );
};