// src/features/Editor/CanvasUI.tsx
import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ClientRect } from '@dnd-kit/core';
import { 
    selectedCanvasComponentIdsAtom,
    canvasInteractionAtom,
} from '../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../../data/historyAtoms';
import { Tooltip } from '../../components/Tooltip'; 
import { Button } from '../../components/Button';

import styles from './EditorCanvas.module.css';

// --- UI ARTIFACTS ---
interface DropPlaceholderProps {
    viewportRect: ClientRect; 
    isGrid: boolean; 
    parentRect: DOMRect | undefined;
}

export const DropPlaceholder = ({ placeholderProps }: { placeholderProps: DropPlaceholderProps }) => {
  const { viewportRect, isGrid, parentRect } = placeholderProps;
  if (!parentRect) return null;

  const placeholderStyle: React.CSSProperties = {
    top: `${viewportRect.top - parentRect.top}px`,
    left: `${viewportRect.left - parentRect.left}px`,
    width: `${viewportRect.width}px`,
  };
  
  if (isGrid) {
    placeholderStyle.height = `${viewportRect.height}px`;
  }
  
  const className = `${styles.dropPlaceholder} ${isGrid ? styles.isGrid : ''}`;
  return <div className={className} style={placeholderStyle} />;
};

export const FloatingSelectionToolbar = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const interactionState = useAtomValue(canvasInteractionAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);

  const handleWrap = () => {
    if (selectedIds.length === 0) return;
    const firstSelected = allComponents[selectedIds[0]];
    if (!firstSelected) return;
    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } },
      message: `Wrap ${selectedIds.length} component(s)`
    });
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: selectedIds } },
      message: `Delete ${selectedIds.length} components`
    });
    setInteractionState({ mode: 'idle' });
  };

  if (interactionState.mode !== 'selecting' || interactionState.ids.length <= 1) {
    return null;
  }

  return (
    <div className={`${styles.floatingSelectionToolbar} anim-fadeIn`}>
      <span className={styles.floatingToolbarText}>{selectedIds.length} selected</span>
      <div className={styles.floatingToolbarDivider} />
      <Button variant="on-solid" size="s" onClick={handleWrap} aria-label="Wrap in container">
        <span className="material-symbols-rounded">add_box</span>
      </Button>
      <Tooltip content="Repath items (Coming Soon)">
        <Button variant="on-solid" size="s" aria-label="Repath selected components" disabled>
          <span className="material-symbols-rounded">alt_route</span>
        </Button>
      </Tooltip>
      <Button variant="on-solid" size="s" onClick={handleDelete} aria-label="Delete selected components">
        <span className="material-symbols-rounded">delete</span>
      </Button>
    </div>
  );
};