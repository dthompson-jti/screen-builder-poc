// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isPropertiesPanelVisibleAtom, selectedCanvasComponentIdsAtom } from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../data/historyAtoms';
import { Tooltip } from './Tooltip';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, listeners }: SelectionToolbarProps) => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };
  
  const handleWrapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.length === 0) return;
    const firstSelected = allComponents[selectedIds[0]];
    if (!firstSelected) return;

    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } },
      message: `Wrap ${selectedIds.length} component(s)`
    });
  };

  return (
    <div className={styles.selectionToolbar}>
      <Tooltip content="Drag to reorder">
        <div className={styles.toolbarDragHandle} {...listeners} aria-label="Drag to reorder">
          <span className="material-symbols-rounded">drag_indicator</span>
        </div>
      </Tooltip>
      <div className={styles.toolbarDivider} />

      <div className={styles.toolbarActions} onMouseDown={(e) => e.stopPropagation()}>
        <Tooltip content="Settings">
          <button className="btn btn-tertiary on-solid" aria-label="Component settings" onClick={handleSettingsClick}>
            <span className="material-symbols-rounded">settings</span>
          </button>
        </Tooltip>
        <Tooltip content="Wrap in container">
          <button className="btn btn-tertiary on-solid" onClick={handleWrapClick} aria-label="Wrap in container">
            {/* Change wrap in container icon to 'pageless' icon */}
            <span className="material-symbols-rounded">pageless</span>
          </button>
        </Tooltip>
        <Tooltip content="Delete">
          <button 
            className="btn btn-tertiary on-solid"
            onClick={handleDeleteClick} 
            aria-label="Delete component"
          >
            <span className="material-symbols-rounded">delete</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};