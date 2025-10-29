// src/components/HeaderActionsMenu.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const HeaderActionsMenu = () => {
    return (
        <DropdownMenu.Portal>
            <DropdownMenu.Content 
                className="popover-content" 
                sideOffset={5} 
                style={{minWidth: 220, padding: 'var(--spacing-1)'}}
            >
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container" />
                    <span>Export</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" disabled>
                    <span className="checkmark-container" />
                    <span>Import</span>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
};