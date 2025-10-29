// src/features/Editor/SelectionToolbarMenu.tsx
import { useRef } from 'react';
import { useSetAtom } from 'jotai';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import { useIsMac } from '../../data/useIsMac';
import { useComponentCapabilities } from './useComponentCapabilities';
import { commitActionAtom } from '../../data/historyAtoms';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarMenuProps {
  selectedId: string;
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  onClose: () => void;
  onDuplicate: () => void;
  onWrap: () => void;
  onUnwrap: () => void;
  canWrap: boolean;
  canUnwrap: boolean;
  canRename: boolean;
}

export const SelectionToolbarMenu = ({
  selectedId,
  onDelete,
  onRename,
  onNudge,
  onClose,
  onDuplicate,
  onWrap,
  onUnwrap,
  canWrap,
  canUnwrap,
  canRename,
}: SelectionToolbarMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, onClose);
  const isMac = useIsMac();
  const commitAction = useSetAtom(commitActionAtom);
  const capabilities = useComponentCapabilities([selectedId]);

  const modKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt+';

  const createHandler = (action: () => void) => () => {
    action();
    if (action !== onDelete) {
      onClose();
    }
  };

  const handleConvert = (targetType: 'heading' | 'paragraph' | 'link') => {
    commitAction({
      action: { type: 'COMPONENT_CONVERT', payload: { componentId: selectedId, targetType } },
      message: `Convert component to ${targetType}`
    });
    onClose();
  };

  return (
    <div className={styles.menuPopover} ref={menuRef}>
      <button className="menu-item" onClick={createHandler(onRename)} disabled={!canRename}>
        <span className="material-symbols-rounded">edit</span>
        <span>Rename</span>
        <span className="hotkey">Enter</span>
      </button>
      <div className={styles.menuDivider} />
      <button className="menu-item" onClick={() => handleConvert('heading')} disabled={!capabilities.canConvertToHeading}>
        <span className="material-symbols-rounded">title</span>
        <span>Convert to Heading</span>
      </button>
      <button className="menu-item" onClick={() => handleConvert('paragraph')} disabled={!capabilities.canConvertToParagraph}>
        <span className="material-symbols-rounded">notes</span>
        <span>Convert to Paragraph</span>
      </button>
      <button className="menu-item" onClick={() => handleConvert('link')} disabled={!capabilities.canConvertToLink}>
        <span className="material-symbols-rounded">link</span>
        <span>Convert to Link</span>
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
      <button className="menu-item" onClick={createHandler(onUnwrap)} disabled={!canUnwrap}>
        <span className="material-symbols-rounded">disabled_by_default</span>
        <span>Unwrap Container</span>
        <span className="hotkey">{modKey}{isMac ? ' Shift ' : '+Shift+'}G</span>
      </button>

      <div className={styles.menuDivider} />

      <button className="menu-item" onClick={createHandler(onDuplicate)} disabled>
        <span className="material-symbols-rounded">content_copy</span>
        <span>Duplicate</span>
        <span className="hotkey">{modKey}{isMac ? '' : '+'}D</span>
      </button>
      <button className="menu-item destructive" onClick={createHandler(onDelete)}>
        <span className="material-symbols-rounded">delete</span>
        <span>Delete</span>
        <span className="hotkey">{isMac ? '⌫' : 'Del'}</span>
      </button>
    </div>
  );
};