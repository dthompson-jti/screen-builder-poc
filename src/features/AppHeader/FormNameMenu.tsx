// src/features/AppHeader/FormNameMenu.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './HeaderMenu.module.css'; // Re-use menu divider style

interface FormNameMenuProps {
  onRename: () => void;
}

export const FormNameMenu = ({ onRename }: FormNameMenuProps) => {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="popover-content"
        style={{ minWidth: 220, padding: 'var(--spacing-1)' }}
        sideOffset={5}
        align="start"
      >
        <DropdownMenu.Item className="menu-item" onSelect={onRename}>
          <span className="material-symbols-rounded">drive_file_rename_outline</span>
          Rename
        </DropdownMenu.Item>
        <DropdownMenu.Separator className={styles.menuDivider} />
        <DropdownMenu.Item className="menu-item" disabled>
          <span className="material-symbols-rounded">link</span>
          Change parent entity
        </DropdownMenu.Item>
        <DropdownMenu.Separator className={styles.menuDivider} />
        <DropdownMenu.Item className="menu-item" disabled>
          <span className="material-symbols-rounded">history</span>
          Version history
        </DropdownMenu.Item>
        <DropdownMenu.Item className="menu-item" disabled>
          <span className="material-symbols-rounded">content_copy</span>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Item className="menu-item destructive" disabled>
          <span className="material-symbols-rounded">delete</span>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
};