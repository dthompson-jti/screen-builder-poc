// src/components/SelectionToolbarMenu.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../data/useOnClickOutside';
import { useIsMac } from '../data/useIsMac';
import styles from './HeaderMenu.module.css'; // Re-use popover styles

interface MenuItemProps {
  icon: string;
  label: string;
  shortcut?: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const MenuItem = ({ icon, label, shortcut, onClick, disabled }: MenuItemProps) => (
  <button className="menu-item" onClick={onClick} disabled={disabled}>
    <span className="material-symbols-rounded">{icon}</span>
    <span>{label}</span>
    {shortcut && <span className="hotkey">{shortcut}</span>}
  </button>
);

interface SelectionToolbarMenuProps {
  onClose: () => void;
  onWrap: () => void;
  onUnwrap: () => void;
  onDelete: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  canUnwrap: boolean;
}

export const SelectionToolbarMenu = ({ onClose, onWrap, onUnwrap, onDelete, onNudge, canUnwrap }: SelectionToolbarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isMac = useIsMac();
  useOnClickOutside(menuRef, onClose);

  const cmd = isMac ? 'Cmd' : 'Ctrl';

  const stopPropagation = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      ref={menuRef}
      className={`${styles.headerMenuPopover} anim-fadeIn`}
      style={{ top: 'calc(100% + 4px)', right: 0, left: 'auto', width: 280 }}
      onMouseDown={e => e.stopPropagation()} // Prevent clicks inside menu from deselecting component
    >
      <MenuItem icon="arrow_upward" label="Move Up" shortcut="↑" onClick={stopPropagation(() => onNudge('up'))} />
      <MenuItem icon="arrow_downward" label="Move Down" shortcut="↓" onClick={stopPropagation(() => onNudge('down'))} />
      <div className={styles.menuDivider}></div>
      <MenuItem icon="fullscreen" label="Wrap in container" shortcut={`${cmd}+G`} onClick={stopPropagation(onWrap)} />
      <MenuItem icon="fullscreen_exit" label="Unwrap container" shortcut={`${cmd}+Shift+G`} onClick={stopPropagation(onUnwrap)} disabled={!canUnwrap} />
      <div className={styles.menuDivider}></div>
      <MenuItem icon="delete" label="Delete" shortcut="Del" onClick={stopPropagation(onDelete)} />
    </div>
  );
};