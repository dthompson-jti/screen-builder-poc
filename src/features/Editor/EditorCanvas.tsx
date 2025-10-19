// src/features/Editor/EditorCanvas.tsx
import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { 
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom,
} from '../../data/atoms';
import { rootComponentIdAtom, formNameAtom } from '../../data/historyAtoms';
import { useEditorHotkeys } from '../../data/useEditorHotkeys';

// Import the refactored components
import { CanvasNode } from './CanvasNode';
import { FloatingSelectionToolbar } from './CanvasUI';

import styles from './EditorCanvas.module.css';

// --- MAIN COMPONENT ---
export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  
  useEditorHotkeys();

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteractionState({ mode: 'selecting', ids: [rootId] });
    setIsPropertiesPanelVisible(true);
  };

  const handleContainerClick = () => setInteractionState({ mode: 'idle' });

  return (
    <div className={styles.canvasContainer} onClick={handleContainerClick}>
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