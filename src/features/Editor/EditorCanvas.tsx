// src/features/Editor/EditorCanvas.tsx
import React from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { 
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom,
  contextMenuStateAtom,
  selectionAnchorIdAtom,
} from '../../data/atoms';
import { rootComponentIdAtom, formNameAtom } from '../../data/historyAtoms';
import { useEditorHotkeys } from '../../data/useEditorHotkeys';

import { CanvasNode } from './CanvasNode';
import { FloatingSelectionToolbar } from './CanvasUI';

import styles from './EditorCanvas.module.css';

const findComponentId = (element: HTMLElement | null): string | null => {
  let current = element;
  while (current) {
    const id = current.dataset.id;
    if (id) return id;
    current = current.parentElement;
  }
  return null;
};

export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const setContextMenuState = useSetAtom(contextMenuStateAtom);
  const setAnchorId = useSetAtom(selectionAnchorIdAtom);
  
  useEditorHotkeys();

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuState(prev => ({ ...prev, isOpen: false }));
    setInteractionState({ mode: 'selecting', ids: [rootId] });
    setIsPropertiesPanelVisible(true);
    setAnchorId(rootId);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // This now correctly only fires when clicking the gray background,
    // not when a right-click happens inside the form card.
    if (e.target === e.currentTarget) {
      setInteractionState({ mode: 'idle' });
      setAnchorId(null);
      setContextMenuState(prev => ({ ...prev, isOpen: false }));
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId = findComponentId(e.target as HTMLElement);
    
    const currentSelectedIds = interactionState.mode === 'selecting' ? interactionState.ids : [];

    if (!targetId) { 
      if (interactionState.mode !== 'idle') {
        setInteractionState({ mode: 'idle' });
        setAnchorId(null);
      }
      setContextMenuState({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        target: { type: 'canvas' },
      });
    } else { 
      const isTargetSelected = currentSelectedIds.includes(targetId);
      
      if (!isTargetSelected) {
        setInteractionState({ mode: 'selecting', ids: [targetId] });
        setAnchorId(targetId);
        setContextMenuState({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          target: { type: 'component', ids: [targetId] },
        });
      } else {
        setContextMenuState({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          target: { type: 'component', ids: currentSelectedIds },
        });
      }
    }
  };

  return (
    // FIXED: The onContextMenu handler MUST be on the same element as the one that
    // needs to stop propagation to prevent the deselect click from firing.
    // Putting it here ensures it captures all right-clicks within the canvas area.
    <div className={styles.canvasContainer} onClick={handleContainerClick} onContextMenu={handleContextMenu}>
      <div className={styles.formCard} onClick={handleCanvasClick}>
        <div className={styles.formCardHeader}><h2>{screenName}</h2></div>
        <div className={styles.canvasDroppableArea}>
          {rootId && <CanvasNode componentId={rootId} />}
        </div>
      </div>
      <FloatingSelectionToolbar />
    </div>
  );
};