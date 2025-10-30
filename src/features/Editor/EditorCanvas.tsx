// src/features/Editor/EditorCanvas.tsx
import React, { useRef } from 'react';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
// FIX: Corrected typo from '@d-kit/core' to '@dnd-kit/core'.
import { useDroppable } from '@dnd-kit/core';
import {
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom,
  selectionAnchorIdAtom,
  overDndIdAtom,
  selectedCanvasComponentIdsAtom,
} from '../../data/atoms';
import { rootComponentIdAtom, formNameAtom } from '../../data/historyAtoms';
import { useEditorHotkeys } from '../../data/useEditorHotkeys';
import { useAutoScroller } from '../../data/useAutoScroller';

import { CanvasNode } from './CanvasNode';
import { FloatingMultiSelectToolbar } from './CanvasUI';
import { CanvasContextMenu } from './CanvasContextMenu';

import styles from './EditorCanvas.module.css';

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
    if (interactionState.mode !== 'selecting' || interactionState.ids[0] !== rootId || interactionState.ids.length > 1) {
      setInteractionState({ mode: 'selecting', ids: [rootId] });
      setIsPropertiesPanelVisible(true);
      setAnchorId(rootId);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (interactionState.mode !== 'idle') {
        setInteractionState({ mode: 'idle' });
        setAnchorId(null);
      }
    }
  };

  const isOverBackground = overId === CANVAS_BACKGROUND_ID;
  const isRootSelected = selectedIds.length === 1 && selectedIds[0] === rootId;

  const formCardClasses = [
    styles.formCard,
    isOverBackground ? styles.isBackgroundTarget : '',
    isRootSelected ? styles.isRootSelected : '',
  ].filter(Boolean).join(' ');

  return (
    <CanvasContextMenu>
      <div ref={setMergedRefs} className={styles.canvasContainer} onClick={handleBackgroundClick}>
        <div className={formCardClasses} onClick={handleCanvasClick}>
          <div className={styles.formCardHeader}>
            <h2>{screenName}</h2>
          </div>
          <div className={styles.canvasDroppableArea}>
            {rootId && <CanvasNode componentId={rootId} />}
          </div>
        </div>
        <FloatingMultiSelectToolbar />
      </div>
    </CanvasContextMenu>
  );
};