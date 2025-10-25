// src/features/AppHeader/HeaderMenu.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAtom, useSetAtom } from 'jotai';
import { isToolbarCompactAtom, isShowBreadcrumbAtom, settingsLayoutModeAtom, isMenuOpenAtom } from '../../data/atoms';
import { useUndoRedo } from '../../data/useUndoRedo';
import { useIsMac } from '../../data/useIsMac';
import styles from './HeaderMenu.module.css';

const RadixMenuOption = ({ label, onSelect, disabled, hotkey }: { label: string, onSelect: () => void, disabled?: boolean, hotkey?: string }) => (
    <DropdownMenu.Item className="menu-item" onSelect={onSelect} disabled={disabled}>
        <span className="checkmark-container" />
        <span>{label}</span>
        {hotkey && <span className="hotkey">{hotkey}</span>}
    </DropdownMenu.Item>
);

const RadixMenuCheckboxOption = ({ label, isChecked, onSelect }: { label: string, isChecked: boolean, onSelect: () => void }) => (
    <DropdownMenu.CheckboxItem className="menu-item" checked={isChecked} onSelect={onSelect}>
        <span className="checkmark-container">
            <DropdownMenu.ItemIndicator>
                <span className="material-symbols-rounded">check</span>
            </DropdownMenu.ItemIndicator>
        </span>
        <span>{label}</span>
    </DropdownMenu.CheckboxItem>
);

export const HeaderMenu = () => {
    const setIsMenuOpen = useSetAtom(isMenuOpenAtom);
    const [isCompact, setIsCompact] = useAtom(isToolbarCompactAtom);
    const [isShowBreadcrumb, setIsShowBreadcrumb] = useAtom(isShowBreadcrumbAtom);
    const [layoutMode, setLayoutMode] = useAtom(settingsLayoutModeAtom);

    const { undo, redo, canUndo, canRedo } = useUndoRedo();
    const isMac = useIsMac();
    
    // Radix handles closing the menu on item selection automatically.
    
    return (
        <DropdownMenu.Portal>
            <DropdownMenu.Content 
                className="anim-fadeIn"
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 2px)', 
                    left: 0,
                    zIndex: 1000,
                    width: 280,
                    backgroundColor: 'var(--surface-bg-primary)',
                    borderRadius: 'var(--spacing-2)',
                    boxShadow: 'var(--surface-shadow-xl)',
                    padding: 'var(--spacing-1)',
                    border: '1px solid var(--surface-border-primary)',
                }}
                onCloseAutoFocus={(e: Event) => e.preventDefault()}
                onEscapeKeyDown={() => setIsMenuOpen(false)}
                sideOffset={6}
                align="start"
            >
                <RadixMenuOption label="Undo" onSelect={undo} hotkey={isMac ? "⌘Z" : "Ctrl+Z"} disabled={!canUndo} />
                <RadixMenuOption label="Redo" onSelect={redo} hotkey={isMac ? "⇧⌘Z" : "Ctrl+Y"} disabled={!canRedo} />
                <DropdownMenu.Separator className={styles.menuDivider} />
                <RadixMenuCheckboxOption 
                    label="Compact left menu"
                    isChecked={isCompact}
                    onSelect={() => setIsCompact(p => !p)}
                />
                <RadixMenuCheckboxOption 
                    label="Show data navigator full path"
                    isChecked={isShowBreadcrumb}
                    onSelect={() => setIsShowBreadcrumb(p => !p)}
                />
                <RadixMenuCheckboxOption 
                    label="Show settings in two columns"
                    isChecked={layoutMode === 'two-column'}
                    onSelect={() => setLayoutMode(p => p === 'single-column' ? 'two-column' : 'single-column')}
                />
                <DropdownMenu.Separator className={styles.menuDivider} />
                <RadixMenuCheckboxOption 
                    label="Show version history"
                    isChecked={false}
                    onSelect={() => {}}
                />
                <RadixMenuOption label="Export" onSelect={() => {}} disabled />
                <RadixMenuOption label="Import" onSelect={() => {}} disabled />
                <DropdownMenu.Separator className={styles.menuDivider} />
                <RadixMenuOption label="Switch to classic editor" onSelect={() => {}} disabled />
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
};