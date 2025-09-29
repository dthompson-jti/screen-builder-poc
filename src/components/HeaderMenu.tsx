// src/components/HeaderMenu.tsx
import { useRef } from 'react';
import { useAtom } from 'jotai';
// UPDATED IMPORTS: Pointing to the new centralized state and root-level hook
import { isMenuOpenAtom, isToolbarCompactAtom, isShowBreadcrumbAtom } from '../state/atoms';
import { useOnClickOutside } from '../useOnClickOutside';
import './HeaderMenu.css';

const MenuOption = ({ label, isChecked, onClick, disabled }: { label: string, isChecked: boolean, onClick: () => void, disabled?: boolean }) => (
    <button className="menu-option" onClick={onClick} disabled={disabled}>
        <span className="material-symbols-outlined checkmark">
            {isChecked ? 'check' : ''}
        </span>
        <span>{label}</span>
    </button>
);

export const HeaderMenu = () => {
    const [, setIsMenuOpen] = useAtom(isMenuOpenAtom);
    const [isCompact, setIsCompact] = useAtom(isToolbarCompactAtom);
    const [isShowBreadcrumb, setIsShowBreadcrumb] = useAtom(isShowBreadcrumbAtom);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const handleToggleCompact = () => {
        setIsCompact(p => !p);
        setIsMenuOpen(false);
    };

    const handleToggleBreadcrumb = () => {
        setIsShowBreadcrumb(p => !p);
        setIsMenuOpen(false);
    };

    return (
        <div className="header-menu-popover" ref={menuRef}>
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
            <div className="menu-divider"></div>
            <MenuOption 
                label="Placeholder Option"
                isChecked={false}
                onClick={() => {}}
                disabled
            />
        </div>
    );
};