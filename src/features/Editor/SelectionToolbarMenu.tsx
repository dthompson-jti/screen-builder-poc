// src/features/Editor/SelectionToolbarMenu.tsx
import React from 'react';
import { useSetAtom } from 'jotai';
import { useIsMac } from '../../data/useIsMac';
import { useComponentCapabilities } from './useComponentCapabilities';
import { commitActionAtom } from '../../data/historyAtoms';

interface MenuItemProps {
  icon: string;
  label: string;
  hotkey?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, hotkey, onClick, disabled, destructive }) => (
  <button className={`menu-item ${destructive ? 'destructive' : ''}`} onClick={onClick} disabled={disabled}>
    <span className="material-symbols-rounded">{icon}</span>
    <span>{label}</span>
    {hotkey && <span className="hotkey">{hotkey}</span>}
  </button>
);

interface SelectionToolbarMenuProps {
  selectedId: string;
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  onClose: () => void;
  onDuplicate: () => void;
  onWrap: () => void;
  onUnwrap: () => void;
  // These props are no longer needed as the component gets capabilities directly
  // canWrap: boolean;
  // canUnwrap: boolean;
  // canRename: boolean;
}

export const SelectionToolbarMenu = ({
  selectedId,
  onDelete,
  onRename,
  onNudge,
  onClose,
  onDuplicate,
  onWrap,
  onUnwrap,
}: SelectionToolbarMenuProps) => {
  const isMac = useIsMac();
  const commitAction = useSetAtom(commitActionAtom);
  const capabilities = useComponentCapabilities([selectedId]);

  const modKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt'; // Using Option symbol for Mac

  const createHandler = (action: () => void) => () => {
    action();
    if (action !== onDelete) {
      onClose();
    }
  };

  const handleConvert = (targetType: 'heading' | 'paragraph' | 'link') => {
    commitAction({
      action: { type: 'COMPONENT_CONVERT', payload: { componentId: selectedId, targetType } },
      message: `Convert component to ${targetType}`
    });
    onClose();
  };
  
  const canConvert = capabilities.canConvertToHeading || capabilities.canConvertToParagraph || capabilities.canConvertToLink;

  return (
    // Use React.Fragment as the root, the parent popover provides the container
    <>
      <MenuItem icon="edit" label="Rename" hotkey="Enter" onClick={createHandler(onRename)} disabled={!capabilities.canRename} />
      
      {canConvert && <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>}
      
      {capabilities.canConvertToHeading && (
        <MenuItem icon="title" label="Convert to Heading" onClick={() => handleConvert('heading')} />
      )}
      {capabilities.canConvertToParagraph && (
        <MenuItem icon="notes" label="Convert to Paragraph" onClick={() => handleConvert('paragraph')} />
      )}
      {capabilities.canConvertToLink && (
        <MenuItem icon="link" label="Convert to Link" onClick={() => handleConvert('link')} />
      )}

      <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>
      
      <MenuItem icon="arrow_upward" label="Move Up" hotkey="↑" onClick={createHandler(() => onNudge('up'))} disabled={!capabilities.canNudgeUp} />
      <MenuItem icon="arrow_downward" label="Move Down" hotkey="↓" onClick={createHandler(() => onNudge('down'))} disabled={!capabilities.canNudgeDown} />
      <MenuItem icon="add_box" label="Wrap in Container" hotkey={`${modKey}+${altKey}+G`} onClick={createHandler(onWrap)} disabled={!capabilities.canWrap} />
      
      {capabilities.canUnwrap && (
        <MenuItem icon="disabled_by_default" label="Unwrap Container" hotkey={`${modKey}+Shift+G`} onClick={createHandler(onUnwrap)} />
      )}

      <div style={{ height: '1px', backgroundColor: 'var(--surface-border-secondary)', margin: 'var(--spacing-1) 0' }}></div>

      <MenuItem icon="content_copy" label="Duplicate" hotkey={`${modKey}+D`} onClick={createHandler(onDuplicate)} disabled />
      <MenuItem icon="delete" label="Delete" hotkey={isMac ? '⌫' : 'Del'} onClick={createHandler(onDelete)} destructive />
    </>
  );
};