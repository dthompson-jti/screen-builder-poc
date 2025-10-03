// src/components/NameEditorPopover.tsx
import { useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { formNameAtom, isNameEditorPopoverOpenAtom } from '../data/atoms';
import { useOnClickOutside } from '../data/useOnClickOutside';
import './NameEditorPopover.css';

export const NameEditorPopover = () => {
    const [name, setName] = useAtom(formNameAtom);
    const [, setIsOpen] = useAtom(isNameEditorPopoverOpenAtom);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useOnClickOutside(popoverRef, () => setIsOpen(false));

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="name-editor-popover" ref={popoverRef}>
            <label htmlFor="popover-form-name">Form name</label>
            <input
                id="popover-form-name"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};