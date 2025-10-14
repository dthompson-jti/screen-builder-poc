// src/views/HeaderMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { isMenuOpenAtom, isToolbarCompactAtom, isShowBreadcrumbAtom, settingsLayoutModeAtom, isQuaternaryBorderVisibleAtom } from '../data/atoms';
import { useUndoRedo } from '../data/useUndoRedo';
import { useOnClickOutside } from '../data/useOnClickOutside';
import styles from './HeaderMenu.module.css';

const MenuOption = ({ label, isChecked, onClick, disabled, hotkey }: { label: string, isChecked?: boolean, onClick: () => void, disabled?: boolean, hotkey?: string }) => (
    <button className="menu-item" onClick={onClick} disabled={disabled}>
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
    const [isQuaternaryBorderVisible, setIsQuaternaryBorderVisible] = useAtom(isQuaternaryBorderVisibleAtom);
    const menuRef = useRef<HTMLDivElement>(null);

    const { undo, redo, canUndo, canRedo } = useUndoRedo();
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleUndo = () => {
        undo();
        setIsMenuOpen(false);
    }
    const handleRedo = () => {
        redo();
        setIsMenuOpen(false);
    }

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

    const handleToggleQuaternaryBorders = () => {
        setIsQuaternaryBorderVisible(p => !p);
        // Keep menu open for this one as it's a visual preference
    }

    return (
        <div className={styles.headerMenuPopover} ref={menuRef}>
            <MenuOption label="Undo" onClick={handleUndo} hotkey={isMac ? "⌘Z" : "Ctrl+Z"} disabled={!canUndo} />
            <MenuOption label="Redo" onClick={handleRedo} hotkey={isMac ? "⇧⌘Z" : "Ctrl+Y"} disabled={!canRedo} />
            <div className={styles.menuDivider}></div>
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
            <MenuOption 
                label="Show faint button borders"
                isChecked={isQuaternaryBorderVisible}
                onClick={handleToggleQuaternaryBorders}
            />
            <div className={styles.menuDivider}></div>
            <MenuOption 
                label="Show version history"
                isChecked={false}
                onClick={() => {}}
                disabled
            />
            <MenuOption label="Export" onClick={() => {}} disabled />
            <MenuOption label="Import" onClick={() => {}} disabled />
            <div className={styles.menuDivider}></div>
            <MenuOption label="Switch to classic editor" onClick={() => {}} disabled />
        </div>
    );
};