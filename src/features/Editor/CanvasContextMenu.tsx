// src/features/Editor/CanvasContextMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { 
  selectedCanvasComponentIdsAtom,
  contextMenuTargetIdAtom,
  updateSelectionOnContextMenuAtom,
  isContextMenuOpenAtom,
  contextMenuInstanceKeyAtom,
} from '../../data/atoms';
import { useComponentCapabilities } from './useComponentCapabilities';
import { useCanvasActions } from './useCanvasActions';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { useIsMac } from '../../data/useIsMac';
import { useMemo } from 'react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
}

const MenuContent = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const capabilities = useComponentCapabilities(selectedIds);
  const actions = useCanvasActions(selectedIds);
  const isMac = useIsMac();

  const menuItems = useMemo<(ActionMenuItem | 'separator')[]>(() => {
    const modKey = isMac ? '⌘' : 'Ctrl';

    if (selectedIds.length === 0) {
      return [
        { id: 'no-selection', icon: ' ', label: 'No items selected', onClick: () => {}, disabled: true },
        'separator',
        { id: 'paste', icon: ' ', label: 'Paste', onClick: () => {}, disabled: true },
      ];
    }
    
    if (selectedIds.length > 1) {
      return [
        { id: 'wrap-multi', icon: 'add_box', label: 'Wrap in Container', onClick: actions.handleWrap, disabled: !capabilities.canWrap },
        { id: 'delete-multi', icon: 'delete', label: `Delete ${selectedIds.length} Items`, onClick: actions.handleDelete, destructive: true, disabled: !capabilities.canDelete },
      ];
    }

    // Single selection menu
    const items: (ActionMenuItem | 'separator')[] = [];
    items.push({ id: 'rename', icon: 'edit', label: 'Rename', hotkey: 'Enter', onClick: actions.handleRename, disabled: !capabilities.canRename });
    
    const conversionItems: ActionMenuItem[] = [];
    if (capabilities.canConvertToHeading) conversionItems.push({ id: 'convert-heading', icon: 'title', label: 'Convert to Heading', onClick: () => actions.handleConvert('heading') });
    if (capabilities.canConvertToParagraph) conversionItems.push({ id: 'convert-paragraph', icon: 'notes', label: 'Convert to Paragraph', onClick: () => actions.handleConvert('paragraph') });
    if (capabilities.canConvertToLink) conversionItems.push({ id: 'convert-link', icon: 'link', label: 'Convert to Link', onClick: () => actions.handleConvert('link') });

    if (conversionItems.length > 0) {
      items.push('separator');
      items.push(...conversionItems);
    }
    
    items.push('separator');
    items.push({ id: 'move-up', icon: 'arrow_upward', label: 'Move Up', hotkey: '↑', onClick: () => actions.handleNudge('up'), disabled: !capabilities.canNudgeUp });
    items.push({ id: 'move-down', icon: 'arrow_downward', label: 'Move Down', hotkey: '↓', onClick: () => actions.handleNudge('down'), disabled: !capabilities.canNudgeDown });
    items.push({ id: 'wrap', icon: 'add_box', label: 'Wrap in Container', hotkey: `${modKey}+G`, onClick: actions.handleWrap, disabled: !capabilities.canWrap });
    if (capabilities.canUnwrap) items.push({ id: 'unwrap', icon: 'disabled_by_default', label: 'Unwrap Container', hotkey: `${modKey}+Shift+G`, onClick: actions.handleUnwrap });

    items.push('separator');
    items.push({ id: 'duplicate', icon: 'content_copy', label: 'Duplicate', hotkey: `${modKey}+D`, onClick: () => {}, disabled: true });
    items.push({ id: 'delete', icon: 'delete', label: 'Delete', hotkey: isMac ? '⌫' : 'Del', onClick: actions.handleDelete, destructive: true, disabled: !capabilities.canDelete });

    return items;
  }, [selectedIds, isMac, capabilities, actions]);

  return <ActionMenu items={menuItems} />;
};

export const CanvasContextMenu = ({ children }: CanvasContextMenuProps) => {
  const updateSelection = useSetAtom(updateSelectionOnContextMenuAtom);
  const setContextMenuTargetId = useSetAtom(contextMenuTargetIdAtom);
  const setIsMenuOpen = useSetAtom(isContextMenuOpenAtom);
  const instanceKey = useAtomValue(contextMenuInstanceKeyAtom);

  const handleOpenChange = (isOpen: boolean) => {
    setIsMenuOpen(isOpen);

    if (isOpen) {
      updateSelection();
    } else {
      setContextMenuTargetId(null);
    }
  };

  return (
    <ContextMenu.Root onOpenChange={handleOpenChange}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal key={instanceKey}>
        <ContextMenu.Content className="menu-popover" onCloseAutoFocus={(e) => e.preventDefault()}>
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};