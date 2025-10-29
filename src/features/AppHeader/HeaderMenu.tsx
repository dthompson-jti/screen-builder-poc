// src/views/HeaderMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
import { isMenuOpenAtom, isToolbarCompactAtom, isShowBreadcrumbAtom, settingsLayoutModeAtom } from '../../data/atoms';
import { useUndoRedo } from '../../data/useUndoRedo';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import { useIsMac } from '../../data/useIsMac';

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
    const menuRef = useRef<HTMLDivElement>(null);

    const { undo, redo, canUndo, canRedo } = useUndoRedo();
    const isMac = useIsMac();

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

    return (
        <div className="menu-popover" ref={menuRef}>
            <MenuOption label="Undo" onClick={handleUndo} hotkey={isMac ? "⌘Z" : "Ctrl+Z"} disabled={!canUndo} />
            <MenuOption label="Redo" onClick={handleRedo} hotkey={isMac ? "⇧⌘Z" : "Ctrl+Y"} disabled={!canRedo} />
            <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>
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
            <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>
            <MenuOption 
                label="Show version history"
                isChecked={false}
                onClick={() => {}}
                disabled
            />
            <MenuOption label="Export" onClick={() => {}} disabled />
            <MenuOption label="Import" onClick={() => {}} disabled />
            <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>
            <MenuOption label="Switch to classic editor" onClick={() => {}} disabled />
        </div>
    );
};