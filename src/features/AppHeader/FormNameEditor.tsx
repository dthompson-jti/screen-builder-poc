// src/features/AppHeader/FormNameEditor.tsx
import { useAtom, useSetAtom } from 'jotai';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { isFormNameEditingAtom } from '../../data/atoms';
import { formNameAtom, commitActionAtom } from '../../data/historyAtoms';
import { FormNameMenu } from './FormNameMenu';
import { Tooltip } from '../../components/Tooltip';
import styles from './FormNameEditor.module.css';

export const FormNameEditor = () => {
  const [formName] = useAtom(formNameAtom);
  const commitAction = useSetAtom(commitActionAtom);
  
  const [isEditing, setIsEditing] = useAtom(isFormNameEditingAtom);
  const [localName, setLocalName] = useState(formName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocalName(formName), [formName]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setIsEditing(true);
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

  return (
    <div className={styles.editorWrapper}>
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={styles.menuButton}
                aria-label="Form options"
              >
                <Tooltip content="Form options">
                  <span className="material-symbols-rounded">keyboard_arrow_down</span>
                </Tooltip>
              </button>
            </DropdownMenu.Trigger>
            <FormNameMenu onRename={startEditing} />
          </DropdownMenu.Root>
        </>
      )}
    </div>
  );
};