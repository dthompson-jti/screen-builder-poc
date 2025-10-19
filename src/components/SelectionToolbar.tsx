// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes, useState } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { isPropertiesPanelVisibleAtom, selectedCanvasComponentIdsAtom } from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../data/historyAtoms';
import { Tooltip } from './Tooltip';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';
import styles from './SelectionToolbar.module.css';
import { CanvasComponent } from '../types';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, onRename, onNudge, listeners }: SelectionToolbarProps) => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedComponent: CanvasComponent | null = selectedIds.length === 1 ? allComponents[selectedIds[0]] : null;
  const canUnwrap = selectedComponent?.componentType === 'layout' && selectedComponent.children.length > 0;
  const canRename = selectedComponent?.componentType === 'widget' || selectedComponent?.componentType === 'field';

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);
  };

  const handleWrapClick = () => {
    if (selectedIds.length === 0) return;
    const firstSelected = allComponents[selectedIds[0]];
    if (!firstSelected) return;

    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } },
      message: `Wrap ${selectedIds.length} component(s)`
    });
    setIsMenuOpen(false);
  };

  const handleUnwrapClick = () => {
    if (!canUnwrap || !selectedComponent) return;
    commitAction({
      action: { type: 'COMPONENT_UNWRAP', payload: { componentId: selectedComponent.id } },
      message: `Unwrap container`
    });
    setIsMenuOpen(false);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename();
  };

  return (
    <div className={styles.selectionToolbar}>
      <Tooltip content="Drag to reorder">
        <div className={styles.toolbarDragHandle} {...listeners} aria-label="Drag to reorder">
          <span className="material-symbols-rounded">drag_indicator</span>
        </div>
      </Tooltip>

      <div className={styles.toolbarActions} onMouseDown={(e) => e.stopPropagation()}>
        {canRename && (
          <Tooltip content="Rename (Enter)">
            <button className="btn btn-tertiary on-solid" aria-label="Rename component" onClick={handleRenameClick}>
              <span className="material-symbols-rounded">drive_file_rename_outline</span>
            </button>
          </Tooltip>
        )}
        <Tooltip content="Settings">
          <button className="btn btn-tertiary on-solid" aria-label="Component settings" onClick={handleSettingsClick}>
            <span className="material-symbols-rounded">settings</span>
          </button>
        </Tooltip>
        <div className={styles.toolbarDivider} />
        <Tooltip content="More actions">
          <button className="btn btn-tertiary on-solid" onClick={() => setIsMenuOpen(p => !p)} aria-label="More actions">
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
        </Tooltip>
      </div>
      {isMenuOpen && (
        <SelectionToolbarMenu 
          onClose={() => setIsMenuOpen(false)}
          onWrap={handleWrapClick}
          onUnwrap={handleUnwrapClick}
          onDelete={onDelete}
          onNudge={onNudge}
          canUnwrap={canUnwrap}
        />
      )}
    </div>
  );
};