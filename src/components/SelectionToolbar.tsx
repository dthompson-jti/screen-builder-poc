// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import { useSetAtom } from 'jotai';
import { isPropertiesPanelVisibleAtom } from '../data/atoms';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, listeners }: SelectionToolbarProps) => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleSettingsClick = () => {
    setIsPropertiesPanelVisible(true);
  };

  return (
    <div className={styles.selectionToolbar}>
      <div className={styles.toolbarDragHandle} {...listeners} aria-label="Drag to reorder">
        <span className="material-symbols-rounded">drag_indicator</span>
      </div>
      <div className={styles.toolbarDivider} />
      <button className={styles.btnOnSolid} aria-label="Component settings" onClick={handleSettingsClick}>
        <span className="material-symbols-rounded">settings</span>
        <span>Settings</span>
      </button>
      <button className={styles.btnOnSolid} aria-label="Duplicate component">
        <span className="material-symbols-rounded">content_copy</span>
      </button>
      <button className={styles.btnOnSolid} onClick={onDelete} aria-label="Delete component">
        <span className="material-symbols-rounded">delete</span>
      </button>
      <button className={styles.btnOnSolid} aria-label="More component options">
        <span className="material-symbols-rounded">more_vert</span>
      </button>
    </div>
  );
};