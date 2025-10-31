// src/features/Editor/CanvasUI.tsx
import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ClientRect } from '@dnd-kit/core';
import { selectedCanvasComponentIdsAtom, canvasInteractionAtom, selectionAnchorIdAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { ActionToolbar } from '../../components/ActionToolbar';
import { useCanvasActions } from './useCanvasActions';
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

export const FloatingMultiSelectToolbar = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const { handleDelete, handleWrap } = useCanvasActions(selectedIds);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const setAnchorId = useSetAtom(selectionAnchorIdAtom);

  if (selectedIds.length <= 1) {
    return null;
  }

  const handleClearSelection = () => {
    setInteractionState({ mode: 'idle' });
    setAnchorId(null);
  };

  return (
    <ActionToolbar mode="fixed">
      <Tooltip content="Clear selection">
        <Button variant="on-solid" size="s" iconOnly onClick={handleClearSelection} aria-label="Clear selection">
          <span className="material-symbols-rounded">close</span>
        </Button>
      </Tooltip>
      <span className={styles.floatingToolbarText}>{selectedIds.length} selected</span>
      <div className={styles.floatingToolbarDivider} />
      <Button variant="on-solid" size="s" iconOnly onClick={handleWrap} aria-label="Wrap in container">
        <span className="material-symbols-rounded">add_box</span>
      </Button>
      <Tooltip content="Repath items (Coming Soon)">
        <Button variant="on-solid" size="s" iconOnly aria-label="Repath selected components" disabled>
          <span className="material-symbols-rounded">alt_route</span>
        </Button>
      </Tooltip>
      <Button variant="on-solid" size="s" iconOnly onClick={handleDelete} aria-label="Delete selected components">
        <span className="material-symbols-rounded">delete</span>
      </Button>
    </ActionToolbar>
  );
};