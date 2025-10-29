// src/features/Editor/CanvasContextMenu.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  canvasInteractionAtom,
} from '../../data/atoms';
import { commitActionAtom, canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { useComponentCapabilities } from './useComponentCapabilities';
import styles from './SelectionToolbar.module.css'; // Re-use menu styles

interface CanvasContextMenuProps {
  targetIds: string[];
  children: React.ReactNode;
}

const MenuContent = ({ targetIds }: { targetIds: string[] }) => {
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const capabilities = useComponentCapabilities(targetIds);

  const handleAction = (action: () => void) => (e: Event) => {
    e.stopPropagation();
    action();
  };
  
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

  const handleUnwrap = () => {
    commitAction({
      action: { type: 'COMPONENT_UNWRAP', payload: { componentId: targetIds[0] } },
      message: `Unwrap container`,
    });
  };

  const handleRename = () => {
    setInteractionState({ mode: 'editing', id: targetIds[0] });
  };

  const handleConvert = (targetType: 'heading' | 'paragraph' | 'link') => {
    commitAction({
      action: { type: 'COMPONENT_CONVERT', payload: { componentId: targetIds[0], targetType } },
      message: `Convert component to ${targetType}`
    });
  };

  const handleNudge = (direction: 'up' | 'down') => {
    const component = allComponents[targetIds[0]];
    const parent = allComponents[component.parentId];
    if (!parent || parent.componentType !== 'layout') return;
    const oldIndex = parent.children.indexOf(component.id);
    const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
    commitAction({
      action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } },
      message: 'Reorder component',
    });
  };

  const handleSelectParent = () => {
    const component = allComponents[targetIds[0]];
    if (component?.parentId) {
      setInteractionState({ mode: 'selecting', ids: [component.parentId] });
    }
  };

  const renderComponentMenu = () => {
    const isSingle = targetIds.length === 1;

    return (
      <>
        {isSingle && (
          <ContextMenu.Item className="menu-item" disabled={!capabilities.canRename} onSelect={handleAction(handleRename)}>
            Rename
          </ContextMenu.Item>
        )}
        <ContextMenu.Item className="menu-item" disabled>Copy {isSingle ? '' : `[${targetIds.length}] Items`}</ContextMenu.Item>
        <ContextMenu.Item className="menu-item" disabled>Paste</ContextMenu.Item>
        <ContextMenu.Separator className={styles.menuDivider} />
        {isSingle && (
          <>
            <ContextMenu.Item className="menu-item" onSelect={handleAction(() => handleConvert('heading'))} disabled={!capabilities.canConvertToHeading}>
                <span className="material-symbols-rounded">title</span>
                <span>Convert to Heading</span>
            </ContextMenu.Item>
            <ContextMenu.Item className="menu-item" onSelect={handleAction(() => handleConvert('paragraph'))} disabled={!capabilities.canConvertToParagraph}>
                <span className="material-symbols-rounded">notes</span>
                <span>Convert to Paragraph</span>
            </ContextMenu.Item>
            <ContextMenu.Item className="menu-item" onSelect={handleAction(() => handleConvert('link'))} disabled={!capabilities.canConvertToLink}>
                <span className="material-symbols-rounded">link</span>
                <span>Convert to Link</span>
            </ContextMenu.Item>
            <ContextMenu.Separator className={styles.menuDivider} />
            <ContextMenu.Item className="menu-item" disabled={!capabilities.canNudgeUp} onSelect={handleAction(() => handleNudge('up'))}>
              Move Up
            </ContextMenu.Item>
            <ContextMenu.Item className="menu-item" disabled={!capabilities.canNudgeDown} onSelect={handleAction(() => handleNudge('down'))}>
              Move Down
            </ContextMenu.Item>
            <ContextMenu.Item className="menu-item" disabled={!capabilities.canSelectParent} onSelect={handleAction(handleSelectParent)}>
              Select Parent
            </ContextMenu.Item>
          </>
        )}
        <ContextMenu.Item className="menu-item" disabled={!capabilities.canWrap} onSelect={handleAction(handleWrap)}>
          Wrap in Container
        </ContextMenu.Item>
        {isSingle && capabilities.canUnwrap && (
          <ContextMenu.Item className="menu-item" onSelect={handleAction(handleUnwrap)}>
            Unwrap Container
          </ContextMenu.Item>
        )}
        <ContextMenu.Separator className={styles.menuDivider} />
        <ContextMenu.Item className="menu-item destructive" disabled={!capabilities.canDelete} onSelect={handleAction(handleDelete)}>
          Delete {isSingle ? '' : `[${targetIds.length}] Items`}
        </ContextMenu.Item>
      </>
    );
  };

  const renderCanvasMenu = () => (
    <>
      <ContextMenu.Item className="menu-item" disabled>
        What actions should go here?
      </ContextMenu.Item>
      <ContextMenu.Item className="menu-item" disabled>Paste</ContextMenu.Item>
    </>
  );

  return (
    <ContextMenu.Content className={`${styles.menuPopover} anim-fadeIn`}>
        {targetIds.length > 0 ? renderComponentMenu() : renderCanvasMenu()}
    </ContextMenu.Content>
  );
};


export const CanvasContextMenu = ({ targetIds, children }: CanvasContextMenuProps) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <MenuContent targetIds={targetIds} />
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};