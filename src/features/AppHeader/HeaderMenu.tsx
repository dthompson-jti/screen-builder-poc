// src/features/AppHeader/HeaderMenu.tsx
import { useAtom } from 'jotai';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { isToolbarCompactAtom, isShowBreadcrumbAtom, settingsLayoutModeAtom } from '../../data/atoms';
import { useUndoRedo } from '../../data/useUndoRedo';
import { useIsMac } from '../../data/useIsMac';

export const HeaderMenu = () => {
    const [isCompact, setIsCompact] = useAtom(isToolbarCompactAtom);
    const [isShowBreadcrumb, setIsShowBreadcrumb] = useAtom(isShowBreadcrumbAtom);
    const [layoutMode, setLayoutMode] = useAtom(settingsLayoutModeAtom);

    const { undo, redo, canUndo, canRedo } = useUndoRedo();
    const isMac = useIsMac();

    return (
        <DropdownMenu.Portal>
            <DropdownMenu.Content
                className="menu-popover"
                sideOffset={5}
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenu.Item className="menu-item" onSelect={undo} disabled={!canUndo}>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">undo</span>
                    </span>
                    <span>Undo</span>
                    <span className="hotkey">{isMac ? "⌘Z" : "Ctrl+Z"}</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" onSelect={redo} disabled={!canRedo}>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">redo</span>
                    </span>
                    <span>Redo</span>
                    <span className="hotkey">{isMac ? "⇧⌘Z" : "Ctrl+Y"}</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }} />

                <DropdownMenu.CheckboxItem
                    className="menu-item"
                    checked={isCompact}
                    onCheckedChange={setIsCompact}
                >
                    <span className="checkmark-container">
                        <DropdownMenu.ItemIndicator>
                            <span className="material-symbols-rounded">check</span>
                        </DropdownMenu.ItemIndicator>
                    </span>
                    <span>Compact left menu</span>
                </DropdownMenu.CheckboxItem>

                <DropdownMenu.CheckboxItem
                    className="menu-item"
                    checked={isShowBreadcrumb}
                    onCheckedChange={setIsShowBreadcrumb}
                >
                    <span className="checkmark-container">
                        <DropdownMenu.ItemIndicator>
                            <span className="material-symbols-rounded">check</span>
                        </DropdownMenu.ItemIndicator>
                    </span>
                    <span>Show data navigator full path</span>
                </DropdownMenu.CheckboxItem>

                <DropdownMenu.CheckboxItem
                    className="menu-item"
                    checked={layoutMode === 'two-column'}
                    onCheckedChange={(checked) => setLayoutMode(checked ? 'two-column' : 'single-column')}
                >
                    <span className="checkmark-container">
                        <DropdownMenu.ItemIndicator>
                            <span className="material-symbols-rounded">check</span>
                        </DropdownMenu.ItemIndicator>
                    </span>
                    <span>Show settings in two columns</span>
                </DropdownMenu.CheckboxItem>

                <DropdownMenu.Separator style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }} />
                
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">history</span>
                    </span>
                    <span>Show version history</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">download</span>
                    </span>
                    <span>Export</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">upload</span>
                    </span>
                    <span>Import</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }} />
                
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container">
                        <span className="material-symbols-rounded">exit_to_app</span>
                    </span>
                    <span>Switch to classic editor</span>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
};