// src/features/Editor/SelectionToolbarMenu.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import { useIsMac } from '../../data/useIsMac';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarMenuProps {
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  onClose: () => void;
  onDuplicate: () => void;
  onWrap: () => void;
  canWrap: boolean;
}

export const SelectionToolbarMenu = ({
  onDelete,
  onRename,
  onNudge,
  onClose,
  onDuplicate,
  onWrap,
  canWrap,
}: SelectionToolbarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, onClose);
  const isMac = useIsMac();

  const modKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt+';

  const createHandler = (action: () => void) => () => {
    action();
    if (action !== onDelete) {
      onClose();
    }
  };

  return (
    <div className={styles.menuPopover} ref={menuRef}>
      <button className="menu-item" onClick={createHandler(onRename)}>
        <span className="material-symbols-rounded">edit</span>
        <span>Rename</span>
        <span className="hotkey">Enter</span>
      </button>

      <div className={styles.menuDivider} />
      
      <button className="menu-item" onClick={createHandler(() => onNudge('up'))}>
        <span className="material-symbols-rounded">arrow_upward</span>
        <span>Move Up</span>
        <span className="hotkey">↑</span>
      </button>
      <button className="menu-item" onClick={createHandler(() => onNudge('down'))}>
        <span className="material-symbols-rounded">arrow_downward</span>
        <span>Move Down</span>
        <span className="hotkey">↓</span>
      </button>
      <button className="menu-item" onClick={createHandler(onWrap)} disabled={!canWrap}>
        <span className="material-symbols-rounded">add_box</span>
        <span>Wrap in Container</span>
        <span className="hotkey">{modKey}{isMac ? '' : '+'}{altKey}G</span>
      </button>
      {/* Unwrap functionality is currently disabled */}

      <div className={styles.menuDivider} />

      <button className="menu-item" onClick={createHandler(onDuplicate)} disabled>
        <span className="material-symbols-rounded">content_copy</span>
        <span>Duplicate</span>
        <span className="hotkey">{modKey}{isMac ? '' : '+'}D</span>
      </button>
      <button className="menu-item" onClick={createHandler(onDelete)}>
        <span className="material-symbols-rounded">delete</span>
        <span>Delete</span>
        <span className="hotkey">{isMac ? '⌫' : 'Del'}</span>
      </button>
    </div>
  );
};