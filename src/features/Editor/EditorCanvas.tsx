// src/features/Editor/EditorCanvas.tsx
import React, { useRef } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { useDroppable } from '@dnd-kit/core';
import { 
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom,
  selectionAnchorIdAtom,
  overDndIdAtom,
  selectedCanvasComponentIdsAtom, // Import selector atom
} from '../../data/atoms';
import { rootComponentIdAtom, formNameAtom } from '../../data/historyAtoms';
import { useEditorHotkeys } from '../../data/useEditorHotkeys';
import { useAutoScroller } from '../../data/useAutoScroller';

import { CanvasNode } from './CanvasNode';
import { FloatingSelectionToolbar } from './CanvasUI';
import { CanvasContextMenu } from './CanvasContextMenu';

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

const CANVAS_BACKGROUND_ID = '--canvas-background--';

export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const setAnchorId = useSetAtom(selectionAnchorIdAtom);
  const overId = useAtomValue(overDndIdAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setBackgroundNodeRef } = useDroppable({ id: CANVAS_BACKGROUND_ID });

  const setMergedRefs = (node: HTMLDivElement | null) => {
    canvasContainerRef.current = node;
    setBackgroundNodeRef(node);
  };

  useEditorHotkeys();
  useAutoScroller(canvasContainerRef);

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteractionState({ mode: 'selecting', ids: [rootId] });
    setIsPropertiesPanelVisible(true);
    setAnchorId(rootId);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setInteractionState({ mode: 'idle' });
      setAnchorId(null);
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    const targetId = findComponentId(e.target as HTMLElement);
    const currentSelectedIds = interactionState.mode === 'selecting' ? interactionState.ids : [];
    const isTargetAlreadySelected = targetId ? currentSelectedIds.includes(targetId) : false;

    // If we right-click a new item, it becomes the sole selection.
    if (targetId && !isTargetAlreadySelected) {
      setInteractionState({ mode: 'selecting', ids: [targetId] });
      setAnchorId(targetId);
    } else if (!targetId) {
      // If we right-click the background, clear selection if one exists.
      if (currentSelectedIds.length > 0) setInteractionState({ mode: 'idle' });
    }
    // If right-clicking an already selected item, the selection is maintained.
  };

  const isOverBackground = overId === CANVAS_BACKGROUND_ID;
  const isRootSelected = selectedIds.length === 1 && selectedIds[0] === rootId;

  const formCardClasses = [
    styles.formCard,
    isOverBackground ? styles.isBackgroundTarget : '',
    isRootSelected ? styles.isRootSelected : '',
  ].filter(Boolean).join(' ');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <CanvasContextMenu>
        <div 
            ref={setMergedRefs} 
            className={styles.canvasContainer} 
            onClick={handleBackgroundClick} 
            onContextMenu={handleContextMenu}
        >
            <div ref={canvasRef} className={formCardClasses} onClick={handleCanvasClick}>
                <div className={styles.formCardHeader}><h2>{screenName}</h2></div>
                <div className={styles.canvasDroppableArea}>
                {rootId && <CanvasNode componentId={rootId} />}
                </div>
            </div>
            <FloatingSelectionToolbar />
        </div>
    </CanvasContextMenu>
  );
};