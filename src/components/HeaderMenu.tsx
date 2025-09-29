// src/components/HeaderMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { isMenuOpenAtom, isToolbarCompactAtom, isShowBreadcrumbAtom, settingsLayoutModeAtom } from '../state/atoms';
import { useOnClickOutside } from '../useOnClickOutside';
import './HeaderMenu.css';

const MenuOption = ({ label, isChecked, onClick, disabled, hotkey }: { label: string, isChecked?: boolean, onClick: () => void, disabled?: boolean, hotkey?: string }) => (
    <button className="menu-option" onClick={onClick} disabled={disabled}>
        {/* FIX: Use a container to enforce consistent spacing */}
        <span className="checkmark-container">
            {isChecked && <span className="material-symbols-rounded">check</span>}
        </span>
        <span>{label}</span>
        {hotkey && <span className="hotkey">{hotkey}</span>}
    </button>
);

export const HeaderMenu = () => {
    const [, setIsMenuOpen] = useAtom(isMenuOpenAtom);
    const [isCompact, setIsCompact] = useAtom(isToolbarCompactAtom);
    const [isShowBreadcrumb, setIsShowBreadcrumb] = useAtom(isShowBreadcrumbAtom);
    const [layoutMode, setLayoutMode] = useAtom(settingsLayoutModeAtom);
    const menuRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleToggleCompact = () => {
        setIsCompact(p => !p);
        setIsMenuOpen(false);
    };

    const handleToggleBreadcrumb = () => {
        setIsShowBreadcrumb(p => !p);
        setIsMenuOpen(false);
    };
    
    const handleToggleLayoutMode = () => {
        setLayoutMode(p => p === 'single-column' ? 'two-column' : 'single-column');
        setIsMenuOpen(false);
    }

    return (
        <div className="header-menu-popover" ref={menuRef}>
            <MenuOption label="Undo" onClick={() => {}} hotkey="Ctrl+Z" disabled />
            <MenuOption label="Redo" onClick={() => {}} hotkey="Ctrl+Y" disabled />
            <div className="menu-divider"></div>
            <MenuOption 
                label="Compact left menu"
                isChecked={isCompact}
                onClick={handleToggleCompact}
            />
            <MenuOption 
                label="Show data navigator full path"
                isChecked={isShowBreadcrumb}
                onClick={handleToggleBreadcrumb}
            />
            <MenuOption 
                label="Show settings in two columns"
                isChecked={layoutMode === 'two-column'}
                onClick={handleToggleLayoutMode}
            />
            <div className="menu-divider"></div>
            <MenuOption 
                label="Show version history"
                isChecked={false}
                onClick={() => {}}
                disabled
            />
            <MenuOption label="Export" onClick={() => {}} disabled />
            <MenuOption label="Import" onClick={() => {}} disabled />
        </div>
    );
};