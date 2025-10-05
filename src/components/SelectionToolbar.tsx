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

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };
  
  const handleDisabledClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.selectionToolbar}>
      {/*
        FIX 1: The drag listeners are NOW APPLIED ONLY to the drag handle.
        This makes the drag handle the only part of the toolbar that can
        initiate a drag, matching the user's expectation.
      */}
      <div className={styles.toolbarDragHandle} {...listeners} aria-label="Drag to reorder">
        <span className="material-symbols-rounded">drag_indicator</span>
      </div>
      <div className={styles.toolbarDivider} />

      {/*
        FIX 2: This new wrapper acts as the "firewall".
        Its onMouseDown handler stops event propagation, preventing any clicks
        on the buttons inside from ever being seen by the parent's dnd-kit listeners.
        This makes the buttons 100% reliable.
      */}
      <div className={styles.toolbarActions} onMouseDown={(e) => e.stopPropagation()}>
        <button className="btn btn-tertiary on-solid" aria-label="Component settings" onClick={handleSettingsClick}>
          <span className="material-symbols-rounded">settings</span>
          <span>Settings</span>
        </button>
        <button className="btn btn-tertiary on-solid" onClick={handleDisabledClick} aria-label="Duplicate component">
          <span className="material-symbols-rounded">content_copy</span>
        </button>
        <button 
          className="btn btn-tertiary on-solid"
          onClick={handleDeleteClick} 
          aria-label="Delete component"
        >
          <span className="material-symbols-rounded">delete</span>
        </button>
        <button className="btn btn-tertiary on-solid" onClick={handleDisabledClick} aria-label="More component options">
          <span className="material-symbols-rounded">more_vert</span>
        </button>
      </div>
    </div>
  );
};