// src/components/SelectionToolbarMenu.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../data/useOnClickOutside';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarMenuProps {
  onDelete: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  onClose: () => void;
}

export const SelectionToolbarMenu = ({ onDelete, onNudge, onClose }: SelectionToolbarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, onClose);

  return (
    <div className={styles.menuPopover} ref={menuRef}>
      <button className="menu-item" onClick={() => onNudge('up')}>
        <span className="material-symbols-rounded">arrow_upward</span>
        <span>Nudge Up</span>
      </button>
      <button className="menu-item" onClick={() => onNudge('down')}>
        <span className="material-symbols-rounded">arrow_downward</span>
        <span>Nudge Down</span>
      </button>
      <div className="menuDivider" />
      <button className="menu-item" onClick={onDelete}>
        <span className="material-symbols-rounded">delete</span>
        <span>Delete</span>
      </button>
    </div>
  );
};