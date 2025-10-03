// src/components/HeaderActionsMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { isSettingsMenuOpenAtom } from '../data/atoms';
import { useOnClickOutside } from '../data/useOnClickOutside';
import menuStyles from './HeaderMenu.module.css';

export const HeaderActionsMenu = () => {
    const [, setIsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
    const menuRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    return (
        <div className={menuStyles.headerMenuPopover} ref={menuRef} style={{left: 'auto', right: 0}}>
            <button className="menu-item" disabled>
                <span className="checkmark-container" />
                <span>Export</span>
            </button>
            <button className="menu-item" disabled>
                <span className="checkmark-container" />
                <span>Import</span>
            </button>
        </div>
    );
};