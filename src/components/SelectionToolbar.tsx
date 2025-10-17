// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isPropertiesPanelVisibleAtom, selectedCanvasComponentIdsAtom } from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../data/historyAtoms';
import { Tooltip } from './Tooltip';
import styles from './SelectionToolbar.module.css';
import { CanvasComponent } from '../types';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, listeners }: SelectionToolbarProps) => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);

  // NEW: Determine if the selected component can be unwrapped
  const selectedComponent: CanvasComponent | null = selectedIds.length === 1 ? allComponents[selectedIds[0]] : null;
  const canUnwrap = selectedComponent?.componentType === 'layout' && selectedComponent.children.length > 0;

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

  // NEW: Handler for unwrap
  const handleUnwrapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canUnwrap || !selectedComponent) return;
    commitAction({
      action: { type: 'COMPONENT_UNWRAP', payload: { componentId: selectedComponent.id } },
      message: `Unwrap container`
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
            <span className="material-symbols-rounded">pageless</span>
          </button>
        </Tooltip>
        {/* NEW: Unwrap button */}
        {canUnwrap && (
          <Tooltip content="Unwrap container">
            <button className="btn btn-tertiary on-solid" onClick={handleUnwrapClick} aria-label="Unwrap container">
              <span className="material-symbols-rounded">layers_clear</span>
            </button>
          </Tooltip>
        )}
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