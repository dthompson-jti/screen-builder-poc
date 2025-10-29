// src/features/Editor/CanvasContextMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  canvasInteractionAtom, selectedCanvasComponentIdsAtom,
} from '../../data/atoms';
import { commitActionAtom, canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { useComponentCapabilities } from './useComponentCapabilities';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';

interface CanvasContextMenuProps {
  children: React.ReactNode;
}

const MenuContent = () => {
  const targetIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const capabilities = useComponentCapabilities(targetIds);

  if (targetIds.length === 0) {
    return (
      <>
        <div className="menu-item" style={{ cursor: 'default', color: 'var(--surface-fg-secondary)' }}>
          What actions should go here?
        </div>
        <div className="menu-item" style={{ cursor: 'default', opacity: 0.5 }}>Paste</div>
      </>
    );
  }

  // Multi-select context menu
  if (targetIds.length > 1) {
    const handleDelete = () => {
      commitAction({
        action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: targetIds } },
        message: `Delete ${targetIds.length} component(s)`,
      });
      setInteractionState({ mode: 'idle' });
    };
    const handleWrap = () => {
      const firstComponent = allComponents[targetIds[0]];
      if (!firstComponent) return;
      commitAction({
        action: { type: 'COMPONENTS_WRAP', payload: { componentIds: targetIds, parentId: firstComponent.parentId } },
        message: `Wrap ${targetIds.length} component(s)`,
      });
    };
    return (
      <>
        <button className="menu-item" onClick={handleWrap} disabled={!capabilities.canWrap}>
          <span className="material-symbols-rounded">add_box</span>
          <span>Wrap in Container</span>
        </button>
        <button className="menu-item destructive" onClick={handleDelete} disabled={!capabilities.canDelete}>
          <span className="material-symbols-rounded">delete</span>
          <span>Delete [{targetIds.length}] Items</span>
        </button>
      </>
    );
  }

  // Single-select context menu (reuses the main toolbar menu component)
  const componentId = targetIds[0];
  const component = allComponents[componentId];
  if (!component) return null;

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId } },
      message: `Delete component`,
    });
    setInteractionState({ mode: 'idle' });
  };
  const handleRename = () => setInteractionState({ mode: 'editing', id: componentId });
  const handleWrap = () => commitAction({
    action: { type: 'COMPONENTS_WRAP', payload: { componentIds: [componentId], parentId: component.parentId } },
    message: `Wrap component`,
  });
  const handleUnwrap = () => commitAction({
    action: { type: 'COMPONENT_UNWRAP', payload: { componentId } },
    message: `Unwrap container`,
  });
  const handleNudge = (direction: 'up' | 'down') => {
    const parent = allComponents[component.parentId];
    if (!parent || parent.componentType !== 'layout') return;
    const oldIndex = parent.children.indexOf(componentId);
    const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
    commitAction({
      action: { type: 'COMPONENT_REORDER', payload: { componentId, parentId: parent.id, oldIndex, newIndex } },
      message: 'Reorder component',
    });
  };

  return (
    <SelectionToolbarMenu
      selectedId={componentId}
      onDelete={handleDelete}
      onRename={handleRename}
      onNudge={handleNudge}
      onClose={() => {}} // Radix handles closing
      onDuplicate={() => {}} // Placeholder
      onWrap={handleWrap}
      onUnwrap={handleUnwrap}
    />
  );
};


export const CanvasContextMenu = ({ children }: CanvasContextMenuProps) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="menu-popover"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <MenuContent />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};