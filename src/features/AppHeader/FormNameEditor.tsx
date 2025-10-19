// src/features/AppHeader/FormNameEditor.tsx
import { useAtom, useSetAtom } from 'jotai';
import { useState, useRef, useEffect, KeyboardEvent, MouseEvent, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { isFormNameEditingAtom, isFormNameMenuOpenAtom } from '../../data/atoms';
import { formNameAtom, commitActionAtom } from '../../data/historyAtoms';
import { FormNameMenu } from './FormNameMenu';
import { Tooltip } from '../../components/Tooltip';
import styles from './FormNameEditor.module.css';

// A new sub-component to handle the portal and positioning
const PositionedMenu = ({ triggerRef, onRename, onClose }: {
  triggerRef: React.RefObject<HTMLElement | null>;
  onRename: () => void;
  onClose: () => void;
}) => {
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4, // Position below the trigger + 4px gap
        left: rect.left,
      });
    }
  }, [triggerRef]);

  // The menu is rendered via a portal to escape the parent's event context.
  return createPortal(
    <div style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px` }}>
      <FormNameMenu onRename={onRename} onClose={onClose} />
    </div>,
    document.body
  );
};


export const FormNameEditor = () => {
  const [formName] = useAtom(formNameAtom);
  const commitAction = useSetAtom(commitActionAtom);
  
  const [isEditing, setIsEditing] = useAtom(isFormNameEditingAtom);
  const [isMenuOpen, setIsMenuOpen] = useAtom(isFormNameMenuOpenAtom);

  const [localName, setLocalName] = useState(formName);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLocalName(formName), [formName]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const commitRename = () => {
    if (localName.trim() && localName !== formName) {
      commitAction({
        action: { type: 'FORM_RENAME', payload: { newName: localName.trim() } },
        message: `Renamed form to "${localName.trim()}"`,
      });
    }
    setIsEditing(false);
  };

  const cancelRename = () => {
    setLocalName(formName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename();
    else if (e.key === 'Escape') cancelRename();
  };

  const handleBlur = () => commitRename();
  
  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isEditing) return;
    setIsMenuOpen(p => !p);
  };
  
  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);


  return (
    <>
      <div className={styles.editorWrapper} ref={wrapperRef}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className={styles.formNameInput}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            aria-label="Edit form name input"
          />
        ) : (
          <>
            <span
              className={styles.formNameDisplay}
              onClick={startEditing}
              title={formName}
            >
              {formName}
            </span>
            <button
              className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
              onClick={handleMenuClick}
              aria-label="Form options"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <Tooltip content="Form options">
                <span className="material-symbols-rounded">keyboard_arrow_down</span>
              </Tooltip>
            </button>
          </>
        )}
      </div>
      {isMenuOpen && (
        <PositionedMenu 
          triggerRef={wrapperRef} 
          onRename={startEditing} 
          onClose={handleCloseMenu} 
        />
      )}
    </>
  );
};