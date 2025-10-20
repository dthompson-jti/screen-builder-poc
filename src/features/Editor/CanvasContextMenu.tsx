// src/features/Editor/CanvasContextMenu.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  contextMenuStateAtom,
  canvasInteractionAtom,
} from '../../data/atoms';
import { commitActionAtom, canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import { useComponentCapabilities } from './useComponentCapabilities';
import styles from './SelectionToolbar.module.css';

export const CanvasContextMenu = () => {
  const [menuState, setMenuState] = useAtom(contextMenuStateAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const targetIds = menuState.target?.type === 'component' ? menuState.target.ids : [];
  const capabilities = useComponentCapabilities(targetIds);

  const closeMenu = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: false }));
  }, [setMenuState]);

  useOnClickOutside(menuRef, closeMenu);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const canvasContainer = document.querySelector('.canvasContainer');
    
    window.addEventListener('keydown', handleKeyDown);
    canvasContainer?.addEventListener('scroll', closeMenu, { once: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvasContainer?.removeEventListener('scroll', closeMenu);
    };
  }, [closeMenu]);

  if (!menuState.isOpen || !menuState.target) {
    return null;
  }

  const menuStyle: React.CSSProperties = {
    top: `${menuState.position.y}px`,
    left: `${menuState.position.x}px`,
    position: 'fixed',
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    closeMenu();
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
          <button className="menu-item" disabled={!capabilities.canRename} onClick={handleAction(handleRename)}>
            Rename
          </button>
        )}
        <button className="menu-item" disabled>Copy {isSingle ? '' : `[${targetIds.length}] Items`}</button>
        <button className="menu-item" disabled>Paste</button>
        <div className={styles.menuDivider} />
        {isSingle && (
          <>
            <button className="menu-item" onClick={handleAction(() => handleConvert('heading'))} disabled={!capabilities.canConvertToHeading}>
                <span className="material-symbols-rounded">title</span>
                <span>Convert to Heading</span>
            </button>
            <button className="menu-item" onClick={handleAction(() => handleConvert('paragraph'))} disabled={!capabilities.canConvertToParagraph}>
                <span className="material-symbols-rounded">notes</span>
                <span>Convert to Paragraph</span>
            </button>
            <button className="menu-item" onClick={handleAction(() => handleConvert('link'))} disabled={!capabilities.canConvertToLink}>
                <span className="material-symbols-rounded">link</span>
                <span>Convert to Link</span>
            </button>
            <div className={styles.menuDivider} />
            <button className="menu-item" disabled={!capabilities.canNudgeUp} onClick={handleAction(() => handleNudge('up'))}>
              Move Up
            </button>
            <button className="menu-item" disabled={!capabilities.canNudgeDown} onClick={handleAction(() => handleNudge('down'))}>
              Move Down
            </button>
            <button className="menu-item" disabled={!capabilities.canSelectParent} onClick={handleAction(handleSelectParent)}>
              Select Parent
            </button>
          </>
        )}
        <button className="menu-item" disabled={!capabilities.canWrap} onClick={handleAction(handleWrap)}>
          Wrap in Container
        </button>
        {isSingle && capabilities.canUnwrap && (
          <button className="menu-item" onClick={handleAction(handleUnwrap)}>
            Unwrap Container
          </button>
        )}
        <div className={styles.menuDivider} />
        <button className="menu-item" disabled={!capabilities.canDelete} onClick={handleAction(handleDelete)}>
          Delete {isSingle ? '' : `[${targetIds.length}] Items`}
        </button>
      </>
    );
  };

  const renderCanvasMenu = () => (
    <>
      <button className="menu-item" disabled>
        What actions should go here?
      </button>
      <button className="menu-item" disabled>Paste</button>
    </>
  );

  return (
    <div className={styles.menuPopover} style={menuStyle} ref={menuRef} onContextMenu={e => e.preventDefault()}>
      {menuState.target?.type === 'component' ? renderComponentMenu() : renderCanvasMenu()}
    </div>
  );
};