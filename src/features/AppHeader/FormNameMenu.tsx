// src/features/AppHeader/FormNameMenu.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import styles from './FormNameEditor.module.css';

interface FormNameMenuProps {
  onRename: () => void;
  onClose: () => void;
}

export const FormNameMenu = ({ onRename, onClose }: FormNameMenuProps) => {
  const menuRef = useRef<HTMLElement>(null);
  useOnClickOutside(menuRef, onClose);

  return (
    <div className={styles.menuPopover} ref={menuRef as React.RefObject<HTMLDivElement>}>
      <button className="menu-item" onClick={onRename}>
        <span className="material-symbols-rounded">drive_file_rename_outline</span>
        Rename
      </button>
      <div className={styles.menuDivider} />
      <button className="menu-item" disabled>
        <span className="material-symbols-rounded">link</span>
        Change parent entity
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