// src/features/AppHeader/FormNameMenu.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FormNameMenuProps {
  onRename: () => void;
}

export const FormNameMenu = ({ onRename }: FormNameMenuProps) => {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="menu-popover"
        sideOffset={5}
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenu.Item
          className="menu-item"
          onSelect={(e) => {
            e.preventDefault();
            onRename();
          }}
        >
          <span className="checkmark-container">
            <span className="material-symbols-rounded">edit</span>
          </span>
          <span>Rename</span>
          <span className="hotkey">Enter</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item className="menu-item" disabled>
          <span className="checkmark-container">
            <span className="material-symbols-rounded">history</span>
          </span>
          <span>Version History</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
};