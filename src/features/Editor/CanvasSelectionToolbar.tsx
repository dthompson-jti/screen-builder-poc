// src/features/Editor/CanvasSelectionToolbar.tsx
import { useMemo } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ActionToolbar } from '../../components/ActionToolbar';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { useIsMac } from '../../data/useIsMac';
import { useCanvasActions } from './useCanvasActions';
import { useComponentCapabilities } from './useComponentCapabilities';
import styles from './SelectionToolbar.module.css';

interface CanvasSelectionToolbarProps {
  componentId: string;
  referenceElement: HTMLElement | null;
  dndListeners?: DraggableSyntheticListeners;
}

export const CanvasSelectionToolbar = ({
  componentId,
  referenceElement,
  dndListeners,
}: CanvasSelectionToolbarProps) => {
  const isMac = useIsMac();
  const selectedIds = [componentId];
  const capabilities = useComponentCapabilities(selectedIds);
  const actions = useCanvasActions(selectedIds);

  const renameTooltipContent = (
    <div style={{ textAlign: 'left' }}>
      <div>Rename (Enter)</div>
      <div style={{ color: 'var(--surface-fg-secondary)' }}>
        or {isMac ? 'Option' : 'Alt'}+Click label
      </div>
    </div>
  );

  const menuItems = useMemo<(ActionMenuItem | 'separator')[]>(() => {
    const modKey = isMac ? '⌘' : 'Ctrl';
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
  }, [isMac, capabilities, actions]);

  return (
    <ActionToolbar mode="element-relative" referenceElement={referenceElement}>
      <Toolbar.Root asChild>
        <>
          <Toolbar.Button asChild className={styles.dragHandle} {...dndListeners}>
            <Button variant="on-solid" size="s" iconOnly aria-label="Drag to reorder">
              <span className="material-symbols-rounded">drag_indicator</span>
            </Button>
          </Toolbar.Button>
          <Toolbar.Separator className={styles.divider} />
          <Tooltip content={renameTooltipContent} side="top">
            <Toolbar.Button asChild>
              <Button variant="on-solid" size="s" iconOnly onClick={actions.handleRename} aria-label="Rename component" disabled={!capabilities.canRename}>
                <span className="material-symbols-rounded">edit</span>
              </Button>
            </Toolbar.Button>
          </Tooltip>
          {capabilities.canUnwrap && (
            <Tooltip content="Unwrap Container" side="top">
              <Toolbar.Button asChild>
                <Button variant="on-solid" size="s" iconOnly onClick={actions.handleUnwrap} aria-label="Unwrap container">
                  <span className="material-symbols-rounded">disabled_by_default</span>
                </Button>
              </Toolbar.Button>
            </Tooltip>
          )}
          {capabilities.canWrap && !capabilities.canUnwrap && (
            <Tooltip content="Wrap in Container" side="top">
              <Toolbar.Button asChild>
                <Button variant="on-solid" size="s" iconOnly onClick={actions.handleWrap} aria-label="Wrap in container">
                  <span className="material-symbols-rounded">add_box</span>
                </Button>
              </Toolbar.Button>
            </Tooltip>
          )}
          {/* FIX: Add a dedicated delete button for quick access. */}
          <Tooltip content="Delete" side="top">
            <Toolbar.Button asChild>
              <Button variant="on-solid" size="s" iconOnly onClick={actions.handleDelete} aria-label="Delete component" disabled={!capabilities.canDelete}>
                <span className="material-symbols-rounded">delete</span>
              </Button>
            </Toolbar.Button>
          </Tooltip>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Toolbar.Button asChild>
                <Button variant="on-solid" size="s" iconOnly aria-label="More options">
                  <span className="material-symbols-rounded">more_vert</span>
                </Button>
              </Toolbar.Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="menu-popover" sideOffset={8} align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
                <ActionMenu items={menuItems} />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </>
      </Toolbar.Root>
    </ActionToolbar>
  );
};