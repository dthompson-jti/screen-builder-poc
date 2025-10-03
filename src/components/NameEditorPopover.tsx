// src/components/NameEditorPopover.tsx
import { useRef, useEffect, useState } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { isNameEditorPopoverOpenAtom } from '../data/atoms';
import { formNameAtom, commitActionAtom } from '../data/historyAtoms';
import { useOnClickOutside } from '../data/useOnClickOutside';
import styles from './NameEditorPopover.module.css';

export const NameEditorPopover = () => {
    const currentFormName = useAtomValue(formNameAtom);
    const commitAction = useSetAtom(commitActionAtom);
    const [, setIsOpen] = useAtom(isNameEditorPopoverOpenAtom);
    
    const [localName, setLocalName] = useState(currentFormName);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const initialNameRef = useRef(currentFormName);

    const commitChanges = () => {
      const trimmedName = localName.trim();
      if (trimmedName && trimmedName !== initialNameRef.current) {
        commitAction({
          action: { type: 'FORM_RENAME', payload: { newName: trimmedName } },
          message: `Rename form to '${trimmedName}'`
        });
      }
      setIsOpen(false);
    };

    useOnClickOutside(popoverRef, commitChanges);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitChanges();
        }
        if (e.key === 'Escape') {
            setIsOpen(false); // Discard changes
        }
    };

    return (
        <div className={styles.nameEditorPopover} ref={popoverRef}>
            <label htmlFor="popover-form-name">Form name</label>
            <input
                id="popover-form-name"
                ref={inputRef}
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitChanges}
            />
        </div>
    );
};