// src/components/HeaderActionsMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { isSettingsMenuOpenAtom } from '../state/atoms';
import { useOnClickOutside } from '../useOnClickOutside';
import './HeaderMenu.css';

export const HeaderActionsMenu = () => {
    const [, setIsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
    const menuRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    return (
        <div className="header-menu-popover" ref={menuRef} style={{left: 'auto', right: 0}}>
            <button className="btn btn-tertiary menu-option" disabled>
                {/* FIX: Use consistent checkmark container for alignment */}
                <span className="checkmark-container" />
                <span>Export</span>
            </button>
            <button className="btn btn-tertiary menu-option" disabled>
                <span className="checkmark-container" />
                <span>Import</span>
            </button>
        </div>
    );
};